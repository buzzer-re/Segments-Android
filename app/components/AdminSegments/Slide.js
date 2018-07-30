import React, { Component } from 'react';
import { View, StyleSheet, Image, WebView } from 'react-native';
import { Container, Text, Button, Content } from 'native-base';
import ButtonComponent, { CircleButton, RoundButton, RectangleButton } from 'react-native-button-component';
import * as Animatable from 'react-native-animatable';

class Slide extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
        <Container style={style.container}>
          <View style={style.imageBox}>
          {/*  <Image
              source={this.props.image}
              /> */}
          </View>
          <Container style={style.titleBox}>
            <Text style={style.titleLabel}>{this.props.title}</Text>
          </Container>

          <Container style={style.descriptionBox}>
            <Text style={style.description}>{this.props.description}</Text>
            {this.props.seed ? <Text style={style.description} >{this.props.seed}</Text>: <Text></Text>}
          </Container>
          <Container style={{flex: 1.3, padding: 30}}>
            {this.props.last ?
              <Animatable.View iterations={1} animation="flipInY" style={style.buttonBox}>
                  <ButtonComponent  style={{width: '40%'}} text="Entrar de uma vez por todas!" style={style.button} onPress={this.props.onPress}/>
              </Animatable.View> : <Text></Text>
            }
          </Container>
          <Container style={style.footerBox}>
            <Text style={style.footerLabel}>{this.props.footerText}</Text>
          </Container>
        </Container>
    )
  }
}

export default Slide;

const style = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleBox: {
    flex: 4,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  titleLabel: {
    fontWeight: 'bold',
    color: 'white',
    fontSize: 25,
    marginTop: 20,
  },
  imageBox: {
    flex: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  descriptionBox: {
    flex:5,
    flexDirection: 'row'
  },
  description:{
    paddingHorizontal: 40,
    color: 'white',
    fontSize: 16,
  },
  footerBox: {
    flex: 2,
    flexDirection:'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  footerLabel: {
    padding: 2,
    color: 'white',
    marginBottom: 10,
    fontSize: 12
  }
})
