import React, { Component } from 'react';
import { Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Container, Icon, Title,Header, Button, Left, Body, Right, Text } from 'native-base';
import ProductsList from './ProductsList';

import BleManager from 'react-native-ble-manager';
import crypto from 'crypto';
import { stringToBytes, bytesToString } from 'convert-string';

import Car from './Car';
import IconShop from './IconShop';

const PENDING_SERVICE_UUID = "98aab6e5-4b4b-4760-91b8-46b1f3615340";
const PENDING_CHAR_UUID    = "1025d294-6f7b-4710-8197-21bba467c50d";

const PENDING_UPDATE_SERVICE_USER_UUID = "ecc318c0-7963-45ba-a582-4dcc77faebcd";
const PENDING_UPDATE_CHAR_USER_UUID = "491c64fb-8fb4-4a06-8f97-d5f5ee1efeac";

class Segments extends Component {
	constructor(props) {
		super(props);

		this.state = {
			config: null,
			segments : this.props.segments,
			wallet: this.props.wallet,
			pending: new Array(),
			pendingNum: 0,
			modal: false,
			view: null,
			pendingQueue: new Array(),
			sending: false,
			sendingNano:false,
			interval: null
		};
		this.addToCar = this.addToCar.bind(this);
		this.car  = this.car.bind(this);
		this.sendPending = this.sendPending.bind(this);	
		this.checkPendings = this.checkPendings.bind(this);
		this.getPendings = this.getPendings.bind(this);
		this.loadConfig = this.loadConfig.bind(this);
		this.finishTransaction = this.finishTransaction.bind(this);
	}

	componentWillUnmount() {
		if (this.state.interval != null) 
			clearInterval(this.state.interval);
	}

	componentDidMount() {

		let device = this.state.segments.info;
		console.log(this.state.segments);
		this.loadConfig();
		this.state.interval = setInterval(() => {
			this.checkPendings();	
		}, 5000);
	}

	loadConfig = () => {
		global.storage.load({
			key: this.state.segments.info.name
		}).then((info) => {
			info = new Map(info._mapData);
			this.setState({
				pendingQueue: info.get("pendings"),
			});
		}).catch((err) => {
			let info = new Map();
			info.set("pendings", new Array());
			global.storage.save({
				key: this.state.segments.info.name,
				data: info
			}).then((info) =>{
				console.log('Saved new config!');
			})
		})
	}

	addToCar = (map) => {
		console.log(map);
		let pending = this.state.pending;
		pending = Array.from(map.values());
		this.setState({
			pendingNum: pending.length,
			pending
		});
	}

	car = () => {
		if (this.state.pendingNum > 0 && !this.state.sending) {
			let modal = !this.state.modal;
			this.setState({
				modal,
				view: <Car close={this.car} pending={this.state.pending} onFinish={this.sendPending}/>
			});
		}
	}

	getPendings = async (pendings, service, characther) => {
		let device = this.state.segments.info;
		let jsonResponse;
		jsonResponse = await BleManager.read(device.id, String(service), String(characther)).then((pendingByteArray) => {
			if (pendingByteArray[pendingByteArray.length-1] <= 7 ) {
				pendingByteArray.splice(pendingByteArray.length-1, 1);
			}

			pendings += bytesToString(pendingByteArray);

			if (pendings.substr(pendings.length-2) == '}]' || pendings == '[]' ) {
				let json = JSON.parse(pendings);
				return json;
			} else {
				return this.getPendings(pendings,service, characther);
			}
		}).catch((err) => {
			console.log(err);
		});

		return jsonResponse;
	}

	checkPendings = async () => {
		if (!this.state.sending) {
			let pendingsWait = await this.getPendings("",PENDING_UPDATE_SERVICE_USER_UUID,PENDING_UPDATE_CHAR_USER_UUID);
			let pendingQueue = this.state.pendingQueue;
			let sendingNano  = this.state.sendingNano;
			if (pendingsWait == undefined) pendingsWait = new Array();
			if (pendingsWait.length > 0 && !sendingNano) {
				for( let i = 0; i < pendingQueue.length; i++ ) {
					for ( let j = 0; j < pendingsWait.length; j++ ) {
						if (pendingQueue[i].id == pendingsWait[j].id) {
							Alert.alert(
							  'Pedido aprovado',
							  'Sua transação sera processada e dentro de segundos confirmada!',
							);
							console.log('Olá mundo');
							this.setState({sendingNano:true});
							this.finishTransaction();
							return ;
						}
					} 
				}
			}
		}	
	}

