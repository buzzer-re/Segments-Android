import React, { Component } from 'react';
import { StyleSheet, View } from 'react-native';
import { Container, Text } from 'native-base';

import ButtonComponent from 'react-native-button-component';
import Slide  from './Slide';
import Swiper from 'react-native-swiper';

import SyncRoute from '../CreateSegments/SyncRoute';

class CreateSegments extends Component {
  constructor(props) {
    super(props);
    this.state = {
      slide: true,
    }
    this.configDone = this.configDone.bind(this);
  }

  configDone = (config) => {
    this.props.found(config);
  }


  render() {
    if (!this.state.slide) {
      return(
        <Container style={styles.container}>
          <SyncRoute screenProps={{configDone: this.configDone}}/>
        </Container>
      )
    } else {
      return (
        <Swiper loop={false}>
          <View style={styles.slideWraper} >
            <Slide
              title="Inicie seu Segments"
              description="Sincronize e inicie o seu propio Segments"
              footerText="Em breve você podera ter seu propio negócio"
              image={require('../../assets/nano.png')} />
          </View>
          <View style={styles.slideWraper} >
            <Slide
              title="Alta segurança"
              description="Somente você tera acesso admin ao seu Segments"
              footerText="Suas chaves serão guardadas somente no seu Segments"
              image={require('../../assets/nano.png')} />
          </View>
          <View style={styles.slideWraper}>
            <Container style={styles.titleBox}>
              <Text style={{fontSize: 24, color:'white'}}>Vamos começar!</Text>
            </Container>

            <Container style={styles.buttonBox}>
              <ButtonComponent text="Iniciar a vender" style={styles.button} onPress={() => this.setState({slide:false})}/>
            </Container>
          </View>
        </Swiper>
      )
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleBox: {
    flex:3,
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonBox: {
    flex: 3,
    marginTop: 100,
    alignItems: 'center'
  },
  footer: {
    flex: 2,
    backgroundColor: 'black'
  },
  button: {
    width: '40%'
  },
  slideWraper:{
    flex:1,
    padding: 2,
  }
});

export default CreateSegments;
