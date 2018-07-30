import React, { Component } from 'react';
import { View, Text, ActivityIndicator, NativeModules, NativeEventEmitter } from 'react-native';
import { Container } from 'native-base';

import BleManager from 'react-native-ble-manager';
import Buffer from 'buffer';
import { bytesToString, UTF8 }from 'convert-string';

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

const FOUND = 1;
const NOT_FOUND = 2;
const LOOKING = 3;

const SERVICE_INFO_UUID = "f7a036c9-603f-46bd-a832-6bc84a1d9298";
const CHAR_INFO_UUID = "9adcafc0-a1eb-4bea-a666-059a4876eb77";

const PRODUCT_SERVICE_UUID = "850b03cd-0b9c-4ed0-b894-71af216911c2";
const PRODUCT_CHAR_UUID  = "4a6f301d-8b8b-4c23-a8a4-e82637cb5cdd";

class SyncSegments extends Component {
	constructor(props) {

		super(props);
		this.state = {
			target: this.props.device,
			targetPair: null,
			status: 'Buscando...',
			code: LOOKING,
			pairTimes: 10,
		}

		this.syncBle = this.syncBle.bind(this);
		this.handleStop = this.handleStop.bind(this);
		this.scan = this.scan.bind(this);
		this.pairAndSync = this.pairAndSync.bind(this);

		this.getProducts = this.getProducts.bind(this);
	}

	componentDidMount() {
    this.handlerDiscover = bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', this.syncBle );
    this.handlerStop = bleManagerEmitter.addListener('BleManagerStopScan', this.handleStop );

    	if (this.props.noScan == undefined) this.scan();
    	else {
    		this.syncBle(this.state.target);
    	}
	}

	componentWillUnmount() {
		this.handlerDiscover.remove();
		this.handlerStop.remove();
	}
	
	syncBle = (device) => {
	  BleManager.enableBluetooth()
	  	.then(() => {
   		let target = this.state.target;
		if (device.id == target.id) {
			this.setState({
				status: `Pareando com ${device.name}`,
				targetPair: device,
				code: FOUND,
			})
			BleManager.stopScan().then(() => {
				BleManager.getConnectedPeripherals([]). /// CORTAR ESSA FUNCAO, TU JA SABE O DEVICE
					then((devices) => {
						console.log(devices);
						if (devices.length > 0) {
							BleManager.disconnect(devices[0].id)
							.then(() => {
								this.pairAndSync();
							}).catch((err) => {
								console.log('Disconnect ', err);
							})
						} else this.pairAndSync();
					}).catch((err) => {
						console.log(err);
						this.setState({
							status: 'Erro no pareamento'
						});
						this.props.back();
					})				
				
			}).catch((err) => {
				console.log('ERROR');
				console.log(err);
			})
		} 
	  	}).catch((err) => {
	  		this.setState({
	  			status: 'Por favor ative o seu bluetooth',
	  		});
	  		this.props.back();
	  	})
	}



	handleStop = () => {
		if (this.state.code != FOUND) {
			this.setState({
				code: NOT_FOUND,
				status: 'Verifique se seu segments esta ligado!'
			});
			this.props.back();
		}
	}


	scan = async () => {
		await BleManager.enableBluetooth()
			.then((ok) => {
				BleManager.scan([], 10, true)
					.then(() => {
						console.log('Scanning...');
					}).catch((err) => {
						console.log('Error: ');
						console.log(err);
					})
			}).catch(() => {
				this.setState({
					status: 'Por favor ative o seu bluetooth',
				});
				this.props.back();
			});
	}

	getProducts = async (products) => {
		let device = this.state.targetPair;
		let jsonResponse;
		jsonResponse = await BleManager.read(device.id, PRODUCT_SERVICE_UUID, PRODUCT_CHAR_UUID).then((productByteArray) => {
			if (productByteArray[productByteArray.length-1] <= 7) {
				productByteArray.splice(productByteArray.length-1, 1);
			}

			products += bytesToString(productByteArray);
			console.log(products);
			if ( (products.substr(products.length-2) == '}]') || products == '[]') {
				let json = JSON.parse(products);
				console.log(json);
				return json;
			} else {
				return this.getProducts(products);
			}
		}).catch((err) => {
			console.log(err);
			this.setState({
				status: 'Não foi possivel sincronizar, tente novamente'
			});
			this.props.back();
		});

		return jsonResponse;
	}

	pairAndSync = async () => {
		console.log('Starting pair...');
		let device = this.state.target;
		if (device != null) {
			let segmentsInfo;
			let productsInfo;
			console.log('Pareando com ')
			await BleManager.connect(device.id).then(() => {
				this.setState({
					status: 'Conectado, Sincronizando...'
				})
			}).catch((err) => {
				console.log(err);
				this.setState({
					status: 'Não foi possivel parear, tente novamente'
				});
				this.props.back();
			});

			await BleManager.retrieveServices(device.id).catch((err) => {
				console.log(err);
				this.setState({
					status: 'Não foi acessar os serviços'
				});
				this.props.back();
			});

			await BleManager.read(device.id, SERVICE_INFO_UUID, CHAR_INFO_UUID).then((deviceByteArray) => {
				segmentsInfo = JSON.parse(bytesToString(deviceByteArray));
			}).catch((err) => {
				console.log(err);
				this.setState({
					status: 'Não foi possivel ler os dados'
				});
				this.props.back();
			});

			if (segmentsInfo != undefined) {
				productsInfo = await this.getProducts("");
				let segments = new Object();
				segments.info = segmentsInfo;
				segments.info.id = device.id;
				segments.products = productsInfo;
				this.setState({
					status: 'Sincronizado'
				});
				this.props.onFind(segments);
			}
		}
		// Connect, get public info, update local storage, start the editing
	}

	render() {
		return (
		<Container style={{flex:1,justifyContent:'center',alignItems:'center'}}>
            <ActivityIndicator size="large" color="#b2bec3" />
             <Text style={{padding:30,color: 'white'}}>{this.state.status}</Text>
       </Container>
		)
	}
}


export default SyncSegments;