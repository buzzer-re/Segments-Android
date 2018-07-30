import React, { Component } from 'react';
import { Container, Text }  from 'native-base';
import { DrawerItems } from 'react-navigation';

class Drawer extends Component {
  render() {
    <Container>
      <Header>
        <Body>
          <DrawerItems {...props} />
        </Body>
      </Header>
    </Container>
  }
}


export default Drawer;
