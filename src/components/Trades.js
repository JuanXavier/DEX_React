import React, {Component} from 'react';
import {connect} from 'react-redux';
import Spinner from './Spinner';
import {filledOrdersLoadedSelector, filledOrdersSelector} from '../store/selectors';

const showFilledOrders = (filledOrders) => {
	return (
		<tbody>
			{filledOrders.map((order) => {
				return (
					<tr className={`order-${order.id} text-center`} key={order.id}>
						<td className='text-muted '> {order.formattedTimestamp} </td>

						<td> {order.tokenAmount} </td>

						<td className={`text-${order.tokenPriceClass}`}> {order.tokenPrice} </td>
					</tr>
				);
			})}
		</tbody>
	);
};

/*-------------------------------------------------*/

class Trades extends Component {
	render() {
		return (
			<div className='vertical'>
				<div className='card bg-dark text-white'>
					<div className='card-header text-center font-weight-bold'>Trades</div>
					<div className='card-body'>
						<table className='table table-dark table-sm small text-center '>
							<thead>
								<tr>
									<th>Time</th>
									<th>XTK</th>
									<th>XTK/ETH</th>
								</tr>
							</thead>

							{this.props.filledOrdersLoaded ? (
								showFilledOrders(this.props.filledOrders)
							) : (
								<Spinner type='table' />
							)}
						</table>
					</div>
				</div>
			</div>
		);
	}
}

function mapStateToProps(state) {
	return {
		filledOrdersLoaded: filledOrdersLoadedSelector(state),
		filledOrders: filledOrdersSelector(state),
	};
}

export default connect(mapStateToProps)(Trades);
