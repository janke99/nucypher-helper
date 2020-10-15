const Web3 = require('web3');
const NuCypherWorkLockabi = require('./abi/nucypher.WorkLock.json');
const NuCypherStakingEscrowabi = require('./abi/nucypher.StakingEscrow.json');
const ERC20abi = require('./abi/ERC20.json');
const config = require('config');
const BigNumber = require('bignumber.js');
const nodeurl = require('./config/nodeurl.json');
const cmd = require('commander');
cmd
    .version('0.0.1')
    .option('-bid, --bid', 'nucypher bid ...')
    .option('-claim, --claim', 'nucypher claim ...')
    .option('-bondWorker, --bondWorker', 'nucypher bondWorker ...')
    .option('-checkWorker, --checkWorker', 'nucypher checkWorker ...')
    .parse(process.argv);

class Nucypher_app {
    constructor() {
        this.web3 = new Web3(new Web3.providers.HttpProvider(nodeurl.node.http));
        for (let i = 0; i < config.accounts.length; i++) {
            const account = config.accounts[i];
            this.web3.eth.accounts.wallet.add({
                privateKey: '0x' + account.privateKey,
                address: account.address,
            });
        }

        this.WorkLockAddress = "0xe9778E69a961e64d3cdBB34CF6778281d34667c2";
        this.StakingEscrowAddress = "0xbbD3C0C794F40c4f993B03F65343aCC6fcfCb2e2";
    }

    async sendTransaction(transaction, params) {
        return transaction.send(params)
            .on('transactionHash', function (hash) {
                console.log('transactionHash:', hash);
            })
            .on('receipt', function (receipt) {
                console.log('receipt: ', receipt.blockNumber);
            })
            .on('confirmation', function (confirmationNumber, receipt) {
                // console.log('confirmation:', confirmationNumber, receipt);
            })
            .on('error', console.error);
    }

    async bid() {
        let contract = new this.web3.eth.Contract(NuCypherWorkLockabi, this.WorkLockAddress);
        let transaction = contract.methods.bid();

        for (let i = 0; i < config.accounts.length; i++) {
            const account = config.accounts[i];

            console.log(`start bid: ${account.address}`);
            let params = {
                from: account.address,
                gas: config.gas,
                gasPrice: new BigNumber(config.gasPrice * Math.pow(10, 9)).toFixed(0),
                value: new BigNumber(5 * Math.pow(10, 18)).toFixed(0),
                // nonce: 0,
            };
            this.sendTransaction(transaction, params);
        }
    }

    async claim() {
        let contract = new this.web3.eth.Contract(NuCypherWorkLockabi, this.WorkLockAddress);
        let transaction = contract.methods.claim();

        for (let i = 0; i < config.accounts.length; i++) {
            const account = config.accounts[i];

            console.log(`start claim: ${account.address}`);
            let params = {
                from: account.address,
                gas: config.gas,
                gasPrice: new BigNumber(config.gasPrice * Math.pow(10, 9)).toFixed(0),
                value: new BigNumber(0).toFixed(0),
            };
            this.sendTransaction(transaction, params);
        }
    }

    async bondWorker() {
        let contract = new this.web3.eth.Contract(NuCypherStakingEscrowabi, this.StakingEscrowAddress);

        for (let i = 0; i < config.accounts.length; i++) {
            const account = config.accounts[i];

            console.log(`start bondWorker: ${account.address} worker=${account.worker}`);
            let transaction = contract.methods.bondWorker(account.worker);
            let params = {
                from: account.address,
                gas: config.gas,
                gasPrice: new BigNumber(config.gasPrice * Math.pow(10, 9)).toFixed(0),
                value: new BigNumber(0).toFixed(0),
            };
            this.sendTransaction(transaction, params);
        }
    }

    async checkWorker() {
        let contract = new this.web3.eth.Contract(NuCypherStakingEscrowabi, this.StakingEscrowAddress);
        for (let i = 0; i < config.stacker.length; i++) {
            const stacker = config.stacker[i];

            let worker = await contract.methods.getWorkerFromStaker(stacker).call();
            console.log(`stacker: ${stacker} worker: ${worker}`);
        }
    }

    async run() {
        if (cmd.bid) {
            this.bid();
        } else if (cmd.claim) {
            this.claim();
        } else if (cmd.bondWorker) {
            this.bondWorker();
        } else if (cmd.checkWorker) {
            this.checkWorker();
        }
    }
}

let app = new Nucypher_app();
app.run();