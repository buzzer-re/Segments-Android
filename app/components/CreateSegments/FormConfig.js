import React, { Component } from 'react';
import { StyleSheet, Image, Alert, ImageStore, TouchableOpacity } from 'react-native';
import { Form, Content, Input, Item, Label, Icon, Container, Text } from 'native-base';

import axios from 'axios';

import  ImagePicker from 'react-native-image-picker';
import ButtonComponent from 'react-native-button-component';

import ImageResizer from 'react-native-image-resizer';

const API_KEY = 'omRv-Ejog-EfNN-uHlC-Ujqd-UfLf-lSbe-wK8I-BXLL-UpuA-ItkI';

class FormConfig extends Component {

  constructor(props) {
    super(props);
    this.state = {
      name: '',
      buttonState: 'upload',
      description: '',
      imageBytes: '',
      logo: require('../../assets/NoIMage.png'),
      imageUri: '',
      hasLogo: false,
      imageOptions: {
        title: 'Selecione sua logo',
        storageOptions: {
          skipBackup: true,
          path: 'images',
          logo: ''
        }
      }
    };
    this.showImagePicker = this.showImagePicker.bind(this);
    this.checkInfo       = this.checkInfo.bind(this);
  }

  showImagePicker = () => {
    console.log('foififif');
    ImagePicker.showImagePicker(this.state.imageOptions, (response) => {
      if (response.didCancel) {
        // Tapped on cancel
      } else if (response.error) {
        // Some error
      } else  { // everything is fine, resize image and gets his b64 string
        ImageResizer.createResizedImage(response.uri, 800, 600, 'JPEG', 80).then((resize) => {
          this.setState({
            logo: {uri: resize.uri},
            imageUri: resize.uri,
          })
        }).catch((err) => {
          console.log('Err ', err);
        });
        //console.log(this.state.imageUri);
      }
    })
  }

  checkInfo = () => {
    if (this.state.name != '' && this.state.description != '') {
      let info = {name: this.state.name, description: this.state.description, image: this.state.logo, imageB64: this.state.imageB64};
      const imageForm = new FormData();

      imageForm.append('file', {name: this.state.name, type: 'image/jpg', uri: this.state.imageUri});
      axios({
        method: 'POST',
        data: imageForm,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
          'api_key': API_KEY
        },
        url: global.imageApi
      }).then((response) => {
          let imageUrl = response.data.url;
          let info = {
            name: this.state.name,
            description: this.state.description,
            image: { uri: imageUrl },
          };
          this.props.onSubmit(info);
      }).catch((err) => {
        console.log('Error upload image product ', err);
        Alert.alert('Erro', 'Erro ao salvar imagem, por favor tente novamente');
        this.setState({
          buttonState: 'upload'
        });
      })

    } else
       Alert.alert('Você precisa preencher todos os campos');
       this.setState({
        buttonState: 'upload'
       })
  }

  render() {
    return (
      <Container style={styles.container}>

        <Container style={styles.title}>
          <Text style={{color: 'white'}}>Configure o seu novo Segments</Text>
        </Container>

        <Container style={styles.form}>
          <Container style={styles.imageUpload}>
            <TouchableOpacity onPress={this.showImagePicker} style={styles.imageBox}>
               <Image style={{width: 250, height:250}} source={this.state.logo} />
            </TouchableOpacity>
         
          </Container>
          <Container style={{flex: .08}}></Container>
          <Content>
            <Form onSubmit={this.createWallet}>
              <Item floatingLabel>
                <Label style={{color: 'white'}}>Nome</Label>
                <Input
                   ref={(c) => this._input = c}
                   minLength={8}
                   textColor='white'
                   onSubmitEditing={this.decipherWallet}
                   onChangeText={(name) => this.setState({name})}/>
              </Item>
              <Item floatingLabel>
              <Label style={{color: 'white'}}>Descrição</Label>
                <Input
                   ref={(c) => this._input = c}
                   minLength={8}
                   textColor='white'
                   onChangeText={(description) => this.setState({description})}/>
              </Item>
              <Icon floatingLabel>
                <Label style={{color: 'white'}}></Label>
              </Icon>
            </Form>
          </Content>
        </Container>
        
        <Container style={styles.buttonBox}>

          <ButtonComponent buttonState={this.state.buttonState} style={{width: '60%'}} text="Continuar" states = {{
            upload: {
              onPress: () => {
                this.setState({buttonState: 'uploading'});
                this.checkInfo();
              },
              text: 'Salvar'
            },
            uploading: {
              spinner: true,
              text: 'Salvando imagem...'
            }
          }}/>    
        </Container>
        <Container style={{flex:0.8}} />
      </Container>

    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    justifyContent: 'center',
    alignItems:'center'
  },
  form: {
    flex:8,
    padding: 20,
  },
  imageUpload: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection:'column',
  },
  imageBox: {
    flex: 4,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
    backgroundColor: 'transparent',
  },
  buttonBox: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',    
  }
})

export default FormConfig;
