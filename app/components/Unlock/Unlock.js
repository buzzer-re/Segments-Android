import React, { Component } from 'react';
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import { Container,Button,Text, Header, Content, Form, Item, Input, Label } from 'native-base';
import  { ActivityIndicator,View, StyleSheet, Image, Alert } from 'react-native';
import {Wallet} from '../../rai-wallet';

class Unlock extends Component {
  constructor(props) {
    super(props);
    this.state = {
      password: '',
      loading: false
    };
    this.decipherWallet = this.decipherWallet.bind(this);
  }

  static navigationOptions = {
    header: null,
  }
  componentWillMount(){
  //  this.decipherWallet();
  }

  decipherWallet = () => {
    console.log(this.state.password);
    this.setState({
     password: this.state.password,
    //  password: 'aaaaaaaa',
      loading: true,
    });
    setTimeout(() => {
      if (this.state.password != '') {
        const wallet = new Wallet(this.state.password);
        try {
          const cipheredWallet = this.props.wallet.pack;
          wallet.load(cipheredWallet);
          this.props.onUnlock(wallet);
        } catch(err) {
          console.log(err);
          Alert.alert('Não foi possivel derivar sua chave, sua senha esta incorreta!');
          this.setState({
            loading: false,
            password: '',
          })
        }
      } else {
        Alert.alert('Erro', 'Entre com sua senha');
        this.setState({
          loading: false,
          password: ''
        })
      }
    },0);
  }
  render() {
    if (this.state.loading) {
      return(
        <View style={{flex:1, justifyContent: 'center', alignItems:'center'}}>
          <ActivityIndicator size="large" color="#b2bec3" />
          <Text style={{
              color: 'white',
              margin: 20
            }}>Derivando sua chave...</Text>
        </View>
      )
    }
    return (
      <Container style={style.container}>
        <Container style={style.titleBox}>
            <Image
              style={{width: 100, height: 100}}
              source={require('../../assets/key.png')} />
            <Text style={{
                margin: 20,
                color: 'white'
              }}>Digite sua senha</Text>
        </Container>
        <Container style={style.formBox}>
          <Content style={style.content}>
            <Form onSubmit={this.createWallet}>
              <Item floatingLabel>
                <Label style={{color: 'white'}}>Senha</Label>
                <Input
                   ref={(c) => this._input = c}
                   minLength={8}
                   onSubmitEditing={this.decipherWallet}
                   onChangeText={(password) => this.setState({password})}
                   secureTextEntry={true}
                   type="password"/>
                 <Icon name="lock" />
              </Item>
            </Form>
          </Content>
        </Container>
        <Container style={style.descriptionBox}>
          <Content>
            <Text style={{color: 'white'}}>Esqueceu sua senha? Usar semente</Text>
          </Content>
        </Container>
      </Container>
    )
  }
}

export default Unlock;


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
