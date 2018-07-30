import React, { Component } from 'react';
import { StyleSheet, Image} from 'react-native';
import { Container,List,Content, ListItem } from 'native-base'

import { Card, Icon, Text, Button } from 'react-native-elements';

class CarrinhoScreen extends Component {
	constructor(props) {
		super(props);
		this.state = {
			cards: this.props.screenProps.cards,
			modalVisible: false
		}
		this.addProduct = this.addProduct.bind(this);
		this.openModal = this.openModal.bind(this);
		console.log(this.props);
	}
  static navigationOptions = {
  	title: 'Produtos'
  }
		
	addProduct = () => {
		console.log('Lets add!');
	}

	openModal = () => {
		this.props.screenProps.modal();
	}

	render() {
		const produtos = this.state.cards;
		return (
			<Container style={styles.container}>

				<Container style={styles.buttonContainer}>
					<Icon onPress={this.openModal} style={{color: 'white'}} name="add" />
				</Container>
				
					{ produtos.length <= 0 ? (
					<Container style={styles.name}>
						<Text style={styles.nameText}>Sem produtos!  :(</Text>
					</Container>
						) : (
				<Container style={
					styles.cards}>   
					<Content>
						<List>
						{
							produtos.map((produtc,i) => (
									<Card
										key={i}
										title={produtc.name}
										image={produtc.imageUri}>

										<Text style={{marginBottom:10}}>{produtc.name} - {produtc.nanoPrice.toFixed(3)} NANO</Text>
									</Card>
							))
						}
						</List> 
					</Content>
				</Container>
					)}
			</Container>
		)
	}
}
const styles = StyleSheet.create({
	container: {
		flex: 1
	},
	buttonContainer: {
		flex: 0.003,
		padding: 20,
		justifyContent: 'space-between',
		alignItems: 'flex-end'
	},
	name: {
		flex: 1,
		padding: 40,
		justifyContent: 'flex-start',
		alignItems: 'center'
	},
	nameText: {
		fontSize: 18,
		color: 'white'
	},
	cards: {

	}
});

export default CarrinhoScreen;