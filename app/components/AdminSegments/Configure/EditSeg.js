import React, { Component } from 'react';
import { Image, StyleSheet, View, TouchableOpacity, NativeModules, NativeEventEmitter } from 'react-native';
import { Container, Icon, Title,Header, Button, Left, Body, Right, Text } from 'native-base';

import ImagePicker from 'react-native-image-picker';
import ImageResizer from 'react-native-image-resizer';

import TabNavigator from './TabNavigator';
import ProductForm from './ProductForm';

import BleManager from 'react-native-ble-manager';
import { stringToBytes, bytesToString } from 'convert-string';
import crypto from 'crypto';

import { Overlay } from 'react-native-elements';


import * as Animatable from 'react-native-animatable';

const PRODUCT_SERVICE_UUID = "850b03cd-0b9c-4ed0-b894-71af216911c2";
const PRODUCT_CHAR_UUID  = "4a6f301d-8b8b-4c23-a8a4-e82637cb5cdd";


class EditSeg extends Component {
	constructor(props) {
		super(props);

		this.state = {
			deviceInfo: this.props.config.info,
			cards: this.props.config.products,
			modal: false,
			pendingWait: '',
		}
		console.log(this.state.deviceInfo);
		this.modal = this.modal.bind(this);
		this.addProduct = this.addProduct.bind(this);
		this.changeImage = this.changeImage.bind(this);
		this.addPending = this.addPending.bind(this);
		this.checkLastBlock = this.checkLastBlock.bind(this);
	}

	handleNotification = (data) => {
		console.log('Chegou isso aqui');
		console.log(data);
	}
 
	addPending = async (pending) => {
		global.storage.load({
			key: 'pendings'
		}).then((pendings) => {
			pendings = new Map(pendings._mapData);

			pendings.set(pending.pub_key, pending);
			global.storage.save({
				key: 'pendings',
				data: pendings
			}).then((pend) => {
				console.log('Saved new pending');
			})
		}).catch((err) => {
			let pendings = new Map();
			global.storage.save({
				key: 'pendings',
				data:pendings
			}).then(() => {
				console.log('New pending cache created');
			})
		})
	}

	checkLastBlock = () => {

	}

	componentWillUnmount() {
		clearInterval(this.state.interval);
	}

	addProduct =  async (product) => {
		let device = this.state.deviceInfo;
		let newProduct = new Object();
		let cards = this.state.cards;
		newProduct.name = product.name;
		newProduct.hash = crypto.randomBytes(8).toString('hex');
		newProduct.ownerHash = device.hash;
		newProduct.price = product.price;
		newProduct.nanoPrice = product.nanoPrice;
		newProduct.imageUri = product.logo;
		newProduct.imageData = product.imageData;

		const productByteArray = stringToBytes(JSON.stringify(newProduct));
		console.log(device);
		console.log(newProduct);
		await BleManager.write(device.id, PRODUCT_SERVICE_UUID,PRODUCT_CHAR_UUID, productByteArray)
			.then(() => {
				console.log('Writed!');
				cards.push(newProduct);
			}).catch((err) => {
				console.log('Error on write');
				console.log(err);
			})

		this.setState({cards});
		this.modal();
	}

	modal = () => {
		let modal = !this.state.modal
		this.setState({modal});
	}

	changeImage = () => {
    ImagePicker.showImagePicker(this.state.imageOptions, (response) => {
      if (response.didCancel) {
        // Tapped on cancel
      } else if (response.error) {
        // Some error
      } else  { // everything is fine, resize image and gets his b64 string
        ImageResizer.createResizedImage(response.uri, 800,600,'JPEG', 80).then((resize) => {
        	global.storage.load({
        		key: 'segments'
        	}).then((segments) => {
        		segments = new Map(segments._mapData);
        		let oldConf = segments.get(this.state.deviceInfo.hash);
        		oldConf.image = {uri: resize.uri};
        		segments.set(oldConf.hash, oldConf);
        		global.storage.save({
        			key:'segments',
        			data: segments
        		}).then(() => {
        			console.log('New Image saved');
        			this.setState({
        				deviceInfo: oldConf
        			})
        		})
        	})
        })
      }
      
    })
	}

	render() {
		return (
			<Container style={styles.container}>
				{
					this.state.modal ? (
							<Overlay isVisible={true} windowBackgroundColor="rgba(0, 0, 0, .5)" width="auto" height="80%">
						  	<Container style={overlayStyle.container}>
						  		<ProductForm modal={this.modal} addProduct={this.addProduct}/>
						  	</Container>
							</Overlay>
							
				) : 
				(
				<Container style={styles.imageBox}>
           <Header style={styles.header}>
              <Left>
                <Button transparent onPress={() => {
                    this.props.navigation.navigate('DrawerOpen');
                  }}>
                  <Icon name='menu' />
                </Button>
              </Left>
              <Body>
                <Title>{this.state.deviceInfo.name}</Title>
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
                  </Container>
              </Right>

            </Header>
				{ // Mudar a imagem na hora de configurar para null, para não fazer essa barbaridade abaixo
					typeof this.state.deviceInfo.image == 'object' ?
					(<Image onPress={this.changeImage} style={styles.image} source={this.state.deviceInfo.image}/>)
					:
					(<Image onPress={this.changeImage} style={styles.image} source={require('../../../assets/NoIMage.png')} />)
				}
					
					<TabNavigator screenProps={ { device:this.state.deviceInfo,modal: this.modal, cards: this.state.cards } }/>
				</Container>)
				}

			</Container>
		)
	}
}
const styles = StyleSheet.create({
	container: {
		flex: 1
	},
	imageBox: {
		flex: 1,
	},
	TouchBox: {
	 	flex: 4,
	  alignItems: 'center',
	  justifyContent: 'center',
	  padding: 5,
	  backgroundColor: 'transparent',
	 },
	image: {
		width: '100%',
		height: '30%'
	},
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
});

const overlayStyle = StyleSheet.create({
	container: {
		flex: 1,
	},
	title: {
		flex: 0.4,
		backgroundColor: 'red'
	}
})

export default EditSeg;