import React, { Component } from 'react';
import { StyleSheet, FlatList, Image } from 'react-native';
import { Container, Header,Title, Content, Card, CardItem, List,ListItem,Thumbnail, Text, Button, Icon, Left, Body, Right } from 'native-base'
import BleManager from 'react-native-ble-manager';

import SyncSegments from '../Segments/SyncSegments';
import EditSeg  from './Configure/EditSeg';

import * as Animatable from 'react-native-animatable';

class Statistics extends Component {
  constructor(props) {
    super(props);
    console.log(this.props);
    this.state = {
      config: this.props.config,
      devices: Array.from(this.props.config.values()).reverse(),
      target: null,
      view: null,
      title: 'Seus Segments'
    };
    this.backComponent = this.backComponent.bind(this);
    this.enterSegments = this.enterSegments.bind(this);
    this.dive = this.dive.bind(this);
  }
  
  enterSegments = (device) => {
    this.setState({
      view: <SyncSegments noScan={true} device={device} onFind={this.dive} back={this.backComponent}/>
    })
/*    console.log('Diving into');
    BleManager.getConnectedPeripherals([])
      .then((devices) =>{
        if (devices.length > 0) {
          console.log('Already paired, unpairing...');
          BleManager.disconnect(devices[0].id).then(() => {
            console.log('Ready again');
          }).catch((err) => {
            console.log('Error on unpair');
            console.log(err);
          })
        }
      })
    this.setState({
      view: <SyncSegments back={this.backComponent} config={this.state.config} device={device} onFind={this.dive} />
    }); */
  }

  dive = (newConfig) => {
    this.setState({
      config: newConfig,
      title: newConfig.name
    });

    console.log('Its time to finally enter');
    this.setState({
      view: <EditSeg config={newConfig} navigation={this.props.navigator}/>
    })
  }

  backComponent = () => {
    setTimeout(() => {
      this.setState({
        view: null,
      })
    }, 2000);
  }


  render() {
    return (
      <Container style={styles.container}>
          {
            this.state.view == null ? (

        <Content>
                <Header style={styles.header}>
          <Left>
            <Button transparent onPress={() => {
                this.props.navigator.navigate('DrawerOpen');
              }}>
              <Icon name='menu' />
            </Button>
          </Left>
          <Body>
            <Title>{this.state.title}</Title>
          </Body>
        </Header>
              <List>
              {this.state.devices.map((place,i) => (
                  <Animatable.View key={i}>
                    <ListItem>
                      <Card>
                        <CardItem>
                          <Left>
                            <Thumbnail source={place.image} />
                            <Body>
                              <Text>{place.name}</Text>
                              <Text note>Segments</Text>
                            </Body>
                          </Left>
                        </CardItem>
                        
                        <CardItem button cardBody onPress={() => this.enterSegments(place)}>
                        { /* Probably the extension is missing ? */
                          typeof place.image == 'object' ?
                          <Image source={ place.image } style={{height: 200, width: 200, flex: 1}}/>
                          : <Image source={require('../../assets/NoIMage.png')} style={{height: 200, width: null, flex: 1}} />
                        }
                        </CardItem>
                        <CardItem>
                          <Right>
                            <Text>0 Clientes</Text>
                          </Right>
                        </CardItem>
                      </Card>
                    </ListItem>
                  </Animatable.View>))}
            </List>
          </Content>
            ) : ( this.state.view )
          }
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
  container: {
    flex: 1,
  },
  rows: {
    flex: 3,
    flexDirection: 'column',
  }
})

export default Statistics;
