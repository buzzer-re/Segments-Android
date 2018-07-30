import React, { Component } from 'react';
import { ToastAndroid,NativeModules,NativeEventEmitter, Alert, 
  StyleSheet, View, ActivityIndicator, PermissionsAndroid } from 'react-native';

import { List, ListItem } from 'react-native-elements';
import * as Animatable from 'react-native-animatable';
import {Card, Icon,Body,Right,Header,CardItem, Content, Container, Text} from 'native-base';

import BleManager from 'react-native-ble-manager';

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

class Sync extends Component {
  constructor(props) {
    super(props);
    this.state = {
      devices: new Map(),
      status: "Iniciar Busca",
      loading: false,
      view: <ActivityIndicator />,
    }

    this.startScan = this.startScan.bind(this);
    this.handleDiscover = this.handleDiscover.bind(this);
    this.handleStopScan = this.handleStopScan.bind(this);
    this.pairAndConfigure = this.pairAndConfigure.bind(this);
    this.unpair = this.unpair.bind(this);
  }


  componentWillMount() {
    this.unpair();
  }

  componentDidMount() {
    this.handlerDiscover = bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', this.handleDiscover );
    this.handlerStop = bleManagerEmitter.addListener('BleManagerStopScan', this.handleStopScan );
  }

  componentWillUnmount() {
    this.handlerDiscover.remove();
    this.handlerStop.remove();
  }

  startScan = async () => {
    let bleOn = false;
    this.setState({devices: new Map()});
    await BleManager.enableBluetooth()
      .then((ok) => {
        bleOn = true;
      }).catch(() =>{});

    if (bleOn) {
      BleManager.scan([], 10, true)
        .then((results) => {
          this.setState({
            loading: true,
            status: "Buscando seu novo Segments"
          })
        }).catch((err) => {
          console.log(err);
        })
    }
  }

  handleDiscover = (device) => {
    let devices = this.state.devices;
    if (!devices.has(device.id)) {
      if (device.name != null) {//if (device.name.match(/Segments/)) {
        devices.set(device.id, device);
        this.setState({devices});
        console.log('New device in Map');
      }
    }
  }

  handleStopScan = () => {
    console.log(this.state.devices.size);
    this.setState({loading: false, status: this.state.devices.size != 0 ? "Segments próximos: " : "Nenhum Segments :/"});
  }

  pairAndConfigure = (device) => {
    
  }

  unpair = () => {
    BleManager.getConnectedPeripherals([])
      .then((devices) => {
        if (devices.length > 0) {
          BleManager.disconnect(devices[0].id)
            .then(() => {
              console.log('disconnected');
            }).catch((err) => {
              console.log(err);
            })
        }
      }).catch((err) => {
        console.log(err);
      })
  }

  render() {
    //5console.log(this.state.devices);
    let icon = "md-refresh";
    const devices = Array.from(this.state.devices.values());
    if (this.state.refuse) {
      icon = "md-checkmark"
    }
    return (
      <Container style={styles.container}>
        <Container style={styles.title} >
          <Text style={{
              fontSize: 14,
              color: 'white'
            }}>{this.state.status}  </Text>
          { this.state.loading ?  <ActivityIndicator size="small" /> :
            <Icon onPress={this.startScan} style={{
                color: 'white'
              }} size={20} name={icon}/> }
        </Container>
        <Content contentContainerStyle={{justifyContent: 'center', alignItems:'center'}}>
            { 
              devices.map((device,i) => (
                <Animatable.View animation="zoomIn" iteration={1} key={i}  style={styles.wrapperCard}>
                  <Card style={styles.card}>
                    <CardItem button onPress={() => {
                        BleManager.stopScan().then(() => {
                          this.handlerDiscover.remove();
                          this.handlerStop.remove();                      
                          this.props.navigation.navigate('Configure', { device: device });
                        }).catch((err) =>{
                          console.log(err);
                        });
                  }}>
                      <Text style={styles.name}>{device.name}</Text>
                    </CardItem>
                  </Card>
                </Animatable.View>
              ))
              }

        </Content>
      </Container>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  spinner: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'column',
    alignItems: 'center',
  },
  title: {
    alignItems:'center',
    justifyContent: 'center',
    flex: .1,
    flexDirection: 'row'
  },
  list: {
    borderTopWidth: 0,
    borderTopWidth: 0,
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 52, 52, 0.0)'
  },
  wrapperCard: {
    width: '80%',
    flex:1,
    height: 50,
    backgroundColor: 'rgba(52, 52, 52, 0.0)'
  },
  card: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 18,
    color: 'black',
    paddingHorizontal:5
  },
  subtitle: {
    fontSize: 14,
    color: 'black',
    paddingHorizontal: 10,
  }
});

export default Sync;
