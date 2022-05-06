import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import * as styles from "./OrderBookModule.module.css"
import { createAsset, streamOrderBook} from '../../utils/StellarUtils.js';
import ModuleTitle from '../ModuleTitle/ModuleTitle';

const OrderBookModule = ({sellingAssetCode, sellingAssetIssuer,
                          buyingAssetCode, buyingAssetIssuer, onRowClicked}) => {
  const [orderbook, setOrderbook] = useState({});

  useEffect(() => {
    const baseAsset = createAsset(sellingAssetCode, sellingAssetIssuer);
    const quoteAsset = createAsset(buyingAssetCode, buyingAssetIssuer);
    let endOrderBookStream;
    
    const startStreams = async () => {
      endOrderBookStream = await streamOrderBook(baseAsset, quoteAsset,
                                                 orders => setOrderbook(orders),
                                                 error => setOrderbook({}));
    }
    startStreams();

    return () => {
      if (endOrderBookStream) {
        endOrderBookStream();
      }
    };  
  }, [sellingAssetCode, sellingAssetIssuer, 
      buyingAssetCode, buyingAssetIssuer]);

  return(
    <div className={styles.orderbook}>
      <div className={styles.orderbookSideLeft}>
        <ModuleTitle text='Buy Offers' />
        <div className={styles.orderbookTableHeader}>
          <div className={styles.amountHeaderLabel}>
            <div>Amount</div>
            <div className={styles.amountAssetCode}>
              {"(" + sellingAssetCode + ")"}
            </div>
          </div>
          <div className={styles.orderbookTableHeaderItem}>Price</div>
        </div>
        {
          orderbook.bids && 
          orderbook.bids.map(element => 
            <div
              key={`n${element.price_r.n}d${element.price_r.d}`}
              className={styles.orderbookRow}
              onClick={() => onRowClicked(element.price)}
            >
              <div className={styles.orderbookRowCell}>
                {(element.amount / (element.price_r.n/element.price_r.d)).toFixed(7)}
              </div>
              <div className={styles.buyPrice}>{element.price}</div>
            </div>)
        }
      </div>
      <div className={styles.orderbookSideRight}>
        <ModuleTitle text='Sell Offers' />
        <div className={styles.orderbookTableHeader}>
          <div className={styles.orderbookTableHeaderItem}>Price</div>
          <div className={styles.amountHeaderLabel}>
            <div>Amount</div>
            <div className={styles.amountAssetCode}>
              {"(" + sellingAssetCode + ")"}
            </div>
          </div>
        </div>
        {
          orderbook.asks &&
          orderbook.asks.map(element => 
            <div
              key={`n${element.price_r.n}d${element.price_r.d}`}
              className={styles.orderbookRow}
              onClick={() => onRowClicked(element.price)}
            >
              <div className={styles.sellPrice}>{element.price}</div>
              <div className={styles.orderbookRowCell}>{element.amount}</div>
            </div>)
        }
      </div>
    </div>
  );
}

OrderBookModule.propTypes = {
  sellingAssetCode: PropTypes.string.isRequired,
  sellingAssetIssuer: PropTypes.string.isRequired,
  buyingAssetCode: PropTypes.string.isRequired,
  buyingAssetIssuer: PropTypes.string.isRequired,
  onRowClicked: PropTypes.func.isRequired
}

export default OrderBookModule