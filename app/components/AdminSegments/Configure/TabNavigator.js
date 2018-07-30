import React from 'react';
import { TabNavigator } from 'react-navigation';

import CarrinhoScreen   from './CarrinhoScreen';
import HistoryScreen		   from './HistoryScreen';
import PedidosScreen 	from './PedidosScreen';

export default TabNavigator({
	Carrinho: CarrinhoScreen,
	Pedidos: PedidosScreen,
	Historico: HistoryScreen
},
{
	tabBarOptions: {
		style: {
			backgroundColor: 'transparent'
		}
	}
},
{lazy: true}
);
