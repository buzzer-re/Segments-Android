import React from 'react';
import { DrawerNavigator } from 'react-navigation';
import Icon from 'react-native-vector-icons/dist/Entypo'
import { CustomDraw } from '../components/Draw/CustomDraw';
import  Home  from '../components/Home/Home';
import MySegments from '../components/AdminSegments/MySegments';
import MyAccount from '../components/Account/MyAccount';


export const Route = DrawerNavigator({
  Inicio: {
    screen: Home
  },
  MySegments: {
    screen: MySegments
  },
  Carteira: {
    screen: MyAccount
  }
},
{
  drawerPosition: 'left',
  contentComponent: CustomDraw,
  navigationOptions: ({ navigation }) => ({
    drawerIcon: ({ focused, tintColor}) => {
      const { routeName } = navigation.state;
      if (routeName == 'Carteira') {
        return <Icon name="wallet" style={{color: 'black', width:30}} size={30}/>
      }
    }
  })
});
