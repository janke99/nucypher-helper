const Web3 = require('web3');
const NuCypherWorkLockabi = require('./abi/nucypher.WorkLock.json');
const ERC20abi = require('./abi/ERC20.json');
const config = require('config');
const BigNumber = require('bignumber.js');
const nodeurl = require('./config/nodeurl.json');

class Nucypher_app {
    constructor() {
        this.web3 = new Web3(new Web3.providers.HttpProvider(nodeurl.node.http));
        for (let i = 0; i < config.accounts.length; i++) {
            const account = config.accounts[i];
            this.web3.eth.accounts.wallet.add({
                privateKey: account.privateKey,
                address: account.address,
            });
        }
    }

    async bid() {
        let contract = new this.web3.eth.Contract(NuCypherWorkLockabi, "0xe9778E69a961e64d3cdBB34CF6778281d34667c2");
        let callTransaction = contract.methods.bid();

        for (let i = 0; i < config.accounts.length; i++) {
            const account = config.accounts[i];

            console.log(`send: ${account.address}`)

            callTransaction.send({
                from: account.address,
                gas: config.gas,
                gasPrice: new BigNumber(config.gasPrice * Math.pow(10, 9)).toFixed(0),
                value: new BigNumber(5 * Math.pow(10, 18)).toFixed(0),
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
}

let app = new Nucypher_app();
app.bid();