var rai_wallet = require('rai-wallet');
var Wallet     = rai_wallet.Wallet;
var fs         = require('fs');
var prompt     = require('prompt');

var entryPoint = {
  firstTime: function() {
    var schema = {
      properties: {
        password: {
          hidden: true
        }
      }
    }
    console.log('Hello, lets create that wallet your faggot!');
    console.log('Choose a password wisely!');
    prompt.start();

    prompt.get(schema, function(err, result) {
      if (!err) {
        var wallet = new Wallet(result.password);
        console.log('Wallet created, making your account');
        var seed = wallet.createWallet();
        console.log('Save your seed! => ' + seed);
        console.log('Saving your wallet now as wallet.enc');
        fs.writeFile('./wallet.enc', wallet.pack(), function(err,result) {
          if (err) throw err;
          console.log('Your wallet has been successfully created!');
        })
      }
    })
  },
  loadWallet: function() {
    console.log('Loading your wallet...');
  }
}
