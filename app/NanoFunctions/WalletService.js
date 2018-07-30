import * as WalletFunctions from './Wallet';

import bigInt from 'big-integer';

class WalletService {
  constructor(wallet) {
    this.lastBlock = '',
    this.cleanWallet = wallet;
    this.wallet = wallet;
    this.canSync = false;
    this.sync = this.sync.bind(this);
    this.pendingBlockService = this.pendingBlockService.bind(this);
    this.sendNano = this.sendNano.bind(this);
    this.getWallet = this.getWallet.bind(this);
    this.getBalance = this.getBalance.bind(this);
    this.getLastBlock = this.getLastBlock.bind(this);
    this.startSync = this.startSync.bind(this);
    this.stopSync = this.stopSync.bind(this);
    console.log(this.wallet);
  }

  sync = async () => {
    const frontier = await WalletFunctions.loadChains(this.wallet);
    //const blk = await WalletFunctions.getPendingBlocks(this.wallet, frontier);
    this.lastBlock = frontier;
    this.pendingBlockService(frontier);
  }

  pendingBlockService = async (frontier) => {
    if (this.canSync) {
      console.log('Getting pendings...');
      const blk = await WalletFunctions.getPendingBlocks(this.wallet, frontier);
      //if (blk) await WalletFunctions.loadChains(this.wallet);// Maybe we dont need that :D
      this.lastBlock = blk;
      /*
      console.log('Block origins ', this.lastBlock.getOrigin());
      console.log('Last block account =>', JSON.parse(this.lastBlock.getEntireJSON()).extras.origin.account);
      console.log('Last block hash => ', this.lastBlock.getHash(true)); */
      setTimeout(() => {this.pendingBlockService(this.lastBlock)}, 4000);
    } else {
      console.log('Sync stoped...');
    }
  }


  getLastBlock = () => {
    return this.lastBlock;
  }

  sendNano = async (to, amount) => {
    console.log(`Sending ${amount} to ${to}`);
    var amountRai = parseInt(amount * 1000000);
    var amountRaw = bigInt(amountRai).multiply("1000000000000000000000000");
    var balance   = this.wallet.getAccounts()[0].balance;
    if (amountRaw.greater(balance) || amount < 0)
      return false;

    const sendBlock = await WalletFunctions.pendingSend(this.wallet, amountRaw, to);
    return true;
  }

  getWallet = () => {
    return this.wallet;
  }

  getBalance = (nanoPrice) => {
    try{
      let balanceRaw = this.wallet.getAccounts()[0].balance;
      let rai = balanceRaw.divide('1000000000000000000000000');
      rai = parseFloat(rai/1000000);
      let real = rai * nanoPrice;
      return { rai: rai, real: real }
    } catch(err) {
      console.log(err);
      return { rai: 0, real: 0 }
    }
  }

  getNextSendBlock = async (to) => {
    let value = 0.000001;
    let amountRai = parseInt(value * 1000000);
    let amountRaw = bigInt(amountRai).multiply("1000000000000000000000000");
    return await WalletFunctions.getNextPendingSendHash(this.wallet, amountRaw, to);
  }


  startSync = () => {
    this.canSync = true;
    if (this.lastBlock != '')
      this.pendingBlockService(this.lastBlock);
    else
      this.sync();
  }

  stopSync = () => {
    this.canSync = false;
  }
}

export default WalletService;
