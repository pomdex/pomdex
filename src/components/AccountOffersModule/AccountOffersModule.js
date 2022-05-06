import React, { useContext, useState, useEffect } from 'react'
import { AppContext } from "../../context/AppContextProvider.js";
import { GlobalModalContext } from "../../context/GlobalModalContextProvider";
import useMatchMedia from '../../hooks/useMatchMedia';
import PropTypes from 'prop-types'
import * as styles from "./AccountOffersModule.module.css"
import { httpRequestInterval, loadOffersForAccount, createCancelOfferTx, 
         createCancelOffersOnSideTx, createCancelAllOffersForPairTx, 
         server, signTransaction } 
         from '../../utils/StellarUtils.js';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit, faTimes } from '@fortawesome/free-solid-svg-icons'
import ModuleTitle from '../ModuleTitle/ModuleTitle';
import Button from '../Button/Button.js';

const AccountOffersModule = ({sellingAsset, buyingAsset,
                              updateSignal, emitUpdateSignal}) => {
  const { publicKey, walletType } = useContext(AppContext);
  const { activateModal, closeModal, setModalInputData} = useContext(GlobalModalContext);
  
  const [buyOffers, setBuyOffers] = useState([]);
  const [sellOffers, setSellOffers] = useState([]);

  const isMobile = useMatchMedia("(max-width: 767px)");

  useEffect(() => {
    const fetchData = async () => {
      updateOffers(publicKey, sellingAsset, buyingAsset); 
    }

    fetchData();
    
    const timer = setInterval(() => {
      fetchData();
    }, httpRequestInterval);

    return () => {
      clearInterval(timer);
    };
  }, [publicKey, sellingAsset, buyingAsset, updateSignal]);

  const updateOffers = async (publicKey, sellingAsset, buyingAsset) => {
    if (!publicKey) {
      setBuyOffers([]);
      setSellOffers([]);
      return;
    }

    try {
      const { buyOffers, sellOffers } = await loadOffersForAccount(publicKey,
                                                                    sellingAsset,
                                                                    buyingAsset);
      setBuyOffers(buyOffers);
      setSellOffers(sellOffers);
    } catch (error) {
      console.error(error);
    }
  }

  const submitCancelOffer = async (offerId) => {
    try {
      let transaction = await createCancelOfferTx(publicKey, sellingAsset,
                                                  buyingAsset, offerId);
      activateModal("SignTransactionModal");                                               
      transaction = await signTransaction(transaction, walletType, publicKey);

      setModalInputData({submitting: true});
      await server.submitTransaction(transaction);

      emitUpdateSignal();
      toast.success("Offer cancelled!");
    } catch (error) {
      console.error(error);
      toast.error("Transaction failed: " + error.message);
    }
    closeModal();
  }
  
  const submitCancelAllOffers = async () => {
    try {
      let transaction = await createCancelAllOffersForPairTx(publicKey,
                                                             sellingAsset,
                                                             buyingAsset);
      activateModal("SignTransactionModal");                                               
      transaction = await signTransaction(transaction, walletType, publicKey);

      setModalInputData({submitting: true});
      await server.submitTransaction(transaction);

      emitUpdateSignal();
      toast.success("All offers cancelled!");
    } catch (error) {
      console.error(error);
      toast.error("Transaction failed: " + error.message);
    }
    closeModal();
  }

  const cancelBuyOffers = async () => {
    try {
      let transaction = await createCancelOffersOnSideTx(publicKey, sellingAsset,
                                                         buyingAsset, true);
      activateModal("SignTransactionModal");                                               
      transaction = await signTransaction(transaction, walletType, publicKey);

      setModalInputData({submitting: true});
      await server.submitTransaction(transaction);

      emitUpdateSignal();
      toast.success("Buy offers cancelled!");
    } catch (error) {
      console.error(error);
      toast.error("Transaction failed: " + error.message);
    }
    closeModal();
  }

  const cancelSellOffers = async () => {
    try {
      let transaction = await createCancelOffersOnSideTx(publicKey, sellingAsset,
                                                         buyingAsset, false);
      activateModal("SignTransactionModal");                                               
      transaction = await signTransaction(transaction, walletType, publicKey);

      setModalInputData({submitting: true});
      await server.submitTransaction(transaction);

      emitUpdateSignal();
      toast.success("Sell offers cancelled!");
    } catch (error) {
      console.error(error);
      toast.error("Transaction failed: " + error.message);
    }
    closeModal();
  }

  const buyOfferRow = (offer, index) => {
    return (
      <div key={offer.id} className={styles.offerRow}>
        <div className={styles.orderbookRowCell}>{offer.amount}</div>
        <div className={styles.orderbookRowCell}>
          {(offer.amount * (offer.price_r.n/offer.price_r.d)).toFixed(7)}
        </div>
        <div className={styles.buyPrice}>
          {(offer.price_r.d/offer.price_r.n).toFixed(7)}
        </div>
        <div className={styles.editCancelButtonContainer}>
          <button
            type='button'
            className={styles.editOfferButton}
            onClick={() => activateModal("EditOfferModal", {
              offer,
              sellingAsset,
              buyingAsset,
              isBuyOffer: true,
              onSuccess: emitUpdateSignal
            })}
          >
            <FontAwesomeIcon icon={faEdit} />
          </button>
          <button
            type='button'
            className={styles.cancelOfferButton}
            onClick={()=>{submitCancelOffer(buyOffers[index].id)}}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
      </div>
    )
  }

  const buyOfferCard = (offer, index) => {
    return (
      <div key={offer.id} className={styles.offerCard}>
        <div className={styles.offerCardRow}>
          <div className={styles.orderbookRowCell}>Price</div>
          <div className={styles.buyPrice}>
            {(offer.price_r.d/offer.price_r.n).toFixed(7)}
          </div>
        </div>
        <div className={styles.offerCardRow}>
          <div className={styles.orderbookRowCell}>
            {`Amount (${sellingAsset.asset_code})`}
          </div>
          <div className={styles.orderbookRowCell}>
            {(offer.amount * (offer.price_r.n/offer.price_r.d)).toFixed(7)}
          </div>
      </div>
        <div className={styles.offerCardRow}>
          <div className={styles.orderbookRowCell}>
            {`Total (${buyingAsset.asset_code})`}
          </div>
          <div className={styles.orderbookRowCell}>
            {offer.amount}
          </div>
        </div>
        <div className={styles.offerCardRow}>
          <button
            type='button'
            className={styles.editOfferButton}
            onClick={() => activateModal("EditOfferModal", {
              offer,
              sellingAsset,
              buyingAsset,
              isBuyOffer: true,
              onSuccess: emitUpdateSignal
            })}
          >
            Edit
            <FontAwesomeIcon icon={faEdit} />
          </button>
          <button
            type='button'
            className={styles.cancelOfferButton}
            onClick={()=>{submitCancelOffer(buyOffers[index].id)}}
          >
            Cancel
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
      </div>
    )
  }

  const sellOfferRow = (offer, index) => {
    return (
      <div key={offer.id} className={styles.offerRow}>
        <div className={styles.sellPrice}>{offer.price}</div>
        <div className={styles.orderbookRowCell}>{offer.amount}</div>
        <div className={styles.orderbookRowCell}>
          {(offer.amount * (offer.price_r.n/offer.price_r.d)).toFixed(7)}
        </div>
        <div className={styles.editCancelButtonContainer}>
          <button
            type='button'
            className={styles.editOfferButton}
            onClick={() => activateModal("EditOfferModal", {
              offer,
              sellingAsset,
              buyingAsset,
              isBuyOffer: false,
              onSuccess: emitUpdateSignal
            })}
          >
            <FontAwesomeIcon icon={faEdit} />
          </button>
          <button
            type='button'
            className={styles.cancelOfferButton}
            onClick={()=>{submitCancelOffer(sellOffers[index].id)}}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
      </div>
    )
  }

  const sellOfferCard = (offer, index) => {
    return (
      <div key={offer.id} className={styles.offerCard}>
        <div className={styles.offerCardRow}>
          <div className={styles.orderbookRowCell}>Price</div>
          <div className={styles.sellPrice}>{offer.price}</div>
        </div>
        <div className={styles.offerCardRow}>
          <div className={styles.orderbookRowCell}>
            {`Amount (${sellingAsset.asset_code})`}
          </div>
          <div className={styles.orderbookRowCell}>{offer.amount}</div>
      </div>
        <div className={styles.offerCardRow}>
          <div className={styles.orderbookRowCell}>
            {`Total (${buyingAsset.asset_code})`}
          </div>
          <div className={styles.orderbookRowCell}>
            {(offer.amount * (offer.price_r.n/offer.price_r.d)).toFixed(7)}
          </div>
        </div>
        <div className={styles.offerCardRow}>
          <button
            type='button'
            className={styles.editOfferButton}
            onClick={() => activateModal("EditOfferModal", {
              offer,
              sellingAsset,
              buyingAsset,
              isBuyOffer: false,
              onSuccess: emitUpdateSignal
            })}
          >
            Edit
            <FontAwesomeIcon icon={faEdit} />
          </button>
          <button
            type='button'
            className={styles.cancelOfferButton}
            onClick={()=>{submitCancelOffer(sellOffers[index].id)}}
          >
            Cancel
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
      </div>
    )
  }

  return(
    <div className={styles.myOffersSection}>
      <div className={styles.myOffersList}>
        <div className={styles.orderbookSideLeft}>
          <div className={styles.offersHeader}>
            <ModuleTitle text='My Buy Offers'/>
            <button
              type='button'
              className={styles.cancelOffersSideButton}
              onClick={cancelBuyOffers}
            >
              Cancel Buy Offers
            </button>
          </div>
          {
            !isMobile &&
            <div className={styles.orderbookTableHeader}>
              <div className={styles.orderbookTableHeaderItem}>{buyingAsset.asset_code}</div>
              <div className={styles.orderbookTableHeaderItem}>{sellingAsset.asset_code}</div>
              <div className={styles.orderbookTableHeaderItem}>Price</div>
              <div className={styles.orderbookTableHeaderItem}>Edit/Cancel</div>
            </div>
          }
          {
            buyOffers && 
            buyOffers.map((offer, index) => 
              isMobile ? buyOfferCard(offer, index) : buyOfferRow(offer, index)
            )
          }
        </div>
        <div className={styles.orderbookSideRight}>
          <div className={styles.offersHeader}>
            <ModuleTitle text='My Sell Offers'/>
            <button
              type='button'
              className={styles.cancelOffersSideButton}
              onClick={cancelSellOffers}
            >
              Cancel Sell Offers
            </button>
          </div>
          {
            !isMobile &&
            <div className={styles.orderbookTableHeader}>
              <div className={styles.orderbookTableHeaderItem}>Price</div>
              <div className={styles.orderbookTableHeaderItem}>{sellingAsset.asset_code}</div>
              <div className={styles.orderbookTableHeaderItem}>{buyingAsset.asset_code}</div>
              <div className={styles.orderbookTableHeaderItem}>Edit/Cancel</div>
            </div>
          }
          {
            sellOffers &&
            sellOffers.map((offer, index) => 
              isMobile ? sellOfferCard(offer, index) : sellOfferRow(offer, index)
            )
          }
        </div>
      </div>
      <Button type='button' variant='red' onClick={submitCancelAllOffers}>
        Cancel All Offers
      </Button>
    </div>
  );
}

AccountOffersModule.propTypes = {
  sellingAsset: PropTypes.object.isRequired,
  buyingAsset: PropTypes.object.isRequired,
  updateSignal: PropTypes.object.isRequired,
  emitUpdateSignal: PropTypes.func.isRequired,
}

export default AccountOffersModule