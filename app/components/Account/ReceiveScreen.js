import React, { Component } from 'react';
import { StyleSheet, Clipboard, ToastAndroid } from 'react-native';
import { Container, Text } from 'native-base';

import QRCode from 'react-native-qrcode';

class ReceiveScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      account: props.screenProps.superProps.wallet.getAccounts()[0].account,
      qrCode: <QRCode value={props.screenProps.superProps.wallet.getAccounts()[0].account} size={200} />
    }
  }

  render() {
    return (
      <Container style={styles.receiveContainer}>
        <Container style={styles.text}>
          <Text style={{color:'white'}}>Use este QRcode Para receber NANO</Text>
        </Container>
        <Container style={styles.qrCode}>
          {this.state.qrCode}
        </Container>
        <Container style={styles.textBottom}>
          <Text style={{color:'white'}}>Ou use seu endereço:</Text>
          <Text onPress={() => {
            Clipboard.setString(this.state.account);
            ToastAndroid.show('Copiado!', ToastAndroid.SHORT);
          }}selectable={true} style={{color:'white', fontSize: 14}}>{this.state.account}</Text>
        </Container>
      </Container>
    )
  }
}

const styles = StyleSheet.create({

  receiveContainerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  text: {
    flex: 1.4,
    justifyContent: 'center',
    alignItems: 'center'
  },
  qrCode: {
    flex: 6,
    justifyContent: 'center',
    alignItems: 'center'
  },
  textBottom: {
    flex:3,
    justifyContent: 'center',
    padding: 20,
    alignItems: 'center'
  }
});

export default ReceiveScreen;
