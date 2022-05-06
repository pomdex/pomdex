import React, { useContext, useReducer, useEffect } from 'react'
import { AppContext } from "../../context/AppContextProvider";
import { GlobalModalContext } from "../../context/GlobalModalContextProvider.js";
import { toast } from 'react-toastify';
import PropTypes from 'prop-types'
import * as styles from "./ManageOffer.module.css"
import Button from '../Button/Button.js';
import { createManageBuyOfferTx, createManageSellOfferTx, isFloatUpTo7Decimals, 
         addSuffixToPrice, server, signTransaction } from '../../utils/StellarUtils.js';
import { v4 as uuidv4 } from 'uuid';

const manageOfferReducer = (state, action) => {
  switch (action.type) {
    case 'price':
      return {
        ...state,
        price: action.value,
        total: parseFloat((action.value * state.amount).toFixed(7)).toString()
      };
    case 'externalPrice':
      return {
        ...state,
        price: action.value + state.suffix,
        total: parseFloat(((action.value + state.suffix) * state.amount).toFixed(7)).toString()
      };
    case 'amount':
      return {
        ...state,
        amount: action.value,
        total: parseFloat((action.value * state.price).toFixed(7)).toString()
      };
    case 'total': {
      if (!state.price) {
        return {...state, total: action.value};
      }
      let newAmount = parseFloat((action.value / state.price).toFixed(7));
      let newTotal = parseFloat(action.value);
      if (newAmount * parseFloat(state.price) > parseFloat(action.availableBalance)) {
        newAmount = (newAmount - 0.0000001).toFixed(7);
        newTotal = parseFloat((newAmount * state.price).toFixed(7));
      }
      return {
        ...state,
        amount: newAmount.toString(),
        total: newTotal.toString()
      };
    }
    case 'suffix': {
      const newPrice = addSuffixToPrice(state.price, action.value);
      return {
        ...state,
        price: newPrice,
        total: parseFloat((newPrice * state.amount).toFixed(7)).toString(),
        suffix: action.value
      };
    }
    default:
      throw new Error();
  }
}

