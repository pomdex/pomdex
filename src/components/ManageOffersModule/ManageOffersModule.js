import React, { useState, useRef } from 'react'
import useMatchMedia from '../../hooks/useMatchMedia';
import PropTypes from 'prop-types'
import * as styles from "./ManageOffersModule.module.css"
import ManageOffer from "../ManageOffer/ManageOffer";
import BuySellSelector from '../BuySellSelector/BuySellSelector';

const ManageOffersModule = ({sellingAsset, buyingAsset, 
                             currentPrice, emitUpdateSignal}) => {

  const [buyOfferInputShowing, setBuyOfferInputShowing] = useState(true);

  const buyOffer = useRef({});
  const sellOffer = useRef({});

  const isMobile = useMatchMedia("(max-width: 767px)");

  const displayBuyOfferInput = () => {
    return (
      <ManageOffer
        sellingAsset={sellingAsset}
        buyingAsset={buyingAsset}
        availableBalance={buyingAsset.available_balance ?? ""}
        currentPrice={currentPrice}
        isBuyOffer={true}
        onOfferPlaced={emitUpdateSignal}
        onInputStateChange={(state) => buyOffer.current = state}
      />
    );
  }

  const displaySellOfferInput = () => {
    return (
      <ManageOffer
        sellingAsset={sellingAsset}
        buyingAsset={buyingAsset}
        availableBalance={sellingAsset.available_balance ?? ""}
        currentPrice={currentPrice}
        isBuyOffer={false}
        onOfferPlaced={emitUpdateSignal}
        onInputStateChange={(state) => sellOffer.current = state}
      />
    );
  }

  return(
    <div className={styles.offerSection}>
      {
        !isMobile 
          ?
            <div className={styles.desktopOfferInputSection}>
              <div className={styles.buyOfferInput}>
                {displayBuyOfferInput()}
              </div>
              <div className={styles.sellOfferInput}>
                {displaySellOfferInput()}
              </div>
            </div>
          : <div className={styles.mobileOfferInputSection}>
              <BuySellSelector
                buySelected={buyOfferInputShowing}
                setBuySelected={setBuyOfferInputShowing}
              />
              <div className={buyOfferInputShowing ? styles.offerInput : styles.hidden}>
                {displayBuyOfferInput()}
              </div>
              <div className={buyOfferInputShowing ? styles.hidden : styles.offerInput}>
                {displaySellOfferInput()}
              </div>
            </div>
      }
    </div>
  );
}

ManageOffersModule.propTypes = {
  sellingAsset: PropTypes.object.isRequired,
  buyingAsset: PropTypes.object.isRequired,
  currentPrice: PropTypes.string.isRequired,
  emitUpdateSignal: PropTypes.func.isRequired
}

export default ManageOffersModule