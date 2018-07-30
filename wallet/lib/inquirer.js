const inquirer = require('inquirer');


module.exports = {
  askCipherCode: () => {
    const questions = [
      {
        name: 'pass',
        type: 'password',
        message: 'Wallet found, enter your password: ',
        validate: function(value) {
          if (value.length){
            return true;
          } else {
            return 'Please enter your password to proceed!'
          }
        }
      }
    ];
    return inquirer.prompt(questions);
  },
  options: () => {
    const options = [
      {
        name: 'receive',
        type: 'list',
        message: 'Choose your operation',
        choices: [
          'Send', 'Receive', 'View Account', 'Quit'
        ],
        validate: function(choice) {
          return choice.toLowerCase();
        },
      }
    ];
    return inquirer.prompt(options);
  },
  send: () => {
    const questions = [{
      name: 'address',
      type: 'input',
      message: 'Account to send address',
      validate: function(acc) {
        if (acc.length) {
          return true;
        } else {
          return 'Please enter the send address!';
        }
      }
    },
    {
      name: 'amount',
      type: 'input',
      message: 'Enter the ammount',
      validate: function(amount) {
        if (amount >= 0)
          return true
        return 'Enter a valid value!';
      }
    }];
    return inquirer.prompt(questions);
  }

}
