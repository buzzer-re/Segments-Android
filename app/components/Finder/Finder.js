import React, { Component } from 'react';
import { ToastAndroid, StyleSheet, View, ActivityIndicator,NativeModules,NativeEventEmitter } from 'react-native';
import { List, ListItem } from 'react-native-elements';
import BleManager from 'react-native-ble-manager';
import * as Animatable from 'react-native-animatable';

import {Card, Icon, CardItem, Content, Container, Text, Body} from 'native-base';

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

class Finder extends Component {
  constructor(props) {
    super(props);
    this.state = {
      devices: new Map(), 
      refuse: true, 
      loading:false ,
      status: 'Buscar Segments próximos de você!',
      icon: 'md-refresh',
      values: {}
    }

    this.startScan = this.startScan.bind(this);
    this.handleDiscover = this.handleDiscover.bind(this);
    this.handleStop = this.handleStop.bind(this);
    this.enterSegments = this.enterSegments.bind(this);
  }

  componentDidMount() {
    BleManager.getConnectedPeripherals([])
      .then((devices) => {
        if (devices.length > 0) {
          BleManager.disconnect(devices[0].id)
            .then(() => {
            }).catch((err) => {
              console.log(err);
            })
        }
      }).catch((err) => {
        console.log(err);
      })
    this.handlerDiscover = bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', this.handleDiscover );
    this.handlerStop = bleManagerEmitter.addListener('BleManagerStopScan', this.handleStop );
  }

  componentWillUnmount() {
    this.handlerDiscover.remove();
    this.handlerStop.remove();
  }

  startScan = () => {
    BleManager.enableBluetooth()
      .then((ok) => {
        this.setState({
          devices: new Map(),
        });
      BleManager.scan([],10,true)
        .then((result) => {
          this.setState({
            loading: true,
            status: 'Buscando segments próximos de você!',
          })
        })
      }).catch((err) => {});
  }

  handleDiscover = (device) => {
    let devices = this.state.devices;
    if (!devices.has(device.id) && device.name != null) {
      devices.set(device.id, device);
      this.setState({devices});
    }
  }

  handleStop = () => {
    this.setState({loading: false, status: this.state.devices.size != 0 ? "Segments próximos: " : "Nenhum Segments :/"});
  }

  enterSegments = (device) => {
    BleManager.stopScan().then(() => {
      this.props.enterSegments(device);
    }).catch((err) => {
      console.log(err);
    })
  }
  
  render() {
    const devices = Array.from(this.state.devices.values());
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
              }} size={20} name="md-refresh"/> }
        </Container>
        <Content contentContainerStyle={{justifyContent: 'center', alignItems:'center'}}>
            {
              devices.map((device,i) => (
                <Animatable.View animation="zoomIn" iteration={1} key={i}  style={styles.wrapperCard}>
                    <Card style={styles.card}>
                      <CardItem button onPress={() => {
                        this.enterSegments(device); } }> 
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

export default Finder;
