import Web3 from 'web3';
import {
	web3Loaded,
	web3AccountLoaded,
	tokenLoaded,
	exchangeLoaded,
	cancelledOrdersLoaded,
	filledOrdersLoaded,
	allOrdersLoaded,
	orderCancelling,
	orderCancelled,
	orderFilling,
	orderFilled,
	etherBalanceLoaded,
	tokenBalanceLoaded,
	exchangeEtherBalanceLoaded,
	exchangeTokenBalanceLoaded,
	balancesLoaded,
	balancesLoading,
	buyOrderMaking,
	sellOrderMaking,
	orderMade,
} from './actions';
import Token from '../abis/Token.json';
import Exchange from '../abis/Exchange.json';
import {ETHER_ADDRESS} from '../helpers';

// maxPriorityFeePerGas: null, maxFeePerGas: null

/*-------------------Web3----------------------*/

export const loadWeb3 = async (dispatch) => {
	if (typeof window.ethereum !== 'undefined') {
		const web3 = new Web3(window.ethereum);
		dispatch(web3Loaded(web3));
		await window.ethereum.request({method: 'eth_requestAccounts'});

		return web3;
	} else {
		if (
			window.confirm(
				'Please install MetaMask. Press OK to redirect you to the download website. Press cancel to stay on this website.'
			)
		) {
			window.location.assign('http://www.metamask.io/download');
		} else {
			window.location.reload();
		}
	}
};

/*-------------------Account----------------------*/

export const loadAccount = async (web3, dispatch) => {
	const accounts = await web3.eth.getAccounts();
	const account = await accounts[0];

	if (typeof account !== 'undefined') {
		dispatch(web3AccountLoaded(account));

		return account;
	} else {
		window.alert('Please login with MetaMask');

		return null;
	}
};

/*----------------Token contract--------------------*/

export const loadToken = async (web3, networkId, dispatch) => {
	try {
		const token = new web3.eth.Contract(Token.abi, Token.networks[networkId].address);

		dispatch(tokenLoaded(token));

		return token;
	} catch (error) {
		console.log(
			'Token contract not deployed to the current network. Please select another network.'
		);
		return null;
	}
};

/*----------------Exchange contract------------------*/

export const loadExchange = async (web3, networkId, dispatch) => {
	try {
		const exchange = new web3.eth.Contract(
			Exchange.abi,
			Exchange.networks[networkId].address
		);

		dispatch(exchangeLoaded(exchange));

		return exchange;
	} catch (error) {
		console.log(
			'Exchange contract not deployed to the current network. Please select another network.'
		);
		return null;
	}
};

/*----------------Load orders------------------------*/

export const loadAllOrders = async (exchange, dispatch) => {
	// Fetch cancelled orders with the "Cancel" event stream
	const cancelStream = await exchange.getPastEvents('Cancel', {
		fromBlock: 0,
		toBlock: 'latest',
	});

	// Format cancelled orders
	const cancelledOrders = cancelStream.map((event) => event.returnValues);

	// Add cancelled orders to the redux store
	dispatch(cancelledOrdersLoaded(cancelledOrders));

	/*----------------------*/

	// Fetch filled orders with the "Trade" event stream
	const tradeStream = await exchange.getPastEvents('Trade', {
		fromBlock: 0,
		toBlock: 'latest',
	});

	// Format filled orders
	const filledOrders = tradeStream.map((event) => event.returnValues);

	// Add cancelled orders to the redux store
	dispatch(filledOrdersLoaded(filledOrders));

	/*----------------------*/

	// Load order stream
	const orderStream = await exchange.getPastEvents('Order', {
		fromBlock: 0,
		toBlock: 'latest',
	});

	// Format order stream
	const allOrders = orderStream.map((event) => event.returnValues);

	// Add open orders to the redux store
	dispatch(allOrdersLoaded(allOrders));
};

/*-----------------------Events--------------------------*/

export const subscribeToEvents = async (exchange, dispatch) => {
	await exchange.events.Cancel({}, (error, event) => {
		dispatch(orderCancelled(event.returnValues));
	});

	await exchange.events.Trade({}, (error, event) => {
		dispatch(orderFilled(event.returnValues));
	});

	await exchange.events.Deposit({}, (error, event) => {
		dispatch(balancesLoaded(event.returnValues));
	});

	await exchange.events.Withdraw({}, (error, event) => {
		dispatch(balancesLoaded(event.returnValues));
	});

	await exchange.events.Order({}, (error, event) => {
		dispatch(orderMade(event.returnValues));
	});
};

/*--------------------Cancel Order--------------------------*/

export const cancelOrder = (dispatch, exchange, order, account) => {
	exchange.methods
		.cancelOrder(order.id)
		.send({from: account})
		.on('transactionHash', (hash) => {
			dispatch(orderCancelling());
		})
		.on('receipt', (receipt) => {
			console.log('TRANSACTION RECEIPT: ', receipt);
		})
		.on('error', (error) => {
			console.log(error);
			window.confirm(`There was an error cancelling the order.`);
			//	.then(window.location.reload());
		});
};

/*--------------------Fill order--------------------------*/

