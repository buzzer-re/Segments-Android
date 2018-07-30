import React, { Component } from 'react'; 
import { StyleSheet, Image, Alert,TouchableOpacity } from 'react-native';
import { Form, Content, Input, Item, Label, Container, Text } from 'native-base';

import Icon from 'react-native-vector-icons/dist/Entypo';

import  ImagePicker from 'react-native-image-picker';
import ButtonComponent from 'react-native-button-component';

import ImageResizer from 'react-native-image-resizer';
import axios from 'axios';

const API_KEY = 'omRv-Ejog-EfNN-uHlC-Ujqd-UfLf-lSbe-wK8I-BXLL-UpuA-ItkI';

class ProductForm extends Component {
	constructor(props) {
		super(props);

		this.state = {
			logo: require('../../../assets/NoIMage.png'),
			imageData: '',
			name: '',
			price: 0,
			nanoPrice: 0,
			priceStr: '',
      buttonState: 'upload'
		};

		this.onSubmit = this.onSubmit.bind(this);
		this.showImagePicker = this.showImagePicker.bind(this);
		this.convert = this.convert.bind(this);
	}
	
	onSubmit = () => {
    // Upload image
    const imageData = new FormData();
    imageData.append('file',{name: this.state.name, type:'image/jpg', uri:this.state.logo.uri});

    axios({
      method: 'POST',
      data: imageData,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'multipart/form-data',
        'api_key': API_KEY
      },
      url: global.imageApi
    }).then((response) => {
      let imageUrl = response.data.url;
      this.state.logo = { uri: imageUrl };
      this.props.addProduct(this.state);
    }).catch((err) => {
      console.log('Error upload image product ', err);
      Alert.alert('Erro', 'Erro ao salvar imagem, por favor tente novamente');
      this.setState({
        buttonState: 'upload'
      });
    })
		
	}

	convert = (price) => {
		let nanoPrice = price/global.nanoPrice;
		let priceStr = `${nanoPrice.toFixed(5)} NANO`;
		this.setState({
			price,
			priceStr,
			nanoPrice
		});
	}

  showImagePicker = async () => {
    ImagePicker.showImagePicker(this.state.imageOptions, (response) => {7
      if (response.didCancel) {
        // Tapped on cancel
      } else if (response.error) {
        // Some error
      } else  { // everything is fine
      	ImageResizer.createResizedImage(response.uri, 800, 600, 'JPEG', 80).then((resize) => {
  				this.setState({
  					logo: {uri: resize.uri}
  				})
				}).catch((err) => {
				});
      }
      
    })
  }

	render() {
		return (
      <Container style={styles.container}>
        <Container style={styles.titleWrapper}>
          	<Text style={{alignSelf:'center'}}>Adicionar produto</Text>
        		<Icon style={{alignSelf:'flex-end', bottom:30}} name="cross" size={30} onPress={this.props.modal}/>
        </Container>

        <Container style={styles.form}>
          <Container style={{flex: .08}}></Container>
          <Content>
            <Form onSubmit={this.createWallet}>
              <Item floatingLabel>
                <Label>Nome</Label>
                <Input
                   ref={(c) => this._input = c}
                   minLength={8}
                   textColor='white'
                   onSubmitEditing={this.decipherWallet}
                   onChangeText={(name) => this.setState({name})}/>
              </Item>
              <Item floatingLabel>
              <Label>R$ Preço - {this.state.priceStr}</Label>
                <Input
                	 keyboardType='numeric'
                   ref={(c) => this._input = c}
                   minLength={8}
                   textColor='white'
                   onChangeText={(price) => this.convert(price)}/>
              </Item>
            </Form>
          </Content>
           <Container style={styles.imageUpload}>
            <TouchableOpacity onPress={this.showImagePicker} style={styles.imageBox}>
               <Image style={{width: 250, height:250}} source={this.state.logo} />
            </TouchableOpacity>
         
          </Container>
        </Container>
        
        <Container style={styles.buttonBox}>
          <ButtonComponent  buttonState={this.state.buttonState} style={{width: '60%'}}
            states={{
                upload: {
                  onPress: () => {
                    this.setState({ buttonState: 'uploading' });
                    this.onSubmit();
                  },
                  text: 'Adicionar'
                },
                uploading: {
                  spinner: true,
                  text: 'Salvando produto...',
                },
              }}/>       
        </Container>

      </Container>
		)
	}
}

const styles = StyleSheet.create({
  container: {
  },
  titleWrapper: {
  	flex: 1,
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
    alignItems: 'center',
    backgroundColor: 'transparent',    
  }
})

export default ProductForm;