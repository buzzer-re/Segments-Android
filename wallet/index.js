const rai_wallet         = require('rai-wallet');
const Wallet             = rai_wallet.Wallet;
const axios              = require('axios');
const WalletFunctions    = require('./lib/Wallet');
const inquirer           = require('./lib/inquirer')
const fs                 = require('fs');
const chalk              = require('chalk');
const clear              = require('clear');
const figlet             = require('figlet');
var CLI                  = require('clui'),Spinner = CLI.Spinner;

clear();
console.log(chalk.blue(
  figlet.textSync('Light Nano wallet')
))


const run = async (walletCiphred) => {
  const cipherCode = await inquirer.askCipherCode();
  var wallet = WalletFunctions.loadWallet(walletCiphred, cipherCode.pass);
  if (!wallet) {
    console.log(chalk.red('Wrong pass!!'));
    run(walletCiphred);
  }
  var spin = new Spinner('Syncing...');
  spin.start();
  await WalletFunctions.getBalances(wallet);
  spin.stop();
  var option = {};
  while (option.receive !== 'Quit') {
    option = await inquirer.options();
    switch(option.receive) {
      case 'Receive':
        console.log(chalk.blue("Send nano to " + wallet.getAccounts()[0].account));break;
      case 'View Account':
        console.log(chalk.blue(WalletFunctions.getBalance(wallet) + " Nano"));break;
      case 'Send':
        var data = await inquirer.send();11122344111
        var to = data.address;
        var amount = data.amount;
        // var to = "xrb_3e89hy4xx18cj3tu6yf98xsnmazzu7wanp3xaicsgmkad9hx8zeib98a4dnr";
        // var amount = "0.000005";
        spin = new Spinner("Enviando...");
        spin.start();
        await WalletFunctions.sendNano(wallet,amount,to);
        spin.stop();
        break;

    }
  }
}


// function run(wallet) {
//   console.log('Welcome\n\n');
//   Helpers.Wallet.getBalances(wallet);
//   for (var i = 0; i < wallet.getAccounts().length; i++) {
//     console.log(`Wallet: ${wallet.getAccounts()[i].account}`);
//     console.log(`Balance: ${wallet.getAccounts()[i].balance.value} Nano`)
//   }
// }

fs.readFile('./wallet.enc','utf8',function(err,wallet){
  if (err && err.code == 'ENOENT'){
    Helpers.Entry.firstTime();
  } else if (!err) {
    console.log(chalk.blue('\n\nWallet Found!'));
    run(wallet);
    // prompt.get(schema, function(err, result) {
    //   if (err) throw err;
    //   console.log('Loading your wallet...');
    //   var walletDecipher = Helpers.Wallet.loadWallet(wallet, result.password);
    //   run(walletDecipher);
    // });
  } else throw err;
});
