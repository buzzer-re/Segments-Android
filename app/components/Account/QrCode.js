import React, { Component } from 'react';
import { Container, Text } from 'native-base';
import { StyleSheet,TouchableOpacity } from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';

class QrCode extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <QRCodeScanner
        onRead={this.props.onScan}
        topContent={
          <Text style={styles.centerText}>
            Escaneie o código QR para copiar o endereço rapidamente!
          </Text>
        }
        bottomContent={
          <TouchableOpacity style={styles.buttonTouchable} onPress={this.props.onClose}>
            <Text style={styles.buttonText}>Fechar</Text>
          </TouchableOpacity>
        }
      />
    )
  }
}

const styles = StyleSheet.create({
  centerText: {
    flex: 1,
    fontSize: 18,
    padding: 32,
    color: 'white',
  },
  textBold: {
    fontWeight: '500',
    color: '#000',
  },
  buttonText: {
    fontSize: 21,
    color: 'white',
  },
  buttonTouchable: {
    justifyContent: 'center',
    alignItems: 'center',
    flex:5
  },
});

export default QrCode;
