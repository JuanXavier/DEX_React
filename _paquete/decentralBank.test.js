const RWD = artifacts.require('RWD');
const Tether = artifacts.require('Tether');
const DecentralBank = artifacts.require('DecentralBank');

require('chai').use(require('chai-as-promised')).should();

contract('DecentralBank', ([owner, customer]) => {
	let tether, rwd, decentralBank;

	function tokens(number) {
		return web3.utils.toWei(number);
	}

	/*-------------------------------------------------------------------------------------*/

	before(async () => {
		// Load contracts
		tether = await Tether.new();
		rwd = await RWD.new();
		decentralBank = await DecentralBank.new(rwd.address, tether.address);

		// Transfer all tokens to DecentralBank (1 million)
		await rwd.transfer(decentralBank.address, tokens('1000000'));

		// Transfer 100 mock tethers to customer
		await tether.transfer(customer, tokens('100'), {from: owner});
	});

	/*-------------------------------------------------------------------------------------*/

	describe('Tether deployment', async () => {
		it('Matches name succesfully', async () => {
			const name = await tether.name();
			assert.equal(name, 'Mock Tether');
		});

		it('Matches symbol succesfully', async () => {
			const symbol = await tether.symbol();
			assert.equal(symbol, 'mUSDT');
		});
	});

	/*-------------------------------------------------------------------------------------*/

	describe('RWD deployment', async () => {
		it('Matches rwd name succesfully', async () => {
			const name = await rwd.name();
			assert.equal(name, 'Reward Token');
		});

		it('Matches rwd symbol succesfully', async () => {
			const symbol = await rwd.symbol();
			assert.equal(symbol, 'RWD');
		});
	});

	/*-------------------------------------------------------------------------------------*/

	describe('DecentralBank deployment', async () => {
		it('Matches DecentralBank name succesfully', async () => {
			const name = await decentralBank.name();
			assert.equal(name, 'Decentral Bank');
		});

		it('Contract has 1000000 tokens', async () => {
			let balance = await rwd.balanceOf(decentralBank.address);
			assert.equal(balance, tokens('1000000'));
		});
	});

	/*-------------------------------------------------------------------------------------*/

	describe('Yield farming', async () => {
		it('Investor balance is 100 before staking', async () => {
			let result = await tether.balanceOf(customer);
			assert.equal(
				result.toString(),
				tokens('100'),
				'Customer and wallet balance before staking'
			);
		});

		it('Check staking of 100 tokens from customer ', async () => {
			await tether.approve(decentralBank.address, tokens('100'), {from: customer});
			await decentralBank.depositTokens(tokens('100'), {from: customer});
		});

		it('Customer balance is zero after staking', async () => {
			result = await tether.balanceOf(customer);
			assert.equal(
				result.toString(),
				tokens('0'),
				'Customer has zero tokens after staking'
			);
		});

		it('Check decentralBank balance: 100 tokens staked by customer', async () => {
			result = await tether.balanceOf(decentralBank.address);
			assert.equal(result.toString(), tokens('100'), 'hundred tokens');
		});

		it('isStaking status from customer is true', async () => {
			result = await decentralBank.isStaking(customer);
			assert.equal(result.toString(), 'true', 'Customer staking status');
		});

		// it('Issue tokens', async () => {
		// 	await decentralBank.issueTokens({from: owner});
		// });

		// it('Only owner can issue tokens', async () => {
		// 	await decentralBank.issueTokens({from: customer}).should.be.rejected;
		// });

		// it('Unstake tokens', async () => {
		// 	await decentralBank.unstakeTokens({from: customer});
		// });

		// it('Unstaking balances: Customer 100', async () => {
		// 	result = await tether.balanceOf(customer);
		// 	assert.equal(result.toString(), tokens('100'), 'Customer has 100 tokens after unstaking');
		// });

		// it('Check decentralBank balance: 0 tokens', async () => {
		// 	result = await tether.balanceOf(decentralBank.address);
		// 	assert.equal(result.toString(), tokens('0'), 'zero tokens');
		// });

		// it('Is Staking balance', async () => {
		// 	result = await decentralBank.isStaking(customer);
		// 	assert.equal(result.toString(), 'false', 'Customer is no longer staking after unstaking');
		// });
	});
});
