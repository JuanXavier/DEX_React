const Token = artifacts.require('Token');
const Exchange = artifacts.require('Exchange');

/*-------------Helpers-------------*/

const ETHER_ADDRESS = '0x0000000000000000000000000000000000000000';
const ether = (n) => {
	return new web3.utils.BN(web3.utils.toWei(n.toString(), 'ether'));
};
const tokens = (n) => ether(n);

const wait = (seconds) => {
	const milliseconds = seconds * 1000;
	return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

module.exports = async function (callback) {
	try {
		// Fetch accounts from wallet
		const accounts = await web3.eth.getAccounts();
		const sender = accounts[0];
		const receiver = accounts[1];
		let amount = web3.utils.toWei('10000', 'ether');

		// Fetch deployed token
		const token = await Token.deployed();
		console.log('Token fetched', token.address);

		// Fetch deployed exchange
		const exchange = await Exchange.deployed();
		console.log('Exchange fetched', exchange.address);

		// Give 10k tokens to account[1]
		await token.transfer(receiver, amount, {from: sender});
		console.log(`transferred ${amount} tokens from ${sender} to ${receiver}`);

		// Set up exchange users
		const deployer = accounts[0];
		const user1 = accounts[1];

		// User1 deposits 1 ether
		amount = 1;
		await exchange.depositEther({from: deployer, value: ether(amount)});
		console.log(`Deposited ${amount} Ether from ${deployer}`);

		// User2 approves tokens
		amount = 10000;
		await token.approve(exchange.address, tokens(amount), {from: user1});
		console.log(`Approved ${amount} tokens from ${user1}`);

		// User2 deposits tokens
		await exchange.depositToken(token.address, tokens(amount), {from: user1});
		console.log(`Deposited ${amount} tokens from ${user1}`);

		/*----------------Seed a cancelled order----------------------*/

		let result;
		let orderId;

		// User1 makes order to get tokens
		result = await exchange.makeOrder(
			token.address,
			tokens(100),
			ETHER_ADDRESS,
			ether(0.1),
			{
				from: deployer,
			}
		);
		console.log(`Make order from ${deployer}`);

		// User1 cancells order
		orderId = result.logs[0].args.id;
		await exchange.cancelOrder(orderId, {from: deployer});
		console.log(`Cancelled order from ${deployer}`);

		/*----------------Seed 3 filled orders----------------------*/

		// User 1 makes order
		result = await exchange.makeOrder(
			token.address,
			tokens(100),
			ETHER_ADDRESS,
			ether(0.1),
			{
				from: deployer,
			}
		);
		console.log(`Made order from ${deployer}`);

		// User 2 fills order
		orderId = result.logs[0].args.id;
		await exchange.fillOrder(orderId, {from: user1});
		console.log(`Filled order from ${deployer}`);

		// Wait 1 second for timestamp
		await wait(1);

		// User 1 makes another order
		result = await exchange.makeOrder(
			token.address,
			tokens(50),
			ETHER_ADDRESS,
			ether(0.01),
			{
				from: deployer,
			}
		);
		console.log(`Made order from ${deployer}`);

		// User 2 fills the second  order
		orderId = result.logs[0].args.id;
		await exchange.fillOrder(orderId, {from: user1});
		console.log(`Filled order from ${deployer}`);

		// Wait 1 second
		await wait(1);

		// User 1 makes final order
		result = await exchange.makeOrder(
			token.address,
			tokens(200),
			ETHER_ADDRESS,
			ether(0.15),
			{
				from: deployer,
			}
		);
		console.log(`Made order from ${deployer}`);

		// User 2 fills final order
		orderId = result.logs[0].args.id;
		await exchange.fillOrder(orderId, {from: user1});
		console.log(`Filled order from ${deployer}`);

		// Wait 1 second
		await wait(1);

		/*----------------Seed open orders----------------------*/

		// User 1 makes 10 orders
		for (let i = 1; i <= 10; i++) {
			result = await exchange.makeOrder(
				token.address,
				tokens(10 * i),
				ETHER_ADDRESS,
				ether(0.01),
				{
					from: deployer,
				}
			);
			console.log(`Made order from ${deployer}`);

			// Wait 1 second
			await wait(1);
		}

		// User 2 makes 10 orders
		for (let i = 1; i <= 10; i++) {
			result = await exchange.makeOrder(
				ETHER_ADDRESS,
				ether(0.01),
				token.address,
				tokens(10 * i),
				{
					from: deployer,
				}
			);
			console.log(`Made order from ${deployer}`);

			// Wait 1 second
			await wait(1);
		}
	} catch (error) {
		console.log(error);
	}

	callback();
};
