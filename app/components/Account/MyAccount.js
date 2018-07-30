 import React, { Component } from 'react';
import { StyleSheet, View } from 'react-native';
import { Container,Icon, Button, Title, Header, Left, Body, Text }  from 'native-base';
import * as Animatable from 'react-native-animatable';
import QrCode from './QrCode';
import TabNavigator from './TabNavigator';

class MyAccount extends Component {
  constructor(props) {
    super(props);
    this.state = {
      qrCode: '',
      openQr: false,
      balance: 0,
      balanceReal: 0  
    }
    this.onScan = this.onScan.bind(this);
    this.qrClose = this.qrClose.bind(this);
    this.openQr = this.openQr.bind(this);
  }

  componentWillUnmount() {
    clearInterval(this.state.interval);
  }

  componentDidMount() {
    this.state.interval = setInterval(() => {
      this.forceUpdate();
    }, 5000);
  }

  onScan = (code) => {
    this.setState({qrCode: code.data, openQr: false})
  }

  qrClose = () => {
    this.setState({openQr: false})
  }
  openQr = () => {
    this.setState({openQr: true})
  }
  render() {
    if (this.state.openQr)
      return <QrCode onScan={this.onScan} onClose={this.qrClose} />
    return (
      <Container style={{
          flex:1
        }}>
        <Header style={styles.header}>
          <Left>
            <Button transparent onPress={() => {
                this.props.navigation.navigate('DrawerOpen');
              }}>
              <Icon name='menu' />
            </Button>
          </Left>
          <Body>
            <Title>Sua carteira</Title>
          </Body>
        </Header>
        <Animatable.View animation="fadeInDown" iteration={1} style={styles.accountInfo}>
            <Text
              style={{
                fontSize: 26,
                fontWeight: 'bold',
                color: 'white'
              }}
              >
              {global.nanoFunds} NANO
            </Text>
            <Text style={{padding:5}}/>
            <Text style={{fontWeight: 'bold',color: 'white'}}>R$ {global.nanoReal.toFixed(2)}</Text>
        </Animatable.View>
        <View style={styles.tabContainer}>
          <TabNavigator screenProps={{openQr: this.openQr, qrCode: this.state.qrCode, superProps: this.props.screenProps}}/>
        </View>
      </Container>
    )
  }
}

const styles = StyleSheet.create({
  header: {
    elevation: 0,
    shadowOpacity: 0,
    backgroundColor: 'transparent'
  },
  accountInfo: {
    flex: 2,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    flex: 8,
  }
});

export default MyAccount;
