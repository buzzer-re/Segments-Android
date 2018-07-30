import React, { Component } from 'react';
import { StyleSheet, Image} from 'react-native';
import { Container,List,Content, ListItem } from 'native-base'

import { Card, Icon, Text, Button } from 'react-native-elements';

class ProductsList extends Component {
	constructor(props) {
		super(props);
		this.state = {
			cards: this.props.produtos,
			car: new Map(),
			modalVisible: false
		}
		this.addProduct = this.addProduct.bind(this);
		this.openModal = this.openModal.bind(this);
		console.log(this.props);
	}
  static navigationOptions = {
  	title: 'Produtos'
  }
	componetDidMount() {
		let cards = this.state.cards;

		for( let i = 0; i < cards.length; i++ ) 
			cards[i].marked = false;
		
		this.setState({
			cards
		})
	}


	addProduct = (product,index) => {
		let productMap   = this.state.car;
		let produtcArray = this.state.cards;
		if (!productMap.has(product.hash)) {
			productMap.set(product.hash, product);
			produtcArray[index].marked = true;
			this.setState({
				car: productMap,
				cards: produtcArray
			});
		} else {
			productMap.delete(product.hash);
			produtcArray[index].marked = false;
			this.setState({
				car: productMap,
				cards: produtcArray,
			});
		}
		console.log(productMap);
		this.props.addToCar(productMap);
	}

	openModal = () => {
		this.props.screenProps.modal();
	}

	render() {
		const produtos = this.state.cards;
		return (
			<Container style={styles.container}>
					{produtos.length <= 0 ? (
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
										<Button
											icon={<Icon name="add-shopping-cart" color='#ffffff' />}
											fontFamily='Lato'
											onPress={() => {
												this.addProduct(produtc,i);
											}}
											buttonStyle={{
												borderRadius: 0, marginLeft: 0, marginRight: 0, marginBottom: 0,
												backgroundColor:!produtc.marked ? '#0F5DD2' : '#C71414'
											}}
											title={`${produtc.marked ? "Remover do " : "Adicionar ao "}carrinho`} />
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

export default ProductsList;