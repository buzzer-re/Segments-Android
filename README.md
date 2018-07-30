# Segments App

Segments is react native app for a university project that envolve [Nano Currency](https://nano.org) for payaments using bluetooth as middleware, controlled by a ESP32.

The basic idea behind Segments is to make a prototype of a device that can be used in any place to store the core information that allow client order for some product directly from his app in different places, like a Coffe Shop, Restaurant etc, and pay instantly, removing the need to wait any queue!

Configure your Segments device(esp32), using bluetooth 4.0(Bluetooth Low Energy) and start to pair and make your requests, everything is proccessed in Nano currency BlockLattice and confirmed in real time, with high security that envolve a cryptocoin.

All nano operations run on top of [rai-wallet](https://github.com/chriscohoat/rai-wallet) code used on https://nanowallet.io, and use only the Node to broadcast/retrieve the blocks. Every operation happen in YOUR APP, you have fully control over your money and keys.

Lean more about develop nano applications on their new platform [Nano Developers](https://developers.nano.org/)

See the [video](https://streamable.com/o0yyt) of the usage.

##### Setup


You will need [rn-nodify](https://github.com/tradle/rn-nodeify) in order to compile your project propely. React native doesn't acceptsome nodejs libraries directly(like crypto or blakejs) this is a hack then to use properly.

```
  npm i 
```
or
```
  yarn install
```

Then apply our hack
```
  rn-nodify --hack --install 
```

Make sure to link all native dependecies
```
  react-native link
```
Run the app
```
  react-native run-android
```

This was a university project, so i didn't have enough time to make everything nicer on code. you will probably find some nasty things in the source, be free to change!
