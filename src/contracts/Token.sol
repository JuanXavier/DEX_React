// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import 'openzeppelin-solidity/contracts/math/SafeMath.sol';

contract Token {

	using SafeMath for uint256;

	string public name = "Xtoken";
	string public symbol = "XTK";
	uint256 public decimals = 18;
	uint256 public totalSupply;

	event Transfer(address indexed _from, address indexed _to, uint256 _value);
	event Approval (address indexed _owner, address indexed _spender, uint256 _value);

	mapping(address => uint256) public balanceOf;
	mapping(address => mapping(address => uint256)) public allowance;

	constructor () public {
		totalSupply = 1000000 * (10 ** decimals);
		balanceOf[msg.sender] = totalSupply;
	}

	function transfer(address _to, uint256 _value) public returns(bool) {
		require(balanceOf[msg.sender] >= _value);
		_transfer(msg.sender, _to, _value);
		return true;
	}

	function _transfer(address _from, address _to, uint256 _value) internal {
		require(_to != address(0));
		
		balanceOf[_from] = balanceOf[_from].sub(_value);
		balanceOf[_to] = balanceOf[_to].add(_value);

		emit Transfer(_from, _to, _value);
	}

	function approve(address _spender, uint256 _value) public returns (bool) {
		require(_spender != address(0));

		allowance[msg.sender][_spender] = _value;

		emit Approval(msg.sender, _spender, _value);

		return true;
	}

	function transferFrom(address _from, address _to, uint256 _value) public returns(bool) {
		require(_value <= balanceOf[_from]);
		require(_value <= allowance[_from][msg.sender]);

		allowance[_from][msg.sender] = allowance[_from][msg.sender].sub(_value);
		_transfer(_from, _to, _value);
		return true;
	}


}