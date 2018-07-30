import React, { Component } from 'react';
import { Container, Text, Content, List } from 'native-base';
import { StyleSheet, FlatList, View, Alert} from 'react-native';
import ButtonComponent from 'react-native-button-component';

import BigInt from 'big-integer';

import { Overlay, ListItem } from 'react-native-elements';
import Icon from 'react-native-vector-icons/dist/Entypo';

class Car extends Component {

	constructor(props) {
		super(props);
		this.state = {
			pending: this.props.pending,
			buttonState: 'upload'
		};
    console.log(this.state.pending);
    let totalPriceNano = 0.0;
    let totalPriceReal = 0;
    
    for (product of this.state.pending) {
      totalPriceReal += parseFloat(product.price);
      totalPriceNano += parseFloat(product.nanoPrice);
    }

    this.state.totalPriceNano = totalPriceNano.toFixed(3);
    this.state.totalPriceReal = totalPriceReal;

    this.onSubmit = this.onSubmit.bind(this);
    console.log(this.state);
	}

  onSubmit = () => {
  	let balance = global.walletService.getBalance();
  	let price = this.state.totalPriceNano; 
  	if (balance.rai <= price/*false*/) {
  		Alert.alert('Error', 'Você não tem fundos suficientes, ponha um pouco de Nano para você');
  		this.props.close()
  		return ;
  	}
  	console.log(`Balance ${balance} price ${price}`);
  	this.state.pending.price = this.state.totalPriceNano;
    
    this.props.onFinish(this.state.pending);
  }

	render() {
		return (
			<Overlay isVisible={true} windowBackgroundColor="rgba(0, 0, 0, .5)" width="90%" height="90%">
          <Container style={styles.titleWrapper}>
            <Text style={{alignSelf:'center'}}>Total: {this.state.totalPriceNano} NANO /{this.state.totalPriceReal.toFixed(2)} R$</Text>
            <Icon style={{alignSelf:'flex-end', bottom:30}} name="cross" size={30} onPress={this.props.close}/>
        </Container>
			
				<Content>
					<List>	
						<View>
							{
								this.state.pending.map((l, i) => (
									<ListItem
										key={i}
										leftAvatar={{ 
											source: l.imageUri,
											rounded: false,
											size:"xlarge"
										}}
										title={l.name}
										subtitle={String(l.nanoPrice.toFixed(3))}
									/>
								))
							}
						</View>
					</List>
				</Content>
        <Container style={styles.buttonBox}>
          <ButtonComponent  buttonState={this.state.buttonState} style={{width: '60%'}}
            states={{
						    upload: {
						      onPress: () => {
						        this.setState({ buttonState: 'uploading' });
						        this.onSubmit();
						      },
						      text: 'Finalizar compra'
						    },
						    uploading: {
						      spinner: true,
						      text: 'Enviando pedido...',
						    },
						  }}/>    
        </Container>

			</Overlay>
		)
	}
}


const styles = StyleSheet.create({
  buttonBox: {
    flex: 0.1,
    padding: 10,
    alignItems: 'center',
    backgroundColor: 'transparent',    
  },
  titleWrapper: {
    flex: 0.1,
  },
})
const overlayStyle = StyleSheet.create({
	container: {
		flex: 1,
	},
	title: {
		flex: 0.4,
		backgroundColor: 'red'
	}
})

export default Car;