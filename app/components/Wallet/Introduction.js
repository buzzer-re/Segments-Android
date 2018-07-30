import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import {Button,Header,Content, Text, Container} from 'native-base';

import Slide from '../Slide/Slide';
import CreateWallet from './CreateWallet';
import * as Animatable from 'react-native-animatable';
import Swiper from 'react-native-swiper';
import ButtonComponent, { CircleButton, RoundButton, RectangleButton } from 'react-native-button-component';

class Introduction extends Component {
  constructor(props) {
    super(props);
    this.state = {
      slide: false,
      swiper: true,
      intro: true,
    }
    this.startSlide = this.startSlide.bind(this);
    this.startApp = this.startApp.bind(this);
  }

  startSlide = () => {
    this.setState({
      slide: true,
      swiper: true,
      intro: false
    })
  }

  showSeed = (seed,wallet) => {
    this.setState({
      seed: seed,
      slide: false,
      intro: false,
      wallet: wallet
    })
  }

  startApp = () => {
    let wallet = this.state.wallet;
    this.props.onUnlock(wallet);
  }

  render() {
    if (this.state.intro) {
      return (
        <Container style={style.container}>

          <Container style={style.logoBox}>
            <Animatable.Text
              animation="zoomIn"
              iterations={1}
              style={style.logoText}>
              Segments
            </Animatable.Text>
          </Container>

          <Container style={style.labelBox}>
            <Animatable.Text iterations={1} animation="flipInY" style={style.labelText}>Vamos começar</Animatable.Text>
          </Container>

          <Animatable.View iterations={1} animation="flipInY" style={style.buttonBox}>
              <ButtonComponent  text="Criar Carteira" style={style.button} onPress={this.startSlide}/>
          </Animatable.View>

        </Container>
      )
    } else if(this.state.slide) {
      return (
        <Swiper loop={false} scrollEnabled={this.state.swiper}>
          <View style={style.slideWraper}>
            <Slide
              title="Use Nano"
              description="Transações velozes, seguras e com o seu total controle."
              footerText="Envie e receba Nano, sem taxas."
              image={require('../../assets/nano.png')} />
          </View>
          <View style={style.slideWraper}>
            <Slide
              title="Você no controle"
              description="Participe de uma rede monetária totalmente descentralizada, livre e sem intervenção de terceiros."
              footerText="Somente VOCÊ tem acesso a sua chave criptografada."
              image={require('../../assets/nano.png')} />
          </View>
          <View style={style.slideWraper}>
            <Slide
              title="Alta segurança"
              description="Sua carteira é gerada e mantida somente no seu aplicativo, você tem total controle sobre suas finanças."
              footerText="Use sua chave pública para que possam lhe enviar Nano."
              image={require('../../assets/nano.png')} />
           </View>
           <View style={style.slideWraper}>
             <Slide
               title="Use Segments"
               description="Com Segments, você pode usar Nano para realizar pagamentos no seu dia a dia."
               footerText="Use-o onde você o encontrar."
               image={require('../../assets/nano.png')} />
            </View>
            <View style={style.slideWraper}>
              <Slide
                title="Preparado?"
                description="Desfrute de todas as possibilidades que a Blockchain oferece, crie sua carteira agora!"
                footerText="Busque Segments, envie ou receba Nano."
                image={require('../../assets/nano.png')} />
             </View>
               <CreateWallet showSeed={this.showSeed} swiper={this.state.swiper}/>

    </Swiper>)

    }
      else {
        return (
          <Swiper loop={false}>
            <View style={style.slideWraper}>
              <Slide
                title="Carteira criada com sucesso!"
                description="Mas antes, por favor, anote sua semente em um pedaço de papel, com segurança!"
                seed={this.state.seed}
                footerText="Tenha certeza de que não tem ninguém o olhando!"
                image={require('../../assets/nano.png')} />
            </View>
            <View style={style.slideWraper}>
              <Slide
                title="Anote em um papel ou a imprima!"
                description={this.state.seed}
                last={true}
                footerText="Não bata foto da tela nem salve online! É perigoso e você pode perder sua carteira!"
                onPress={this.startApp}
                image={require('../../assets/nano.png')} />
            </View>
          </Swiper>
        )
      }
  }
}

const style = StyleSheet.create({
  container: {
    flex: 1,
  },
  logoBox: {
    flex:10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  logoText: {
    fontSize: 42,
    marginTop: 20,
    color: 'white',
  },
  labelText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white'
  },
  labelBox: {
    flex: 2,
    alignItems: 'center',
  },
  buttonBox: {
    flex: 4,
    alignItems: 'center',
    justifyContent: 'center'
  },
  button: {
    width: '40%'
  },
  slideWraper:{
    flex:1,
    padding: 2,
  }
})

export default Introduction;
