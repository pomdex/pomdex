import React, { useState, useContext } from 'react'
import { AppContext } from "../../../context/AppContextProvider";
import { GlobalModalContext } from "../../../context/GlobalModalContextProvider.js";
import { toast } from 'react-toastify';
import PropTypes from 'prop-types'
import { server, createRemoveLiquidityTx, signTransaction }
         from '../../../utils/StellarUtils.js';
import * as styles from "./RemoveLiquidityModal.module.css"
import ModalWrapper from '../ModalWrapper/ModalWrapper.js';
import ModalHeader from '../ModalHeader/ModalHeader.js';
import Button from '../../Button/Button.js';
import LiquidityPoolCard from '../../LiquidityPoolCard/LiquidityPoolCard';
 
const RemoveLiquidityModal = ({handlerFunctions, liquidityPosition}) => {
  const MINIMUM_RECEIVED_MULTIPLIER = 0.999;
  const [percentage, setPercentage] = useState("0");
  const [asset1Amount, setAsset1Amount] = useState("0.0000000");
  const [asset2Amount, setAsset2Amount] = useState("0.0000000");
  const {publicKey, walletType} = useContext(AppContext);
  const { activateModal, setModalInputData, closeModal } = useContext(GlobalModalContext);

  const handleSliderChange = (event) => {
    const newPercentage = event.target.value;
    setPercentage(newPercentage);
    
    setAsset1Amount((parseFloat(liquidityPosition.assetA_balance) *
                    (newPercentage / 100)).toFixed(8).slice(0, -1));

    setAsset2Amount((parseFloat(liquidityPosition.assetB_balance) *
                    (newPercentage / 100)).toFixed(8).slice(0, -1));
  }

  const removePosition = async () => {
    if (!publicKey) {
      toast.error("Wallet not connected!");
      return;
    }
    try {
      const amount = (parseFloat(liquidityPosition.balance) *
                     (percentage / 100)).toFixed(7);

      const asset1 = {
        asset_code: liquidityPosition.assetA_code,
        asset_issuer: liquidityPosition.assetA_issuer
      }
      const asset1Minimum = (parseFloat(asset1Amount) *
                             MINIMUM_RECEIVED_MULTIPLIER).toFixed(7);

      const asset2 = {
        asset_code: liquidityPosition.assetB_code,
        asset_issuer: liquidityPosition.assetB_issuer
      }
      const asset2Minimum = (parseFloat(asset2Amount) *
                             MINIMUM_RECEIVED_MULTIPLIER).toFixed(7);

      let transaction = await createRemoveLiquidityTx(publicKey,
                                                      amount,
                                                      asset1,
                                                      asset1Minimum,
                                                      asset2,
                                                      asset2Minimum);
      activateModal("SignTransactionModal");
      transaction = await signTransaction(transaction, walletType, publicKey);

      setModalInputData({submitting: true});
      await server.submitTransaction(transaction);
      
      toast.success("Liquidity removed!");
      handlerFunctions.closeModal();
    } catch (error) {
      console.error(error);
      toast.error("Transaction failed: " + error.message);
    }
    closeModal();
  }

  return (
    <ModalWrapper handlerFunctions={handlerFunctions} maxWidth={"500px"}>
      <ModalHeader title='Remove Liquidity' />
      <div className={styles.modalBody}>
        <LiquidityPoolCard liquidityPosition={liquidityPosition} />
        <div className={styles.poolDetails}>
          <div className={styles.sectionHeader}>Current Position:</div>
          <div className={styles.detailRow}>
            <div className={styles.detailLabel}>
              {liquidityPosition.assetA_code}
            </div>
            <div>{liquidityPosition.assetA_balance}</div>
          </div>
          <div className={styles.detailRow}>
            <div className={styles.detailLabel}>
              {liquidityPosition.assetB_code}
            </div>
            <div>{liquidityPosition.assetB_balance}</div>
          </div>
          <div className={styles.detailRow}>
            <div className={styles.detailLabel}>
              {"Pool %"}
            </div>
            <div>{liquidityPosition.poolPercentage}</div>
          </div>
          <div className={styles.detailRow}>
            <div className={styles.detailLabel}>
              {"Pool Shares"}
            </div>
            <div>{liquidityPosition.balance}</div>
          </div>
        </div>
        <div className={styles.amountSection}>
          <div className={styles.sectionHeader}>Amount To Withdraw:</div>
          <div className={styles.amountRow}>
            <div>{liquidityPosition.assetA_code}</div>
            <div>{asset1Amount}</div>
          </div>
          <div className={styles.amountRow}>
            <div>{liquidityPosition.assetB_code}</div>
            <div>{asset2Amount}</div>
          </div>
          <div className={styles.inputSection}>
            <label htmlFor='slider' className={styles.sliderLabel}>{`${percentage}%`}</label>
            <input
              className={styles.slider}
              id='slider'
              type='range'
              value={percentage}
              onChange={handleSliderChange}
            />
          </div>
        </div>
        <Button
          variant='red'
          type='button'
          onClick={removePosition}
          disabled={percentage === "0"}
        >
          Remove
        </Button>
      </div>
    </ModalWrapper>
  )
}

RemoveLiquidityModal.propTypes = {
  liquidityPosition: PropTypes.object.isRequired,
}
 
export default RemoveLiquidityModal;