import React, { Component } from 'react';
import {View, Image, Text,StyleSheet, Clipboard, ToastAndroid} from 'react-native';
import { Icon, Container, Header, Left, Right, Body, Content, Button, Title } from 'native-base';
import AccountCard from './AccountCard';
import Finder from '../Finder/Finder';

import SyncSegments from '../Segments/SyncSegments';
import Segments from '../Segments/Segments';

import * as Animatable from 'react-native-animatable';

import * as WalletFunctions from '../../NanoFunctions/Wallet';

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      enterSegments: false,
      view: null,
      balance: 0,
      balanceReal: 0,
      unmount: false,
      loading: false,
      interval: null
    };
    this.goToWallet = this.goToWallet.bind(this);
    this.enterSegments = this.enterSegments.bind(this);
    this.exit = this.exit.bind(this);
    this.dive = this.dive.bind(this);
  }

  static navigationOptions = {
    drawerIcon :(
      <Icon name="home" />
    )
  }

  componentWillUnmount() {
    clearInterval(this.state.interval);
  }

  componentDidMount() {
    this.state.interval = setInterval(() => {
      this.forceUpdate();
    }, 5000);
  }

  goToWallet = () => {
    this.props.navigation.navigate('Carteira');
  }

  enterSegments = (device) => {
    console.log('Entering on ', device);
    this.setState({
      enterSegments: true,
      loading: true,
      view: <SyncSegments noScan={true} device={device} onFind={this.dive} back={this.exit}/>
    })
  }

  dive = (info) => {
    console.log('Enter in');
    console.log(info);
    this.setState({
      enterSegments: true,
      loading: false,
      view: <Segments wallet={this.props.screenProps.wallet} navigation={this.props.navigation} segments={info} />
    });
  }


  exit = () => {
    setTimeout(() => {
      this.setState({
        enterSegments: false,
        loading: false,
        view: null,
      })
    }, 2000);
  }

  render() {
    if (this.state.enterSegments) return this.state.view;
    return(
      <Container style={{flex: 1}}>
            <Header style={styles.header}>
              <Left>
                <Button transparent onPress={() => {
                    if (!this.state.loading)
                      this.props.navigation.navigate('DrawerOpen');
                  }}>
                  <Icon name='menu' />
                </Button>
              </Left>
              <Body>
                <Title>Segments</Title>
              </Body>
              <Right>
                <Text onPress={this.goToWallet} style={{
                    color: 'white',
                    fontSize: 12,
                    padding: 10
                  }}>{global.nanoFunds} Nano / {global.nanoReal.toFixed(2)} R$</Text>
              </Right>

            </Header>
            <Container style={styles.finder}>
              <Finder enterSegments={this.enterSegments}/>
            </Container>
      </Container>
    )
  }
}

export default Home;

const styles = StyleSheet.create({
  header: {
    elevation: 0,
    shadowOpacity: 0,
    backgroundColor: 'transparent'
  },
  finder: {
    flex: 1,
    padding: 20,
    margin: 10,
  }
})
