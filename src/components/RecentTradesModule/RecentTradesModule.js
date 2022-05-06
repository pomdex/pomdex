import React, { useContext, useState, useEffect } from 'react'
import useMatchMedia from '../../hooks/useMatchMedia';
import { AppContext } from "../../context/AppContextProvider";
import PropTypes from 'prop-types'
import * as styles from "./RecentTradesModule.module.css"
import { httpRequestInterval, createAsset, loadRecentTrades,
         isCurrentHour, shortenPublicKey, formatTime } from '../../utils/StellarUtils.js';
import ModuleTitle from '../ModuleTitle/ModuleTitle';

const RecentTradesModule = ({sellingAssetCode, sellingAssetIssuer,
                             buyingAssetCode, buyingAssetIssuer}) => {

  const { publicKey } = useContext(AppContext);
  
  const [recentTrades, setRecentTrades] = useState([]);

  const isMobile = useMatchMedia("(max-width: 767px)");

  useEffect(() => {
    const baseAsset = createAsset(sellingAssetCode, sellingAssetIssuer);
    const quoteAsset = createAsset(buyingAssetCode, buyingAssetIssuer);

    const fetchData = async () => {
      updateRecentTrades(baseAsset, quoteAsset);
    }

    fetchData();
    
    const timer = setInterval(() => {
      fetchData();
    }, httpRequestInterval);

    return () => {
      clearInterval(timer);
    };
  }, [sellingAssetCode, sellingAssetIssuer, 
      buyingAssetCode, buyingAssetIssuer]);
  
  const updateRecentTrades = async (sellingAsset, buyingAsset) => {
    try {
      const recentTrades = await loadRecentTrades(sellingAsset, buyingAsset);
      setRecentTrades(recentTrades);
    } catch (error) {
      console.error(error);
    }
  }

  return(
    <div className={styles.columnSection}>
      <div className={styles.offersHeader}>
        <ModuleTitle text='Recent Trades'/>
      </div>
      <div className={styles.scrollListHeader}>
        <div className={styles.smallOrderbookTableHeaderItem}>Time</div>
        {
          !isMobile &&
          <div className={styles.orderbookTableHeaderItem}>Seller</div>
        }
        {
          !isMobile &&  
          <div className={styles.orderbookTableHeaderItem}>Buyer</div>
        }
        <div className={styles.orderbookTableHeaderItem}>
          {"Price"}
        </div>
        <div className={styles.amountHeaderLabel}>
          <div>Amount</div>
          <div className={styles.amountAssetCode}>
            {"(" + sellingAssetCode + ")"}
          </div>
        </div>
        <div className={styles.amountHeaderLabel}>
          <div>Total</div>
          <div className={styles.amountAssetCode}>
            {"(" + buyingAssetCode + ")"}
          </div>
        </div>
      </div>
      <div className={styles.scrollList}>
        {
          recentTrades.map((element, index) => {
              const baseAccount = element.base_account
                                    ? shortenPublicKey(element.base_account)
                                    : "Liq. Pool: " + shortenPublicKey(element.base_liquidity_pool_id)

              const counterAccount = element.counter_account
                                      ? shortenPublicKey(element.counter_account)
                                      : "Liq. Pool: " + shortenPublicKey(element.counter_liquidity_pool_id)

              let priceStyle = styles.orderbookRowCell;

              const price = (parseFloat(element.price.n) / parseFloat(element.price.d)).toFixed(7);

              const previousTrade = recentTrades[index + 1];

              const previousPrice = previousTrade 
                                      ? (parseFloat(previousTrade.price.n) /
                                        parseFloat(previousTrade.price.d)).toFixed(7)
                                      : price ;
              
              if (price > previousPrice) {
                priceStyle = styles.buyPrice;
              }
              else if (price < previousPrice) {
                priceStyle = styles.sellPrice;
              }

              const sellerStyle = publicKey === element.base_account
                                    ? styles.highlightedCell
                                    : styles.orderbookRowCell
              const buyerStyle = publicKey === element.counter_account
                                    ? styles.highlightedCell
                                    : styles.orderbookRowCell

              const timeStyle = isCurrentHour(element.ledger_close_time)
                                    ? styles.smallHighlightedCell
                                    : styles.smallOrderbookRowCell

              return (
                <div key={element.id} className={styles.offerRow}>
                  <div className={timeStyle}>
                    {formatTime(element.ledger_close_time)}
                  </div>
                  {!isMobile && <div className={sellerStyle}>{baseAccount}</div>}
                  {!isMobile && <div className={buyerStyle}>{counterAccount}</div>}
                  <div className={priceStyle}>{price}</div>
                  <div className={styles.orderbookRowCell}>{element.base_amount}</div>
                  <div className={styles.orderbookRowCell}>{element.counter_amount}</div>
                </div>
              )
            }
          )
        }
      </div>
    </div>
  );
}

RecentTradesModule.propTypes = {
  sellingAssetCode: PropTypes.string.isRequired,
  sellingAssetIssuer: PropTypes.string.isRequired,
  buyingAssetCode: PropTypes.string.isRequired,
  buyingAssetIssuer: PropTypes.string.isRequired
}

export default RecentTradesModule