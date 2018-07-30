var rai_wallet = require('rai-wallet');
var Wallet     = rai_wallet.Wallet;
var Block      = rai_wallet.Block;
var axios      = require('axios');
var fs         = require('fs');

const API_KEY = "bf41ab41-349a-11e8-ad54-f98d6f63cccf";
var wallet_load;

const rpc = axios.create({
  baseURL: 'https://api.nanode.co',
  headers: {
    Authorization: API_KEY
  }
});

module.exports = {
  loadWallet: function(wallet,password) {
    wallet_load = new Wallet(password);
    try {
      wallet_load.load(wallet);
      return wallet_load;
    } catch(err) {
      console.log(err);
    }
  },

  getBalances: async function(wallet) {

      const frontiers = await this.loadChains(wallet);
      var blk = await this.pendingReceive(wallet,frontiers)
      if (blk != false)
        await this.broadcastBlock(wallet,blk);
      else {
        console.log('Sem pending blocks...');
      }

  },

  loadChains: async function(wallet) {
    /// Getting frontiers
    var accounts = [];
    for ( let acc in wallet.getAccounts() )
      accounts.push(wallet.getAccounts()[acc].account);

    /// First, get all frontiers blocks of our accounts!

    const accounts_frontiers = await rpc.post('/', {
      action: 'accounts_frontiers',
      accounts: accounts
    }).catch(function(err) {
      console.log(err.response.data)
    });
    const frontiers = accounts_frontiers.data.frontiers;
    var response = {}
    response['accounts'] = {}
    for ( let i in accounts ) {
      /// Now, we get our account balance
      const account_balance = await rpc.post('/',{
        action: 'account_balance',
        account: accounts[i]
      });
      response['accounts'][accounts[i]] = account_balance.data
      // Now, we check if has a frontier block, if yes, we get the 5 last blocks, the "chain"
      if (frontiers[accounts[i]]) {
        const block = await rpc.post('/',{
          action: 'chain',
          block: frontiers[accounts[i]],
          count: 500
        }).catch(function(err) {
          console.log(err.response.data);
        });
        /// We get the block chain, then make the data
        var block_chain = block.data.blocks;
        const blocks = await rpc.post('/', {
          action: 'blocks_info',
          hashes: block_chain
        });

        var blocks_info = blocks.data.blocks;
        var account_blocks = []
        for (let b in blocks_info) {
          var contents = JSON.parse(blocks_info[b].contents);
          if (contents['type'] == "open" || contents['type'] == "receive") {
            const block_account = await rpc.post('/', {
              action: 'block_account',
              hash: contents['source']
            });
            blocks_info[b]['origin'] = block_account.data
          }

          account_blocks.push(blocks_info[b]);
        }
        response['accounts'][accounts[i]]['blocks'] = account_blocks.reverse();
      } else {
        response['accounts'][accounts[i]]['blocks'] = []
      }
      // Now we adjust all accounts with the blocks...

      for (block of response['accounts'][accounts[i]]['blocks']) {
        var new_block = new Block();
        new_block.buildFromJSON(JSON.parse(block.contents));

        if (block.origin) new_block.setOrigin(block.origin);
        new_block.setAccount(accounts[i]);
        new_block.setAmount(block.amount);
        new_block.setImmutable(true);
        wallet.importBlock(new_block, accounts[i], false);
      }
      wallet.useAccount(accounts[i]);
    }
    return accounts_frontiers;
  },

  pendingReceive: async function(wallet,frontiers) {
    const account = wallet.getAccounts()[0].account;
    const pending = await rpc.post('/', {
      action: 'accounts_pending',
      accounts: [account],
      count: 1,
      source: true
    }).catch(function(err){
      console.log(`Error: ${err.response.data.error}`);
    });
    if (pending.data.blocks.lenght <= 0) return false;
    const blk = Object.keys(pending.data.blocks[account])[0];
    const from = pending.data.blocks[account][blk]['source'];
    const amount = pending.data.blocks[account][blk]['amount'];
    console.log(frontiers.data);
    const build_blk = wallet.addPendingReceiveBlock(blk, account, from, amount);
    const workResult = await rpc.post('/', {
      action: 'work_generate',
      hash: frontiers.data.frontiers[account]
    }).catch(function(err){
      console.log(`Error: ${err.response.data.error}`)
    });
    console.log(workResult.data.work);

    build_blk.setWork(workResult.data.work);
    return build_blk

  },

  broadcastBlock: async function(wallet, block) {
    const processResult = await rpc.post('/', {
      action: 'process',
      block: block.getJSONBlock()
    }).catch(function(err) {
     console.log(`Error: ${err.response.data.error}`);
    })

    console.log('Saving changes...');
    fs.writeFile('./wallet.enc', wallet.pack(), function(err, result) {
      if (!err) console.log('Saved!');
    });
  }

}
