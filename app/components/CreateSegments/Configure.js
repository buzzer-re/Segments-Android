import React, { Component } from 'react';
import { ActivityIndicator } from 'react-native';
import { Container, Text } from 'native-base';

import BleManager from 'react-native-ble-manager';
import { stringToBytes } from 'convert-string';
import crypto from 'crypto';

import FormConfig from './FormConfig';

const CONFIG_SERVICE       = "f7a036c9-603f-46bd-a832-6bc84a1d9298";
const CONFIG_CHARACTERISTC = "9adcafc0-a1eb-4bea-a666-059a4876eb77";

class Configure extends Component {
  constructor(props) {
    super(props);
    this.state = {
      device: this.props.navigation.state.params.device,
      pairing: true,
      saving: false,
      status: '',
    };
    this.state.status = `Pareando com ${this.state.device.name}...`;
    this.saveChanges = this.saveChanges.bind(this);
    this.pairAndConfig = this.pairAndConfig.bind(this);
  }

  componentWillMount() {
    this.pairAndConfig();
  }

  pairAndConfig =  async () => {
    let device = this.state.device;
    let self = this;

    BleManager.connect(device.id).then(() => {
      self.setState({pairing:false});
    }).catch((err) => {
      console.log(`Error ${err}`);
      this.setState({error: true});
    })
  }

  saveChanges = (config) => {
    console.log('Saving...');
    this.setState({
      status: 'Salvando seus dados...',
      saving: true
    });

    let segmentsMap = new Map();
    let segmentsObj = new Object();
    let msgLen;
    let imageLen;

    segmentsObj.hash = crypto.randomBytes(8).toString('hex');
    segmentsObj.name = config.name;
    segmentsObj.description = config.description;
    segmentsObj.image = config.image;
    segmentsObj.info = new Object();
    segmentsObj.info.clients = 0;
    segmentsObj.pub_key = global.walletService.getWallet().getAccounts()[0].account;
    console.log('Saving with ', segmentsObj);
    BleManager.getConnectedPeripherals([])
      .then((device) => {
        segmentsObj.id = device[0].id;
      }).catch((err) => {});

    segmentsMap.set(segmentsObj.hash, segmentsObj);

   //config = { structure: segmentsMap, name: config.name, description: config.description };
    
    let device = this.state.device;
    const configByteArray = stringToBytes(JSON.stringify(segmentsObj));

    BleManager.retrieveServices(device.id).then((info) => {
      BleManager.write(device.id, CONFIG_SERVICE, CONFIG_CHARACTERISTC, configByteArray).then(() => {
        global.storage.load({
          key: 'segments'
        }).then((storage) => {
          storage = new Map(storage._mapData);
          storage.set(segmentsObj.hash, segmentsObj);
          global.storage.save({
            key: 'segments',
            data: storage
          }).then(() => {
            console.log('New segments configured!');
            this.props.screenProps.configDone(storage);
          }).catch((err) => {
            console.log("Error on save new segments");
            console.log(err);
          })
        }).catch((err) => {
          let segments = new Map();
          segments.set(segmentsObj.hash, segmentsObj);
          global.storage.save({
            key: 'segments',
            data: segments,
          }).then(() => {
            console.log('First segments configured! ( and hope in device )');
            this.props.screenProps.configDone(segments); 
          }).catch((err) => {
            console.log('Error on save first segments: ');
            console.log(err);
          })
        })
    }).catch((err) => {
      Alert.alert('Error', 'Erro na comunicação, tente novamente');
      console.log(err);
      this.props.navigation.navigate('Sync');
      })
    }).catch((err) => {
      Alert.alert('Error', 'Erro na comunicação, tente novamente');
      console.log(err)
      this.props.navigation.navigate('Sync');
    });
  }

  render() {
    if (this.state.pairing || this.state.saving) {
      return (
        <Container style={{flex:1, justifyContent:'center', alignItems:'center'}}>
          <ActivityIndicator size="large"/>
          <Text></Text>
          <Text style={{color:'white'}}>{this.state.status}</Text>
        </Container>
      )
    }
    return (
      <Container style={{flex:1}}>
        <FormConfig onSubmit={this.saveChanges} />
      </Container>
    )
  }
}


export default Configure;
