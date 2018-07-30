import React from 'react';
import { TabNavigator } from 'react-navigation'
import ReceiveScreen from './ReceiveScreen';
import SendScreen from './SendScreen';
import HistoryScreen from './HistoryScreen';
import { Icon } from 'native-base';

export default TabNavigator({

  Enviar: SendScreen,
  Receber: ReceiveScreen,

},
{
  tabBarOptions: {
    style: {
      backgroundColor: 'transparent'
    },
  }
}, { lazy: true }
);
