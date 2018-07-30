import React, { Component } from 'react';
import { TouchableOpacity, Alert, StyleSheet } from 'react-native';

import { Container, Content, Card, Text } from 'native-base';


class HistoryScreen extends Component {
	constructor(props) {
		super(props);
		this.state = {
			device: this.props.screenProps.device,
			blocks: new Map(),
			interval: null
		}
		this.loadCache = this.loadCache.bind(this);

		this.showBlock = this.showBlock.bind(this);
	}
  	
  componentWillUnmount() {
  	if (this.state.interval != null)
  		clearInterval(this.state.interval);
  }

  componentDidMount() {
  	this.loadCache();
  	this.state.interval = setInterval(this.loadCache, 5000);
  }

  loadCache = () => {
  	global.storage.load({
  		key: 'paidBlocks'
  	}).then((blocks) =>{
  		blocks = new Map(blocks._mapData);
			this.setState({blocks})
			console.log('Carregado');
			console.log(blocks);
  	}).catch((err) => {
  		console.log('Error on load cache history -> ', err);
  	})
  }


  static navigationOptions = {
  	title: 'Historico'
  }


  showBlock = (pending,block) => {
		let self = this;
		Alert.alert(
		  `Mesa ${pending.mesa}`,
		  `Pedido: ${pending.names.slice(0,-2)}.\n\nValor: ${pending.price} R$\n\n`,
		  [
		    {text: 'Ver Mais', onPress: () => {
		    	Alert.alert('Detalhes da carteira', `Bloco:\n ${block}\n\nChave pública: \n${pending.user_pub_key}\n`)
		    }},
		    {text: 'Fechar',onPress: () => {}},
		  ],
		  { cancelable: false }
		)
  }
	render() {
		let pendings = Array.from(this.state.blocks.values());
		let pendigsTemp = new Array();
		let blocks   = Array.from(this.state.blocks.keys());
		let blocksTemp = new Array();

		const device = this.state.device;
		for ( let i = 0; i < pendings.length; i++ ) {
			if (pendings[i].hash == device.hash) {
				pendigsTemp.push(pendings[i]);
				blocksTemp.push(blocks[i]);
			}
		}	
		console.log('Historico ', pendings);
		return (
			<Container style={styles.container}>
				<Content>
					{

						pendigsTemp.map((pending, i) => (
							<TouchableOpacity style={{padding: 20}}key={i} onPress={() => {this.showBlock(pending, blocksTemp[i])}} >
									<Card style={{padding: 20}}>
										  <Text style={{marginBottom: 10}}>
										  Pedido Confirmado: Mesa {pending.mesa}
										  </Text>
									</Card>
								</TouchableOpacity>							
						))
				}
				</Content>
			</Container>	
		)
	}
}


const styles = StyleSheet.create({
	container: {
		flex:1,
		padding: 15
	},
})
export default HistoryScreen;