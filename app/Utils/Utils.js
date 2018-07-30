import { Alert } from 'react-native';
import BleManager from 'react-native-ble-manager';
import { stringToBytes } from 'convert-string';
const RESET_SERVICE_UUID = "6c678185-7d56-471c-aed0-8e6ff75230f5";
const RESET_CHAR_UUID  = "b55bfe49-9ef9-47f8-94c5-613dba4724e1";

export const resetOptions = () => {
    Alert.alert(
      'Resetar',
      'Escolha sua opção de reset',
      [
        {text: 'Resetar carteira', onPress: () => resetWallet()},
        {text: 'Resetar Segments',onPress: () => resetAll()},
        {text: 'Apagar pedidos & Segments Info', onPress: () => deletePendingCache()},
        {text: 'Resetar Segments + Hardware reset',onPress: () => { resetEsp();resetAll() } },
        {text: 'Resetar Hardware',onPress: () => resetEsp()},
      ].reverse(),
      { cancelable: true }
    )
}

export const startSync = () => {
	Alert.alert(
		'Sincronizar',
		'Iniciar sincronizção na blockchain',
		[
			{text: 'Parar', onPress: () => {global.walletService.stopSync(); Alert.alert('Sucesso', 'Sync stop')}},
			{text: 'Iniciar', onPress: () => { global.walletService.startSync(); Alert.alert('Sucesso', 'Sync start')}}
		].reverse(),
		{ cancelable: true }
	)
}
export const resetAll = (alert = true) => {
	global.storage.remove({
		key: 'adminPendings',
	}).then(() => {}).catch((err) => {});
	global.storage.remove({
		key: 'segments',
	}).then(() => {}).catch((err) => {});

	global.storage.remove({
		key: 'cipheredWallet',
	}).then(() => {}).catch((err) => {});

	
	if (alert) Alert.alert('Sucesso', 'Dados apagados, por favor reinicie o app');
}

export const resetWallet = () => {
	global.storage.remove({
		key: 'cipheredWallet',
	}).then(() => {}).catch((err) => {});

	Alert.alert('Sucesso', 'Carteira resetada, por favor reinicie o app');
}


export const resetEsp = async () => {
	let device;
	await BleManager.getConnectedPeripherals([]).then((devices) => {
		if (devices.length >= 1) {
			device = devices[0];
			BleManager.retrieveServices(device.id).then((services) => {
				const payload = stringToBytes("1");
				BleManager.write(device.id,RESET_SERVICE_UUID, RESET_CHAR_UUID, payload).then(() => {
					Alert.alert('Sucesso', 'Segments resetado!');
				}).catch((err) => {
					console.log(err);
					Alert.alert('Error','Erro ao resetar');
				})
			})
		} else {
			Alert.alert('Error', 'Primeiro entre no Segments como admin!');
		}
	})
}

export const deletePendingCache = async () => {
	global.storage.remove({
		key: 'adminPendings'
	}).then(() => {}).catch((err) => {
		console.log(err);
	});
	global.storage.remove({
		key: 'segments',
	}).then(() => {}).catch((err) => {
		console.log(err);
	});
	Alert.alert('Sucesso', 'Pedidos apagados');
}