	sendPending = async (pending) => {
		if (this.state.pendingQueue.length > 0) {
			Alert.alert('Pedido não confirmado', 'Espere o seu atual pedido ser confirmado para realizar outro!');
			this.setState({
				modal: false,
			});
			return ;
		}
		this.setState({
			sending: true
		});
		let device = this.state.segments.info;
		let pendingRequest = new Object();
		pendingRequest.pendings = new Array();
		pendingRequest.user_pub_key = this.state.wallet.getAccounts()[0].account;
		pendingRequest.id = crypto.randomBytes(4).toString('hex'); // pending ID
		pendingRequest.mesa = parseInt(Math.random() * 15);
		pendingRequest.price = pending.price;

		for (ped of pending) {
			pendingRequest.pendings.push(ped.hash);
		}
		console.log('Pedido a ser enviado ', pendingRequest);
		const pendingByteArray = stringToBytes(JSON.stringify(pendingRequest))
		BleManager.write(device.id,PENDING_SERVICE_UUID, PENDING_CHAR_UUID,pendingByteArray).then(() => {
			let pendingQueue = new Array();
			pendingQueue.push(pendingRequest);
			let map = new Map();
			map.set("pendings", pendingQueue);
			global.storage.save({
				key: this.state.segments.info.name,
				data: map
			}).then((saved) => {
				console.log('Saved pending on cache');
  			this.setState({
					pendingQueue,
					modal: false,
					sending: false,
					pending: new Array(),
					pendingNum: 0,
					sending: false,
				});
			})
			Alert.alert('Sucesso','Pedido enviado, esperando aprovação do admin!');
		}).catch((err) => {
			Alert.alert('Erro', 'Não foi possivel realizar o seu pedido, por favor tente novamente');
			this.setState({
				modal: false,
				sending: false,
			})
			console.log('Error on pending ', err);
		})
	}

	finishTransaction = async () => {
		let to = this.state.segments.info.pub_key;
		let amount = parseFloat(this.state.pendingQueue[0].price);
		if (to == this.state.wallet.getAccounts()[0].account) {
			Alert.alert('Error', 'Você não pode pagar para si mesmo!');
			return ;
		}
		let response = await global.walletService.sendNano(to, amount);
		console.log('coe');
		//return ;
		if (response) {
			Alert.alert('Sucesso', 'Transação concluida, aguarde seu pedido!');
			let info = new Map();
			info.set("pendings", new Array());
			this.setState({
				pendingQueue: new Array(),
				sendingNano: false
			});
			global.storage.save({
				key: this.state.segments.info.name,
				data: info
			}).then((info) =>{
				console.log('Saved new config!');
			})			
		} 
	}

	render() {
		if (this.state.modal) return this.state.view;
		return (
			<Container>
           <Header style={styles.header}>
              <Left>
                <Button transparent onPress={() => {
                    this.props.navigation.navigate('DrawerOpen');
                  }}>
                  <Icon name='menu' />
                </Button>
              </Left>
              <Body>
                <Title>{this.state.segments.info.name}</Title>
              </Body>
              <Right>
                <Container style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <Text onPress={this.goToWallet} style={{
                      color: 'white',
                      fontSize: 12,
                      padding: 10
                    }}>{global.nanoFunds} Nano / {global.nanoReal.toFixed(2)} R$</Text>
                    <TouchableOpacity onPress={this.car} style={styles.shoppingCart}>
                      <Text style={{color:'white', fontSize:12}}>{this.state.pendingNum}</Text>
                      <IconShop size={30} />
                    </TouchableOpacity>
                  </Container>
              </Right>

            </Header>
				{ // Mudar a imagem na hora de configurar para null, para não fazer essa barbaridade abaixo
					typeof this.state.segments.info.image == 'object' ?
					(<Image onPress={this.changeImage} style={styles.image} source={this.state.segments.info.image}/>)
					:
					(<Image onPress={this.changeImage} style={styles.image} source={require('../../assets/NoIMage.png')} />)
				}
					
				<ProductsList addToCar={this.addToCar} produtos={this.state.segments.products} />
			</Container>
		)
	}
}

const styles = StyleSheet.create({
  imageBox: {
    flex:1
  },
  image: {
    width: '100%',
    height: '30%'
  },
  header: {
    elevation: 0,
    shadowOpacity: 0,
    backgroundColor: 'transparent'
  },
  shoppingCart: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  }
})


export default Segments;