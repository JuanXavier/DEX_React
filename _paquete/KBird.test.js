const {assert} = require('chai');

const KBird = artifacts.require('./KBird');

require('chai').use(require('chai-as-promised')).should();

contract('KBird', (accounts) => {
	let contract;

	// "before" tells our tests to run thuis first before anything else
	before(async () => {
		contract = await KBird.deployed();
	});

	describe('Deployment basics:', async () => {
		it('The contract deploys succesfully', async () => {
			const address = await contract.address;
			assert.notEqual(address, '');
			assert.notEqual(address, null);
			assert.notEqual(address, undefined);
			assert.notEqual(address, 0x0);
		});

		it('The name matches', async () => {
			const name = await contract.name();
			assert.equal(name, 'Pajarracos');
		});

		it('The symbol matches', async () => {
			const symbol = await contract.symbol();
			assert.equal(symbol, 'PACOS');
		});
	});

	describe('Minting', async () => {
		it('Creates a new token', async () => {
			const result = await contract.mint('https...1');
			const totalSupply = await contract.totalSupply();
			assert.equal(totalSupply, 1);

			const event = result.logs[0].args;

			assert.equal(
				event._from,
				'0x0000000000000000000000000000000000000000',
				'from is the contract'
			);

			assert.equal(event._to, accounts[0], 'to is msg.sender');

			await contract.mint('https...1').should.be.rejected;
		});
	});

	describe('Indexing', async () => {
		it('Lists KBirdz', async () => {
			// Mint 3 new tokens
			await contract.mint('https...2');
			await contract.mint('https...3');
			await contract.mint('https...4');
			const totalSupply = await contract.totalSupply();

			// Loop through list and grab KBirdz from list

			let result = [];
			let KryptoBird;

			for (i = 1; i <= totalSupply; i++) {
				KryptoBird = await contract.kryptobirdz(i - 1);
				result.push(KryptoBird);
			}

			// assert that our new array result equal expected result
			let expected = ['https...1', 'https...2', 'https...3', 'https...4'];

			assert.equal(result.join(','), expected.join(','));
		});
	});
});