export const fillOrder = (dispatch, exchange, order, account) => {
	// console.log('Order to fill: ', order);

	exchange.methods
		.fillOrder(order.id)
		.send({from: account})
		.on('transactionHash', (hash) => {
			dispatch(orderFilling());
		})
		.on('receipt', (receipt) => {
			console.log('TRANSACTION RECEIPT: ', receipt);
		})
		.on('error', (error) => {
			console.log(error);
			window.confirm(`There was an error filling the order.`);
			//.then(window.location.reload());
		});
};

/*------------------Load Balances----------------------------*/

export const loadBalances = async (dispatch, web3, exchange, token, account) => {
	if (typeof account !== 'undefined') {
		// Ether balance of user in wallet
		const etherBalance = await web3.eth.getBalance(account);
		dispatch(etherBalanceLoaded(etherBalance));

		// Token balance of user in wallet
		const tokenBalance = await token.methods.balanceOf(account).call();
		dispatch(tokenBalanceLoaded(tokenBalance));

		// Ether balance of user in exchange
		const exchangeEtherBalance = await exchange.methods
			.balanceOf(ETHER_ADDRESS, account)
			.call();
		dispatch(exchangeEtherBalanceLoaded(exchangeEtherBalance));

		// Token balance of user in exchange
		const exchangeTokenBalance = await exchange.methods
			.balanceOf(token.options.address, account)
			.call();

		dispatch(exchangeTokenBalanceLoaded(exchangeTokenBalance));

		// Trigger all balances loaded
		dispatch(balancesLoaded());
	} else {
		window.alert('Please login with MetaMask');
	}
};

/*------------------ETH Deposit/Withdraw-------------------------*/

export const depositEther = (dispatch, exchange, web3, amount, account) => {
	exchange.methods
		.depositEther()
		.send({from: account, value: web3.utils.toWei(amount, 'ether')})
		.on('transactionHash', (hash) => {
			dispatch(balancesLoading());
		})
		.on('receipt', (receipt) => {
			console.log('TRANSACTION RECEIPT: ', receipt);
		})
		.on('error', (error) => {
			console.error(error);
			window.confirm(`There was an error depositing ETH.`);
			//	.then(window.location.reload());
		});
};

export const withdrawEther = (dispatch, exchange, web3, amount, account) => {
	exchange.methods
		.withdrawEther(web3.utils.toWei(amount, 'ether'))
		.send({from: account})
		.on('transactionHash', (hash) => {
			dispatch(balancesLoading());
		})
		.on('receipt', (receipt) => {
			console.log('TRANSACTION RECEIPT: ', receipt);
		})
		.on('error', (error) => {
			console.error(error);
			window.confirm('There was an error withdrawing ETH.');
			//	.then(window.location.reload());
		});
};

/*------------------Token Deposit/Withdraw-------------------------*/

export const depositToken = (dispatch, exchange, web3, token, amount, account) => {
	amount = web3.utils.toWei(amount, 'ether');

	token.methods
		.approve(exchange.options.address, amount)
		.send({from: account})
		.on('transactionHash', (hash) => {
			exchange.methods
				.depositToken(token.options.address, amount)
				.send({from: account})
				.on('transactionHash', (hash) => {
					dispatch(balancesLoading());
				})
				.on('receipt', (receipt) => {
					console.log('TRANSACTION RECEIPT: ', receipt);
				})
				.on('error', (error) => {
					console.error(error);
					window.alert(`There was an error!`);
				});
		});
};

export const withdrawToken = (dispatch, exchange, web3, token, amount, account) => {
	exchange.methods
		.withdrawToken(token.options.address, web3.utils.toWei(amount, 'ether'))
		.send({from: account})
		.on('transactionHash', (hash) => {
			dispatch(balancesLoading());
		})
		.on('receipt', (receipt) => {
			console.log('TRANSACTION RECEIPT: ', receipt);
		})
		.on('error', (error) => {
			console.error(error);
			window.alert(`There was an error!`);
		});
};

/*------------------Make Buy / Sell orders-------------------------*/

export const makeBuyOrder = (dispatch, exchange, token, web3, order, account) => {
	const tokenGet = token.options.address;
	const tokenGive = ETHER_ADDRESS;
	const amountGet = web3.utils.toWei(order.amount, 'ether');
	const amountGive = web3.utils.toWei((order.amount * order.price).toString(), 'ether');

	exchange.methods
		.makeOrder(tokenGet, amountGet, tokenGive, amountGive)
		.send({from: account})
		.on('transactionHash', (hash) => {
			dispatch(buyOrderMaking());
		})
		.on('receipt', (receipt) => {
			console.log('TRANSACTION RECEIPT: ', receipt);
		})
		.on('error', (error) => {
			console.error(error);
			window.alert(`There was an error!`);
		});
};

export const makeSellOrder = (dispatch, exchange, token, web3, order, account) => {
	const tokenGet = ETHER_ADDRESS;
	const tokenGive = token.options.address;
	const amountGet = web3.utils.toWei((order.amount * order.price).toString(), 'ether');
	const amountGive = web3.utils.toWei(order.amount, 'ether');

	exchange.methods
		.makeOrder(tokenGet, amountGet, tokenGive, amountGive)
		.send({from: account})
		.on('transactionHash', (hash) => {
			dispatch(sellOrderMaking());
		})
		.on('receipt', (receipt) => {
			console.log('TRANSACTION RECEIPT: ', receipt);
		})
		.on('error', (error) => {
			console.error(error);
			window.alert(`There was an error!`);
		});
};
