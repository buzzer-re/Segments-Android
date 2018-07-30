import React, { Component } from 'react';
import  {  ActivityIndicator,View, StyleSheet, Image, Alert } from 'react-native';
import { Container,Button,Text,Icon, Header, Content, Form, Item, Input, Label } from 'native-base';
import {Wallet} from '../../rai-wallet';

export default class CreateWallet extends Component {
  constructor(props) {
    super(props);
    this.createWallet = this.createWallet.bind(this);
    this.buildWallet = this.buildWallet.bind(this);
    this.state = {
      pass: '',
      walletCreated: false,
      loading: false,
      status: '',
    }
  }

  buildWallet = async (pass) => {
    const wallet = new Wallet(pass);
    wallet.createWallet();
    var seed = wallet.getSeed(pass);
    var pack = wallet.pack();
    global.storage.save({
        key: 'cipheredWallet',
        data: {
          pack: pack,
        }
    }).then(() => {
      this.props.showSeed(seed,wallet);
    });
  }
  createWallet = (value) => {
    if (this.state.pass.length < 8) {
      Alert.alert('Você precisa de no mínimo 8 caracteres!');
    } else {
        const pass = this.state.pass;
        this.setState({
          createWallet: true,
          loading: true,
          password: pass,
          status: 'Criando sua carteira...'
        });
        setTimeout(() =>{
          this.buildWallet(pass);
        },0)
    }

  }

  render() {
    if (this.state.loading) {
      return(
        <View style={{flex:1, justifyContent: 'center', alignItems:'center'}}>
          <ActivityIndicator size="large" color="#b2bec3" />
          <Text style={{
              color: 'white',
              margin: 20
            }}>{this.state.status}</Text>
        </View>
      )
    }
    return(
        <Container style={style.container}>
          <Container style={style.titleBox}>
              <Image
                style={{width: 100, height: 100}}
                source={require('../../assets/key.png')} />
              <Text style={{
                  margin: 20,
                  color: 'white'
                }}>Escolha sua senha</Text>
          </Container>
          <Container style={style.formBox}>
            <Content style={style.content}>
              <Form onSubmit={this.createWallet}>
                <Item floatingLabel>
                  <Label style={{color: 'white'}}>Senha</Label>
                  <Input
                     ref={(c) => this._input = c}
                     minLength={8}
                     onSubmitEditing={this.createWallet}
                     onChangeText={(pass) => this.setState({pass})}
                     secureTextEntry={true}
                     type="password"/>
                   <Icon name="lock" />
                </Item>
              </Form>
            </Content>
          </Container>
          <Container style={style.descriptionBox}>
            <Content>
              <Text style={{color: 'white'}}>Escolha sua chave sabiamente, pois ela é a unica capaz de descriptografar sua carteira.</Text>
            </Content>
          </Container>
        </Container>
      );
  }
}

const style = StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 15
    },
    titleBox: {
      flex: 4,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column',

    },
    formBox: {
      flex: 5,
    },
    content : {
      marginTop: 70,
    },
    buttonCreate:{
      flex:1,
      justifyContent: 'flex-start',
      alignItems: 'center',
    },
    descriptionBox: {
      flex: 2.6,
      marginTop: 30,
      justifyContent: 'center',
      alignItems: 'center'
    }
});
