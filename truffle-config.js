require('babel-register');
require('babel-polyfill');
const HDWalletProvider = require('@truffle/hdwallet-provider');
const private = require('./private.json');

// const privateKeys = process.env.PRIVATE_KEYS;
// const privateKeys = [Buffer.from(process.env.PRIVATE_KEYS, 'hex')];

module.exports = {
	networks: {
		development: {
			host: '127.0.0.1', // Localhost (default: none)
			port: 8545, // Standard Ethereum port (default: none)
			network_id: '*', // Any network (default: none)
		},

		rinkeby: {
			provider: () => new HDWalletProvider([private.key1, private.key2], private.rinkebyWssEndpoint),
			network_id: 4, // Rinkeby's id
			gas: 5500000, // Rinkeby has a lower block limit than mainnet
			confirmations: 1, // # of confs to wait between deployments. (default: 0)
			timeoutBlocks: 100, // # of blocks before a deployment times out  (minimum/default: 50)
			skipDryRun: true, // Skip dry run before migrations? (default: false for public nets )
		},

		ropsten: {
			provider: () => new HDWalletProvider(private.key, private.ropstenWssEndpoint),
			network_id: 3,
			gas: 5500000,
			confirmations: 1,
			timeoutBlocks: 100,
			skipDryRun: true,
		},
	},

	contracts_directory: './src/contracts/',
	contracts_build_directory: './src/abis/',

	// Configure your compilers
	compilers: {
		solc: {
			version: '^0.5.0', // Fetch exact version from solc-bin (default: truffle's version)
			// docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
			// settings: {          // See the solidity docs for advice about optimization and evmVersion
			optimizer: {
				enabled: false,
				runs: 200,
			},
			//  evmVersion: "byzantium"
			// }
		},
	},
};
