import React, { Component } from 'react';
import { DrawerItems } from 'react-navigation';
import { StyleSheet, Alert } from 'react-native';
import { Container,Button,Icon, Content, Header, Body, Text } from 'native-base';

import * as Utils from '../../Utils/Utils';
//import Icon from 'react-native-vector-icons/dist/SimpleLineIcons'

export const CustomDraw = (props) => (
  <Container>
    <Header style={styles.header}>
      <Body style={styles.body}>
        <Text>Segments</Text>
      </Body>
    </Header>
    <Content style={{flex:10}}>
      <DrawerItems {...props} />
    </Content>
      <Button onPress={() => {
        Utils.resetOptions();
      }}><Text>Reset</Text></Button>
      <Container style={{flex:0.03}}/>
      <Button onPress={() => {
        Utils.startSync();
      }}><Text>Sync</Text></Button>
  </Container>
)


const styles = StyleSheet.create({
  body: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    elevation: 0,
    shadowOpacity: 0,
    backgroundColor: 'transparent'
  },
  footer: {
    flex: 5,
    justifyContent: 'center'
  }
});
