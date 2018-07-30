import React from 'react';
import { View } from 'react-native';
import { StackNavigator } from 'react-navigation';
import Configure from './Configure';
import Sync from './Sync';

const SyncRoute = StackNavigator({
  Sync: {
    screen: Sync
  },
  Configure: {
    screen: Configure
  }
},{
  headerMode: 'none',
  cardStyle: {backgroundColor: 'transparent'},
  transitionConfig: () => ({
    transitionSpec: {
      duration: 0
    }
  })
});

export default SyncRoute;
