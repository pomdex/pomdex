import React, { useContext, useState, useEffect } from 'react'
import { AppContext } from "../../context/AppContextProvider";
import useMatchMedia from '../../hooks/useMatchMedia';
import PropTypes from 'prop-types'
import * as styles from "./RecentOffersModule.module.css"
import { httpRequestInterval, createAsset, loadRecentOffers,
         isCurrentHour, shortenPublicKey, formatTime } from '../../utils/StellarUtils.js';
import ModuleTitle from '../ModuleTitle/ModuleTitle';
import BuySellSelector from '../BuySellSelector/BuySellSelector';

const RecentOffersModule = ({sellingAssetCode, sellingAssetIssuer,
                             buyingAssetCode, buyingAssetIssuer}) => {

  const { publicKey } = useContext(AppContext);
  const isMobile = useMatchMedia("(max-width: 1100px)");
  
  const [ recentOffers, setRecentOffers ] = useState({
    buyOffers: [],
    sellOffers: []
  });
  const [ buyOffersShowing, setBuyOffersShowing ] = useState(true);

  useEffect(() => {
    const baseAsset = createAsset(sellingAssetCode, sellingAssetIssuer);
    const quoteAsset = createAsset(buyingAssetCode, buyingAssetIssuer);

    const fetchData = async () => {
      updateRecentOffers(baseAsset, quoteAsset);
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
  
  const updateRecentOffers = async (sellingAsset, buyingAsset) => {
    try {
      const { buyOffers, sellOffers } = await loadRecentOffers(sellingAsset, 
                                                                buyingAsset);
    buyOffers.sort((a, b) => {
      const dateA = new Date(a.last_modified_time);
      const dateB = new Date(b.last_modified_time);
      return dateB - dateA;
    });

    sellOffers.sort((a, b) => {
      const dateA = new Date(a.last_modified_time);
      const dateB = new Date(b.last_modified_time);
      return dateB - dateA;
    });

    setRecentOffers({buyOffers, sellOffers});

    } catch (error) {
      console.error(error);
    }
  }

  const displayBuyOffers = () => {
    return <div className={styles.orderbookSide}>
      {!isMobile && <ModuleTitle text='Recent Buy Offers' />}
      <div className={styles.scrollListHeader}>
        <div className={styles.smallOrderbookTableHeaderItem}>Time</div>
        <div className={styles.orderbookTableHeaderItem}>Account</div>
        <div className={styles.orderbookTableHeaderItem}>
          {"Price"}
        </div>
        <div className={styles.amountHeaderLabel}>
          <div>Amount</div>
          <div className={styles.amountAssetCode}>
            {"(" + sellingAssetCode + ")"}
          </div>
        </div>
      </div>
      <div className={styles.scrollList}>
        {recentOffers.buyOffers.map((element, index) => {
          const price = (parseFloat(element.price_r.d) / parseFloat(element.price_r.n)).toFixed(7);

          const sellerStyle = publicKey === element.seller
            ? styles.highlightedCell
            : styles.orderbookRowCell;

          const timeStyle = isCurrentHour(element.last_modified_time)
            ? styles.smallHighlightedCell
            : styles.smallOrderbookRowCell;

          const amount = ((parseFloat(element.price_r.n) / parseFloat(element.price_r.d)) *
            parseFloat(element.amount)).toFixed(7);
          return (
            <div key={element.id} className={styles.offerRow}>
              <div className={timeStyle}>
                {formatTime(element.last_modified_time)}
              </div>
              <div className={sellerStyle}>{shortenPublicKey(element.seller)}</div>
              <div className={styles.buyPrice}>{price}</div>
              <div className={styles.orderbookRowCell}>{amount}</div>
            </div>
          );
        }
        )}
      </div>
    </div>;
  }

  const displaySellOffers = () => {
    return <div className={styles.orderbookSide}>
      {!isMobile && <ModuleTitle text='Recent Sell Offers' />}
      <div className={styles.scrollListHeader}>
        <div className={styles.smallOrderbookTableHeaderItem}>Time</div>
        <div className={styles.orderbookTableHeaderItem}>Account</div>
        <div className={styles.orderbookTableHeaderItem}>
          {"Price"}
        </div>
        <div className={styles.amountHeaderLabel}>
          <div>Amount</div>
          <div className={styles.amountAssetCode}>
            {"(" + sellingAssetCode + ")"}
          </div>
        </div>
      </div>
      <div className={styles.scrollList}>
        {recentOffers.sellOffers.map((element, index) => {
          const price = (parseFloat(element.price_r.n) / parseFloat(element.price_r.d)).toFixed(7);

          const sellerStyle = publicKey === element.seller
            ? styles.highlightedCell
            : styles.orderbookRowCell;

          const timeStyle = isCurrentHour(element.last_modified_time)
            ? styles.smallHighlightedCell
            : styles.smallOrderbookRowCell;

          return (
            <div key={element.id} className={styles.offerRow}>
              <div className={timeStyle}>
                {formatTime(element.last_modified_time)}
              </div>
              <div className={sellerStyle}>{shortenPublicKey(element.seller)}</div>
              <div className={styles.sellPrice}>{price}</div>
              <div className={styles.orderbookRowCell}>{element.amount}</div>
            </div>
          );
        }
        )}
      </div>
    </div>;
  }

  return(
    <div className={styles.orderbook}>
      {
        !isMobile 
          ?
            <div className={styles.desktopOfferInputSection}>
              <div className={styles.buyOfferInput}>
                {displayBuyOffers()}
              </div>
              <div className={styles.sellOfferInput}>
                {displaySellOffers()}
              </div>
            </div>
          : <div className={styles.mobileOfferInputSection}>
              <div className={styles.mobileTitleWrapper}>
                <ModuleTitle text='Recent Offers' />
              </div>
              <BuySellSelector
                buySelected={buyOffersShowing}
                setBuySelected={setBuyOffersShowing}
              />
              <div className={buyOffersShowing ? styles.offerInput : styles.hidden}>
                {displayBuyOffers()}
              </div>
              <div className={buyOffersShowing ? styles.hidden : styles.offerInput}>
                {displaySellOffers()}
              </div>
            </div>
      }
    </div>
  );
}

RecentOffersModule.propTypes = {
  sellingAssetCode: PropTypes.string.isRequired,
  sellingAssetIssuer: PropTypes.string.isRequired,
  buyingAssetCode: PropTypes.string.isRequired,
  buyingAssetIssuer: PropTypes.string.isRequired
}

export default RecentOffersModule