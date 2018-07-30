import React, {Component} from 'react';
import { Image, Clipboard,ToastAndroid, View } from 'react-native';
import { Container, Content,Icon, Text, Card, CardItem, Body, Left, Right} from 'native-base';
import * as Animatable from 'react-native-animatable';

class AccountCard extends Component {
  copyText = (msg) => {
      Clipboard.setString(msg);
      ToastAndroid.show('Copiado!', ToastAndroid.SHORT);
  }

  render() {
    return (
      <Animatable.View animation="zoomIn" iterations={1} style={{
              flex: 1,
              padding:20
            }}>
            <Content>
              <Card style={{
                  flex:1,
                }}>
                <CardItem style={{
                    padding:20
                  }}>
                  <Body>
                    <Image style={{
                        width: 69,
                        height: 29,
                        top: 15,
                        bottom: '30%'
                      }} source={require('../../assets/nanomini.png')} />
                    <Text style={{
                        fontSize: 38,
                        fontWeight: 'bold',
                        left: 85,
                        bottom: '25%',
                      }}>{parseFloat(this.props.value)} Nano</Text>
                    <Text style={{
                        fontSize: 16,
                      }}> <Icon onPress={()=>this.copyText(this.props.account)} name="copy" /> {this.props.account}</Text>
                  </Body>
                </CardItem>
              </Card>
            </Content>
          </Animatable.View >
    )
  }
}

export default AccountCard;
