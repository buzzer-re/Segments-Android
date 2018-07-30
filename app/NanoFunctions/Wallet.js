import axios from 'axios';
import { Wallet, Block } from '../rai-wallet';
/*
  We are using Nanode as API, just to process and broadcast our blocks
  Everything happen in this app, and nanode just calculate the pow and publish the block.
*/
const API_KEY = 'xxxx-xxx-xxx-xxx-xxxx';

const rpc = axios.create({
  baseURL: 'https://xxxxxx',
  headers: {
    Authorization: API_KEY
  }
});


/*
  First, we need load our chains in order to get the frontiers blocks.
  if is our first time, we need get our open blocks
*/
export const loadChains = async (wallet) => {
  let accounts = []; // we have only one account for now, we dont wanne use all nanode requests :D
  /* This can be a more nice when we have our own node :D */
  console.log('coe');
  for ( let i in wallet.getAccounts() ) {
      accounts.push(wallet.getAccounts()[i].account)
  }
  const accounts_frontiers = await rpc.post('/', {
    action: 'accounts_frontiers',
    accounts: accounts
  }).catch((err) => {
    console.log(err.response.data);
  });
  const frontiers = accounts_frontiers.data.frontiers;
  if (!frontiers) return wallet.getAccounts()[0].lastHash;
  let walletSync = {};
  walletSync['accounts'] = {};
  for ( let account of accounts ) {
    // Now we get our balances...
    const account_balance = await rpc.post('/', {
      action: 'account_balance',
      account: account
    });
    walletSync['accounts'][account] = account_balance.data;
    // We now check if has frontiers in that account, if yes, we get the block_chain
    if (frontiers[account]) {
      const chain = await rpc.post('/', {
        action: 'chain',
        block: frontiers[account],
        count: 500
      }).catch((err) => {
        console.log(err.response.data);
      });
      const blocks_hashes = chain.data.blocks;

      const blocks = await rpc.post('/', {
          action: 'blocks_info',
          hashes: blocks_hashes
      });
      const block_chain = blocks.data.blocks;
      var accounts_block = [];
      for ( let b in block_chain ) {
        let contents = JSON.parse(block_chain[b].contents);
        if ( contents['type'] == 'open' || contents['type'] == 'receive' ) {
          const block_account = await rpc.post('/', {
            action: 'block_account',
            hash: contents['source']
          });
          block_chain[b]['origin'] = block_account.data;
        }
        accounts_block.push(block_chain[b]);
      }
      walletSync['accounts'][account]['blocks'] = accounts_block.reverse();
    } else {
      walletSync['accounts'][account]['blocks'] = [];
    }
    // Sync our account
    for ( block of walletSync['accounts'][account]['blocks']) {
      let new_block = new Block();
      new_block.buildFromJSON(JSON.parse(block.contents));

      if (block.origin) new_block.setOrigin(block.origin);
      new_block.setAccount(account);
      new_block.setAmount(block.amount);
      new_block.setImmutable(true);
      wallet.importBlock(new_block, account, false);
    }
    wallet.useAccount(account);

  }

  return wallet.getAccounts()[0].lastHash;
}

/*
  After we load our chains, we can check for pending blocks and use our previous blocks
  to generate pow and publish our blocks
*/

export const getPendingBlocks = async (wallet, frontier) => {
  let accounts = [];
  for ( account of wallet.getAccounts() ) {
    accounts.push(account.account);
  }
  // getting all pending blocks of our accounts...
  for (account of wallet.getAccounts()) {
    const pending = await rpc.post('/', {
      action: 'accounts_pending',
      accounts: [account.account],
      source: true
    }).catch((err) => {
      console.log(err.response.data);
    })
    const pendingBlocks = pending.data.blocks;
    if (pendingBlocks[account.account].length <= 0) return frontier;
    console.log('Previous block ', frontier.getHash(true));
    for ( block of Object.keys(pendingBlocks[account.account]) ) {
      const hash = account.lastHash !== false ? frontier.getHash(true) : wallet.getPublicKey(true);
      const blk = block;
      const from = pendingBlocks[account.account][block]['source'];
      const amount = pendingBlocks[account.account][block]['amount'];
      console.log('Hash for work ', hash);
      const build_blk = wallet.addPendingReceiveBlock(blk, account.account, from, amount);
      const work_result = await rpc.post('/', {
        action: 'work_generate',
        hash: hash
      }).catch((err) => {
        console.log(err.response.data)
      });
      console.log('Work ', work_result.data.work);
      const work = work_result.data.work
      build_blk.setWork(work);

      const new_hash = await broadcastBlock(build_blk);
      console.log(build_blk.getHash(true));
      console.log(new_hash);
      console.log('New block ', build_blk.getHash(true));
      return build_blk;
    }
    // pending all blocksim
    if (frontier.lastHash !== false)
      return account.lastHash;
  }
  return frontier;
}

/*
  Here we process our new created block into our/nanode node

*/

export const broadcastBlock = async (blk) => {
  const processResult = await rpc.post('/', {
    action: 'process',
    block: blk.getJSONBlock()
  }).catch((err) => {
    console.log(err.response.data);
  })

  return processResult.data;
}

/*
  To make a send block, we need get the address, and the amount
  check our frontiers block (loadChains), then create our block and publish
*/

export const pendingSend = async (wallet, amount, to) => {
  const account = wallet.getAccounts()[0].account;
  const sendBlock = wallet.addPendingSendBlock(account, to, amount);

  const work_result = await rpc.post('/', {
    action: 'work_generate',
    hash: JSON.parse(sendBlock.getJSONBlock(true)).previous,
  }).catch((err) => {
    console.log(err);
  });
      //
  sendBlock.setWork(work_result.data.work);
  return broadcastBlock(sendBlock);
}

export const getNextPendingSendHash = async (wallet, amount, to) => {
  let copyAccount = wallet;
  const account = copyAccount.getAccounts()[0].account;
  const nextBlock = copyAccount.addPendingSendBlock(account, to, amount);

  return nextBlock;
}
/*
  a helper function to build our send block
*/

export const buildSendBlock = () => {

}

/*
  A helper function to build our receive/open block
*/

export const buildReceiveBlock = () => {

}

/*
  Here we generate the needed pow
*/

export const processPow = (hash) => {

}
