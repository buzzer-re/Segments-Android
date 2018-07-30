import React, { Component } from 'react';
import { AsyncStorage, View, StyleSheet, ImageBackground,AppState } from 'react-native';
import Spinner from 'react-native-loading-spinner-overlay';
import Storage from 'react-native-storage';
import '../shim.js';
import { Route } from './Config/Route';

import * as WalletFunctions from './NanoFunctions/Wallet';
import WalletService from './NanoFunctions/WalletService';

import  Unlock  from './components/Unlock/Unlock';
import Introduction from './components/Wallet/Introduction';
import CreateWallet from './components/Wallet/CreateWallet';
import { Wallet } from './rai-wallet';
import LinearGradient from 'react-native-linear-gradient';

import Car from './components/Segments/Car';

import BleManager from 'react-native-ble-manager';


import MySegments from './components/AdminSegments/MySegments';
import PedidosScreen from './components/AdminSegments/Configure/PedidosScreen';
class App extends Component{
  constructor(props) {
    super(props);
    this.state = {
      cipheredWallet: '',
      hasWallet: false,
      isLoading: true,
      unlocked: false,
      ble:true,
      interval: null,
      view: <Spinner textStyle={{color: '#FFF'}} />
    }
    this.checkWallet = this.checkWallet.bind(this);
    this.onUnlock = this.onUnlock.bind(this);
    const storage = new Storage({
      size: 1000,
      storageBackend: AsyncStorage,
      defaultExpires: null,
    })
    // globals
    global.storage = storage;
    global.nanoPrice = 1;
    global.nanoFunds = 0.00;
    global.nanoReal  = 0;
    global.imageApi  = 'http://x.x.x.x:8000/';

    this.handleAppStateChange = this.handleAppStateChange.bind(this);
    this.checkBle = this.checkBle.bind(this);
    this.getCurrencyPrice = this.getCurrencyPrice.bind(this);

    this.getCurrentFunds = this.getCurrentFunds.bind(this);
  }


  componentWillMount() {  
    this.checkWallet();
    this.getCurrencyPrice();
  }

  componentWillUnmount() {
    if (this.state.interval != null) clearInterval(this.state.interval);
  }

  componentDidMount() {
    global.storage.remove({
      key: 'cafess'
    }).then(() => {
      console.log('Cache cleaned');
    }).catch((err) => {
      console.log('err ', err);
    })
    AppState.addEventListener('change', this.handleAppStateChange);
    BleManager.start({showAlert:false})
      .then(() => {
        console.log('We eare ready to use Ble functions!');
        this.checkBle();
        this.setState({ble:true})
      }).catch(() => {
        this.setState({ble: false})
      })
  }

  checkBle = () => {
    BleManager.getConnectedPeripherals([])
      .then((devices) => {
        console.log(`Connected with ${devices.length} device`);
        if (devices.length != 0) {
          const peripheral = devices[0];
          console.log('Reconnecting to disconnect...');
          console.log(peripheral);
          BleManager.connect(peripheral.id)
            .then(() => {
              BleManager.disconnect(peripheral.id)
                .then((result) => {
                  console.log(result);
                  console.log('disconnected and ready to pair again!');
                }).catch((err) => {
                  console.log(`Error ${err}`);
                })
            })
        }
      })
  }
  handleAppStateChange = (nextAppState) => {
    if (nextAppState == 'background') {
      BleManager.getConnectedPeripherals([])
        .then((devices) => {
          console.log('Connected to ', devices.length);
        })
    }
  }

  getCurrencyPrice = async () => {
    fetch('https://api.coinmarketcap.com/v2/ticker/?convert=NANO&limit=1')
      .then((response) => response.json())
      .then(responseJson => {
        let response = responseJson.data['1'];
        let btcPrice = response.quotes.USD.price;
        let nanPrice = response.quotes.NANO.price;
        let dollar   = 3.72;

        let BRLPrice = (btcPrice/nanPrice) * dollar;
        global.nanoPrice = BRLPrice;
        console.log('Price => ', BRLPrice);
      }).catch((err) => {
        console.log('Error on getting price');
        console.log(err);
      }).catch((err) => {
        console.log('Error on requesto to coinmarketcap api ');
        console.log(err);
      })
  }

  getCurrentFunds = () => {
    this.state.interval = setInterval(() => {
      let price = global.walletService.getBalance(global.nanoPrice);
      global.nanoFunds = price.rai;
      global.nanoReal  = price.real;
      this.forceUpdate();
    }, 4000);
  }

  checkWallet = async () => {
    storage.load({
      key: 'cipheredWallet',
      autoSync: true,
      syncInBackground: true,
    }).then(data => {
      this.setState({
        cipheredWallet: data,
        isLoading: false,
        hasWallet: true,
        ciphered: true,
        view: <Unlock onUnlock={this.onUnlock} wallet={data}/>
      })
    }).catch(err => {
      this.setState({
        hasWallet: false,
        isLoading: false,
        unlocked: false,
        view: <Introduction onUnlock={this.onUnlock} />
      })
    })
  }

  onUnlock = (walletDecipher) => {
    this.setState({
      hasWallet: true,
      ciphered: false,
      cipheredWallet: walletDecipher,
      unlocked: true,
      view: <Route screenProps={{wallet: walletDecipher, segments: false}} />
    })
    
    global.walletService = new WalletService(walletDecipher);
   // global.walletService.sync();
    this.getCurrentFunds();
  }


  render() {
    return (
      <LinearGradient colors={['#355c7d', '#6c5b7b', '#c06c84']} style={styles.linearGradient}>
        {this.state.view}
      </LinearGradient>
    )
  }
}    


const styles = StyleSheet.create({
    background: {
      flex: 1,
    },
    linearGradient: {
      flex: 1,
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
  shoppingCart: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'red'
  }
});

export default App;
