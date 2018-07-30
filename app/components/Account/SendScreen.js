import React, { Component } from 'react';
import { StyleSheet,TextInput, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Container, Text } from 'native-base';
import { Input } from 'react-native-elements';
import ButtonComponent, { CircleButton, RoundButton, RectangleButton } from 'react-native-button-component';
import QrCode from './QrCode';

class SendScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      address: this.props.screenProps.qrCode,
      amount: 0,
      buttonState: 'upload',
      qrCode: false
    };
    this.sendNano = this.sendNano.bind(this);
  }

  sendNano = async () => {
    let to = this.state.address;
    let amount = this.state.amount;
    
    if (to != '' && amount > 0.0) {
      let response = await global.walletService.sendNano(to, amount);

      if (response) {
        this.setState({
          buttonState: 'uploading'
        });
        Alert.alert('Sucesso', 'Envio complete, dentro de alguns segundos sera confirmado na rede');
        this.setState({
          address: '',
          amount: 0,
          buttonState: 'upload'
        })
      }
    } else {
      Alert.alert('Erro', 'Preencha todos os campos para o envio!');
    }
  
  }

  render() {
    if (this.state.qrCode)
      return <QrCode onScan={this.qrCode} exit={() => this.setState({qrCode: false})} />
    return (
      <Container style={styles.sendContainer}>
        <Container style={styles.text}>
          <Text style={{color:'white'}}>Envie NANO</Text>
        </Container>
        <Container style={{flex:0.5}}></Container>
        <Container style={styles.formContainer}>
            <Input
              editable={true}
              placeholder='Endereço para envio'
              value={this.state.address}
              onChangeText={(address) => this.setState({address})}
                rightIcon={
                <TouchableOpacity style={styles.buttonTouchable} onPress={this.props.screenProps.openQr}>
                  <Icon
                    name="camera"
                    size={24}
                    color= 'white' />
                </TouchableOpacity>
              }
            />
          <Container style={{flex:0.4}}></Container>
            <Input
              placeholder='Quantidade'
              keyboardType={'numeric'}
              value={String(this.state.amount)}
              onChangeText={(amount) => this.setState({amount})}
                rightIcon={
                <Icon name="money"
                  size={24}
                  color= 'white' />
              }
            />
          <Container style={styles.submitContainer}></Container>
            <ButtonComponent
              buttonState={this.state.buttonState}
              style={{width: 200}}
              states={{
                upload: {
                  onPress: () => {
                    this.setState({buttonState: 'uploading'});
                    this.sendNano();
                  },

                  text: 'Enviar',
                },
                uploading: {
                  spinner: true,
                  text: 'Enviando..',
                },
              }}
            >
            </ButtonComponent>
        </Container>

      </Container>
    )
  }
}

const styles = StyleSheet.create({
  sendContainer: {
    flex: 1,
  },
  text: {
    flex: 1.4,

    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    flex: 6,
    alignItems: 'center'
  },
  submitContainer: {
    flex: 0.4,
    justifyContent: 'center',
    alignItems: 'center',
  }
});


export default SendScreen;