const ManageOffer = ({sellingAsset, buyingAsset, availableBalance, 
                      currentPrice, priceSuffix = "", currentAmount, offerID = "0",
                      isBuyOffer, onOfferPlaced, onFailure, onInputStateChange}) => {

  const priceID = "price" + uuidv4();
  const amountID = "amount" + uuidv4();
  const totalID = "total" + uuidv4();
  
  const {publicKey, walletType} = useContext(AppContext);
  const { activateModal, closeModal, setModalInputData} = useContext(GlobalModalContext);

  const [state, dispatch] = useReducer(
    manageOfferReducer, {
      price: "",
      amount: "",
      total: "",
      suffix: ""
    }
  );

  useEffect(() => {
    if (currentPrice) {
      dispatch({ type: "externalPrice", value: currentPrice });
    }
  }, [currentPrice]);

  useEffect(() => {
    dispatch({ type: "suffix", value: priceSuffix });
  }, [priceSuffix]);

  useEffect(() => {
    if (currentAmount) {
      dispatch({ type: "amount", value: currentAmount });
    }
  }, [currentAmount]);

  useEffect(() => {
    if (onInputStateChange) {
      onInputStateChange(state);
    }
  }, [state, onInputStateChange]);

  const validateInput = (value, dispatchType) => {
    if (!isFloatUpTo7Decimals(value) && value !== '') {
      return false;
    }
    else if (value === "") {
      dispatch({ type: dispatchType, value });
      return false;
    }
    return true;
  }

  const handlePriceChange = (event, inputName) => {
    const value = event.target.value;
    if (!validateInput(value, "price")) {
      return;
    }  
    dispatch({ type: "price", value });
  }
  
  const handleAmountChange = (event) => {
    const value = event.target.value;
    if (!validateInput(value, "amount")) {
      return;
    }  
    dispatch({ type: "amount", value });
  }
  
  const handleTotalChange = (event) => {
    const value = event.target.value;
    if (!validateInput(value, "total")) {
      return;
    }  
    dispatch({
      type: "total",
      value,
      availableBalance
    });
  }

  const setAmountByPercentage = (percentage) => {
    if (isBuyOffer) {
      const newTotal = (percentage / 100) * parseFloat(availableBalance);
      dispatch({
        type: "total",
        value: newTotal.toFixed(7),
        availableBalance
      });
    }
    else {
      const newAmount = (percentage / 100) * parseFloat(availableBalance);
      dispatch({ type: "amount", value: newAmount.toFixed(7).toString() });
    }
  }
  
  const handleSubmitOffer = async (event) => {
    event.preventDefault();
    if (!publicKey) {
      toast.error("Wallet not connected!");
      return;
    }

    try {
      let transaction;
      if (isBuyOffer) {
        transaction = await createManageBuyOfferTx(publicKey, sellingAsset, buyingAsset,
                                                   state.amount, state.price, offerID);
      }
      else {
        transaction = await createManageSellOfferTx(publicKey, sellingAsset, buyingAsset, 
                                                    state.amount, state.price, offerID);
      }

      activateModal("SignTransactionModal");                                               
      transaction = await signTransaction(transaction, walletType, publicKey);

      setModalInputData({submitting: true});
      await server.submitTransaction(transaction);
                 
      toast.success(`${isBuyOffer ? "Buy" : "Sell"} Offer placed!`);
      onOfferPlaced();
    } catch (error) {
      if (onFailure) {
        onFailure(error);
      }
      else {
        console.error(error);
        toast.error("Transaction failed: " + error.message);
      }
    }
    closeModal();
  }
  
  return (
    <div className={styles.offerInput}>
      <div className={styles.offerInputHeader}>
        <div>{isBuyOffer ? "Buy" : "Sell"}<b>{" " + sellingAsset.asset_code}</b></div>
        {
          availableBalance &&
          <div className={styles.availableSection}>
            <div className={styles.availableLabel}>{"Available: "} </div>
            <div className={styles.availableBalance}>
              {
                " " + availableBalance + " " +
                (isBuyOffer ? buyingAsset.asset_code: sellingAsset.asset_code)
              }
            </div>
          </div>
        }
      </div>
      <form className={styles.form}>
        <div className={styles.inputGrid}>
          <label htmlFor={priceID} className={styles.label}>Price</label>
          <input
            className={styles.input}
            type="text"
            autoComplete="off"
            id={priceID}
            name={priceID}
            value={state.price}
            onChange={handlePriceChange}
          />
          <div className={styles.inputAsset}><b>{buyingAsset.asset_code}</b></div>

          <label htmlFor={amountID} className={styles.label}>Amount</label>
          <input
            className={styles.input}
            type="text"
            autoComplete="off"
            id={amountID}
            name={amountID}
            value={state.amount}
            onChange={handleAmountChange}
          />
          <div className={styles.inputAsset}><b>{sellingAsset.asset_code}</b></div>

          <div className={styles.buttonContainer}>
            <button
              type='button'
              className={styles.percentageButton}
              onClick={() => setAmountByPercentage(25)}
              disabled={!publicKey}
            >
              25%
            </button>
            <button
              type='button'
              className={styles.percentageButton}
              onClick={() => setAmountByPercentage(50)}
              disabled={!publicKey}
            >
              50%
            </button>
            <button
              type='button'
              className={styles.percentageButton}
              onClick={() => setAmountByPercentage(75)}
              disabled={!publicKey}
            >
              75%
            </button>
            <button
              type='button'
              className={styles.percentageButton}
              onClick={() => setAmountByPercentage(100)}
              disabled={!publicKey}
            >
              MAX
            </button>
          </div>

          <label htmlFor={totalID} className={styles.label}>Total</label>
          <input
            className={styles.input}
            type="text"
            autoComplete="off"
            id={totalID}
            name={totalID}
            value={state.total}
            onChange={handleTotalChange}
          />
          <div className={styles.inputAsset}><b>{buyingAsset.asset_code}</b></div>
        </div>

        <Button
          type='submit'
          variant={isBuyOffer ? 'green' : 'red'}
          onClick={handleSubmitOffer}
        >
          {`Submit ${isBuyOffer ? "Buy" : "Sell"} Offer`}
        </Button>
      </form>
    </div>
  );
}

ManageOffer.propTypes = {
  sellingAsset: PropTypes.object.isRequired,
  buyingAsset: PropTypes.object.isRequired,
  availableBalance: PropTypes.string.isRequired,
  currentPrice: PropTypes.string,
  priceSuffix: PropTypes.string,
  currentAmount: PropTypes.string,
  offerID: PropTypes.string,
  isBuyOffer: PropTypes.bool.isRequired,
  onOfferPlaced: PropTypes.func.isRequired,
  onFailure: PropTypes.func,
  onInputStateChange: PropTypes.func
}

export default ManageOffer