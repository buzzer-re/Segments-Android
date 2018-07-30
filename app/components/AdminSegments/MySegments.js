import React, { Component } from 'react';
import { StyleSheet, ActivityIndicator } from 'react-native';
import { Container, Text } from 'native-base';
import Icon from 'react-native-vector-icons/dist/Foundation';
import CreateSegments from './CreateSegments';
import Statistics from './Statistics';

class MySegments extends Component {
  constructor(props) {
    super(props);
    this.state = {
      segments: [],
      isLoading: true,
      hasSegments: false,
      view: (<Container style={{flex:1,justifyContent:'center',alignItems:'center'}}>
                <ActivityIndicator size="large" color="#b2bec3" />
                <Text style={{padding:30,color: 'white'}}>Carregando seus Segments...</Text>
            </Container>)
    }
    this.checkSegments = this.checkSegments.bind(this);
    this.found = this.found.bind(this);
  }

  static navigationOptions = {
    title: 'Meus Segments',
    drawerIcon: <Icon size={30} name="social-smashing-mag" />
  }

  componentWillMount() {
    this.checkSegments();
  }

  checkSegments = async () => {
    console.log('Checando segments...');
    global.storage.load({
      key: 'segments',
      autoSync: true,
      syncInBackground: true,
    }).then(data => {
      data = new Map(data._mapData);
      this.setState({
        segments: data,
        isLoading: false,
        hasSegments: true,
        //view: <CreateSegments found={this.found}/>
        view: <Statistics config={data} navigator={this.props.navigation}/>
      })
    }).catch(err => {
      this.setState({
        segments: [],
        isLoading: false,
        hasWallet: false,
        view: <CreateSegments found={this.found}/>
      })
    })
  }

  found = (found) => {
    this.setState({
      segments: '',
      isLoading: false,
      hasSegments: true,
      view: <Statistics config={found} navigator={this.props.navigation} />
    })
  }

  render() {
    return (this.state.view)
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  }
});

export default MySegments;
