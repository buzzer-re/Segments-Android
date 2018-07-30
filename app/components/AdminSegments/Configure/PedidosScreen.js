import React, { Component } from 'react';
import { StyleSheet,ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { Container, Text, List, Content,ListItem } from 'native-base';
import BleManager from 'react-native-ble-manager';
import { bytesToString, stringToBytes } from 'convert-string';
import bigInt from 'big-integer';
import { CheckBox, Card	 } from 'react-native-elements';

const PENDING_SERVICE_UUID = "98aab6e5-4b4b-4760-91b8-46b1f3615340";
const PENDING_CHAR_UUID    = "1025d294-6f7b-4710-8197-21bba467c50d";
const PENDING_UPDATE_SERVICE_UUID  = "ae36d807-91ad-4015-8367-14e558b6883a";
const PENDING_UPDATE_CHAR_UUID = "78654110-bbdc-4e59-897f-71b63712843d";

class PedidosScreen extends Component {
	constructor(props) {
		super(props);
		this.state = {
			device: this.props.screenProps.device,
			products: this.props.screenProps.cards,
			pendings: [],
			loading: true,
			pendingWaitCacheList: [],
			blocksCached: new Map(),
			status: 'Carregando pedidos...'
		};
		this.getPendings = this.getPendings.bind(this);
		this.startPending = this.startPending.bind(this);
		this.acceptPending = this.acceptPending.bind(this);
		this.sendToWaitList = this.sendToWaitList.bind(this);
		this.sendToRejectList = this.sendToRejectList.bind(this);
		this.acceptPending = this.acceptPending.bind(this);
		
		this.loadCache = this.loadCache.bind(this);
		this.checkPay  = this.checkPay.bind(this);
	}

	componentWillUnmount() {
		clearInterval(this.state.interval);
	}

	componentDidMount() {
		this.loadCache();
		this.startPending(true);

		this.state.interval = setInterval(this.checkPay, 5000);
	}


	checkPay = () => {
		let lastBlock = global.walletService.getLastBlock();
		if (lastBlock != '') {
			let origin = lastBlock.getOrigin();
			console.log('Origin ', origin);
			let paid = origin.account != undefined ? origin.account : origin ;//JSON.parse(lastBlock.getEntireJSON()).extras.origin.account;
			let amount = lastBlock.getAmount();
	    let rai = amount.divide('1000000000000000000000000');
	    rai = parseFloat(rai/1000000);
			let pendingList = this.state.pendingWaitCacheList;
			let blocksCached = this.state.blocksCached;
			for ( let i = 0; i < pendingList.length; i++ ) {
				if (!blocksCached.has(lastBlock.getHash(true)) && pendingList[i].user_pub_key == paid && parseFloat(pendingList[i].price) == rai) {
					let blocks = this.state.blocksCached;
					pendingList[i].hash = this.state.device.hash;
					blocks.set(lastBlock.getHash(true), pendingList[i]);
					global.storage.save({
						key: 'paidBlocks',
						data: blocks,
					}).then((ok) => {
						console.log('Blocks cache updated');
						console.log('Cache completly updated');
						Alert.alert('Pago', `Pedido da mesa ${pendingList[i].mesa} pago!`);
						this.setState({
							blocksCached: blocks,
							pendingWaitCacheList: pendingList
						})
					}).catch((err) => {
						console.log('Error on save blocks cache ', err);
					});
					break;
				}	
			}
		}
	}

	loadCache = () => {
		/* Loading pendings cached */
		global.storage.load({
			key: 'adminPendings'
		}).then((pendings) => {
			this.setState({
				pendingWaitCacheList: pendings
			});
			console.log('Load cache ', pendings);
		}).catch((err) =>  {
			console.log("Cant load ", err);
		});
		/* Load transaction blocks cached */
		global.storage.load({
			key: 'paidBlocks'
		}).then((blocksCached) => {
			blocksCached = new Map(blocksCached._mapData);
			this.setState({
				blocksCached: blocksCached,
			});
			console.log('Loaded chace Blocks', blocksCached);
		}).catch((err) => {
			console.log('Cant Load ', err);
		})
	}

	getPendings = async (pendings, service, characther) => {
		let device = this.state.device;
		let jsonResponse = [];
		jsonResponse = await BleManager.read(device.id, service, characther).then((pendingByteArray) => {
				if (pendingByteArray[pendingByteArray.length-1] <= 7 ) {
					pendingByteArray.splice(pendingByteArray.length-1, 1);
				}

				pendings += bytesToString(pendingByteArray);

				if (pendings.substr(pendings.length-2) == '}]' || pendings == '[]' ) {
					let json = JSON.parse(pendings);
					return json;
				} else {
					return this.getPendings(pendings,service, characther)
				}
			}).catch((err) => {
				console.log(err);
				return [];
			}); 

		return jsonResponse;
	}

	startPending = async (pendingWait = false ) => {
		let pendings = await this.getPendings("",PENDING_SERVICE_UUID,PENDING_CHAR_UUID);
		let pendingWaitList;
		if (pendingWait)
			pendingWaitList = await this.getPendings("", PENDING_UPDATE_SERVICE_UUID, PENDING_UPDATE_CHAR_UUID);
		else
			pendingWaitList = this.state.pendingWaitCacheList;

		if (pendings == undefined) pendings = [];
		 
		for ( let i = 0; i < pendings.length; i++ ) {
			for ( let j = 0; j < pendingWaitList.length; j++ ) {
				if (pendingWaitList[j].id == pendings[i].id) {
					pendings.splice(i,1);
				}
			}
		}
		console.log(pendings);

		for ( pedi of pendings ) {
			pedi.names = "";
			for ( let i = 0; i < pedi.pendings.length; i++ ) {
				for ( let j = 0; j < this.state.products.length; j++ ) {
					if (pedi.pendings[i] == this.state.products[j].hash) {
						pedi.names += `${this.state.products[j].name}, `;
					}
				}
			}
		}


		this.setState({pendings, loading: false});
		setTimeout(this.startPending, 3000);
	}

	sendToWaitList = (pending) => {
		this.setState({
			status: 'Enviando para esperar pagamento...',
			loading: true,
		})
		let pendingList = this.state.pendingWaitCacheList;;
		let device = this.state.device;
		pendingList.push(pending);
		const pendingByteArray = stringToBytes(JSON.stringify(pending));
		console.log('Pending List ', pendingList);
		BleManager.write(device.id, PENDING_UPDATE_SERVICE_UUID, PENDING_UPDATE_CHAR_UUID, pendingByteArray).then(() => {
			let pendings = this.state.pendings;

			for ( let i = 0; i < pendings.length; i++ ) {
				if (pendings[i].id == pending.id) {
					pendings.splice(i, 1);
					break;
				}
			}
			global.storage.save({
				key: 'adminPendings',
				data: pendingList
			}).then((saved) => {
				console.log('Saved pending List on cache!');
				this.setState({
					loading: false.
					pendings,
					pendingWaitCacheList: pendingList
				});
				console.log('New pending list -> ', this.state.pendingWaitCacheList);
				Alert.alert('Sucesso', 'Pedido confirmado, esperando pagamento...');
			}).catch((err) => {
				console.log("Err => ", err);
			})
		})
	}

	sendToRejectList = (pending) => {

	}

	acceptPending = (pending) => {
		let self = this;
		Alert.alert(
		  `Mesa ${pending.mesa}`,
		  `Pedido: ${pending.names.slice(0,-2)}`,
		  [
		    {text: 'Aceitar', onPress: () => {self.sendToWaitList(pending)}},
		    {text: 'Rejeitar',onPress: () => {self.sendToRejectList(pending)}},
		    {text: 'Cancelar',onPress: () => {}},
		  ],
		  { cancelable: false }
		)
	}

	render() {
		if (this.state.loading) return (
		<Container style={{flex:1,justifyContent:'center',alignItems:'center'}}>
            <ActivityIndicator size="large" color="#b2bec3" />
             <Text style={{padding:30,color: 'white'}}>{this.state.status}</Text>
     </Container>
		);
		if (this.state.pendings.length <= 0) return (
		<Container style={{flex:1,justifyContent:'center',alignItems:'center'}}>
            <Text style={{padding:30,color: 'white'}}>Sem pedidos no momento!</Text>
     </Container>
		)
		return (
			<Container style={styles.container}>
				<Content>
					{

						this.state.pendings.map((pending, i) => (
							<TouchableOpacity key={i} onPress={() => {this.acceptPending(pending)}} >
									<Card>
										  <Text style={{marginBottom: 10}}>
										    Pedido na mesa {pending.mesa}
										  </Text>
									</Card>
								</TouchableOpacity>							
						))
				}
				</Content>
			</Container>	
		)
	}
}

const styles = StyleSheet.create({
	container: {
		flex:1,
	},
})
export default PedidosScreen;