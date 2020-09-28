const Web3 = require('web3');
const Disperseappabi = require('./abi/Disperse.app.json');
const ERC20abi = require('./abi/ERC20.json');
const config = require('config');
const BigNumber = require('bignumber.js');
const nodeurl = require('./config/nodeurl.json');

class Disperse_app {
    constructor() {
        this.web3 = new Web3(new Web3.providers.HttpProvider(nodeurl.node.http));
        this.web3.eth.defaultAccount = config.account.address;
        this.web3.eth.accounts.wallet.add({
            privateKey: config.account.privateKey,
            address: config.account.address,
        });
    }

    async disperseEther() {
        let accounts = config.disperse.accounts;
        let amounts = [];
        for (let i = 0; i < config.disperse.accounts.length; i++) {
            amounts.push(new BigNumber(Math.pow(10, 18) * config.disperse.value).toFixed(0));
        }

        let contract = new this.web3.eth.Contract(Disperseappabi, "0xD152f549545093347A162Dce210e7293f1452150");
        let callTransaction = contract.methods.disperseEther(accounts, amounts);

        callTransaction.send({
                from: config.account.address,
                gas: config.disperse.gas,
                gasPrice: new BigNumber(config.disperse.gasPrice * Math.pow(10, 9)).toFixed(0),
                value: new BigNumber(Math.pow(10, 18) * config.disperse.value * config.disperse.accounts.length).toFixed(0),
                // nonce: 0,
            })
            .on('transactionHash', function (hash) {
                console.log('transactionHash:', hash);
            })
            .on('receipt', function (receipt) {
                console.log('receipt: ', receipt);
            })
            .on('confirmation', function (confirmationNumber, receipt) {
                // console.log('confirmation:', confirmationNumber, receipt);
            })
            .on('error', console.error);
    }
}

let app = new Disperse_app();
app.disperseEther();