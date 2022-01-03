import React, {Component} from 'react';
import './App.css';
import Web3 from 'web3';
import Token from './src/abis/Token.json';
import {createContext, useEffect, useState, useMemo, useContext, useCallback} from 'react';
import detectEthereumProvider from '@metamask/detect-provider';

function App() {
	const [web3Api, setWeb3Api] = useState({
		provider: null,
		isProviderLoaded: false,
		web3: null,
		tokenContract: null,
	});

	/*---------------------CREATION OF STATES AND RELOAD EFFECT---------------------------*/

	const [account, setAccount] = useState(null);
	const [balance, setBalance] = useState(null);
	const [shouldReload, reload] = useState(false);

	/*-----------------------------REFRESH PAGE--------------------------------------------*/

	const setAccountListener = (provider) => {
		window.ethereum.on('accountsChanged', (_) => window.location.reload());
		window.ethereum.on('chainChanged', (_) => window.location.reload());
	};

	/*-------------------------LOAD WEB3 AND SET IT AS PROVIDER-------------------------*/

	useEffect(() => {
		const loadProvider = async () => {
			const provider = await detectEthereumProvider();

			if (provider) {
				const tokenContract = new Web3.eth.Contract(Token.abi, Token.networks[1640190680190].address);

				setAccountListener(provider);

				setWeb3Api({
					web3: new Web3(provider),
					provider,
					tokenContract,
					isProviderLoaded: true,
				});
			} else {
				setWeb3Api((api) => ({...api, isProviderLoaded: true})); // dont get it
				console.error('Please install Metamask');
			}
		};

		loadProvider();
	}, []);

	/*-----------------------------GET ACCOUNTS FROM METAMASK---------------------------------*/

	useEffect(() => {
		const getAccount = async () => {
			const accounts = await web3Api.web3.eth.getAccounts();
			setAccount(accounts[0]);
			console.log(accounts[0]);
		};

		web3Api.web3 && getAccount(); // only when we have web3Api.web3 the getAccounts will be executed
	}, [web3Api.web3]); // when the web3 is assigned or reassigned this will run

	/*----------------------------------------------------------------------------*/

	return (
		<div>
			<nav className='navbar navbar-expand-lg navbar-dark bg-primary'>
				<a className='navbar-brand' href='/#'>
					Navbar
				</a>
				<button
					className='navbar-toggler'
					type='button'
					data-toggle='collapse'
					data-target='#navbarNavDropdown'
					aria-controls='navbarNavDropdown'
					aria-expanded='false'
					aria-label='Toggle navigation'>
					<span className='navbar-toggler-icon'></span>
				</button>
				<div className='collapse navbar-collapse' id='navbarNavDropdown'>
					<ul className='navbar-nav'>
						<li className='nav-item'>
							<a className='nav-link' href='/#'>
								Link 1
							</a>
						</li>
						<li className='nav-item'>
							<a className='nav-link' href='/#'>
								Link 2
							</a>
						</li>
						<li className='nav-item'>
							<a className='nav-link' href='/#'>
								Link 3
							</a>
						</li>
					</ul>
				</div>
			</nav>
			<div className='content'>
				<div className='vertical-split'>
					<div className='card bg-dark text-white'>
						<div className='card-header'>Card Title</div>
						<div className='card-body'>
							<p className='card-text'>
								Some quick example text to build on the card title and make up the bulk of the card's content.
							</p>
							<a href='/#' className='card-link'>
								Card link
							</a>
						</div>
					</div>
					<div className='card bg-dark text-white'>
						<div className='card-header'>Card Title</div>
						<div className='card-body'>
							<p className='card-text'>
								Some quick example text to build on the card title and make up the bulk of the card's content.
							</p>
							<a href='/#' className='card-link'>
								Card link
							</a>
						</div>
					</div>
				</div>
				<div className='vertical'>
					<div className='card bg-dark text-white'>
						<div className='card-header'>Card Title</div>
						<div className='card-body'>
							<p className='card-text'>
								Some quick example text to build on the card title and make up the bulk of the card's content.
							</p>
							<a href='/#' className='card-link'>
								Card link
							</a>
						</div>
					</div>
				</div>
				<div className='vertical-split'>
					<div className='card bg-dark text-white'>
						<div className='card-header'>Card Title</div>
						<div className='card-body'>
							<p className='card-text'>
								Some quick example text to build on the card title and make up the bulk of the card's content.
							</p>
							<a href='/#' className='card-link'>
								Card link
							</a>
						</div>
					</div>
					<div className='card bg-dark text-white'>
						<div className='card-header'>Card Title</div>
						<div className='card-body'>
							<p className='card-text'>
								Some quick example text to build on the card title and make up the bulk of the card's content.
							</p>
							<a href='/#' className='card-link'>
								Card link
							</a>
						</div>
					</div>
				</div>
				<div className='vertical'>
					<div className='card bg-dark text-white'>
						<div className='card-header'>Card Title</div>
						<div className='card-body'>
							<p className='card-text'>
								Some quick example text to build on the card title and make up the bulk of the card's content.
							</p>
							<a href='/#' className='card-link'>
								Card link
							</a>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default App;
