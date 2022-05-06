import React, { useContext } from 'react'
import { AppContext } from "../../../context/AppContextProvider";
import { GlobalModalContext } from "../../../context/GlobalModalContextProvider.js";
import { toast } from 'react-toastify';
import PropTypes from 'prop-types'
import { server, createClaimClaimableBalanceTx, signTransaction, shortenPublicKey }
         from '../../../utils/StellarUtils.js';
import * as styles from "./ClaimableBalanceModal.module.css"
import ModalWrapper from '../ModalWrapper/ModalWrapper.js';
import ModalHeader from '../ModalHeader/ModalHeader.js';
import Button from '../../Button/Button.js';
import StellarExpertLinkIcon from '../../StellarExpertLinkIcon/StellarExpertLinkIcon.js';
 
const ClaimableBalanceModal = ({handlerFunctions, balance}) => {
  const {publicKey, walletType} = useContext(AppContext);
  const { activateModal, setModalInputData, closeModal } = useContext(GlobalModalContext);
  const canClaim = balance.claimDetails.canClaim;

  const claimBalance = async (balanceId) => {
    if (!publicKey) {
      toast.error("Wallet not connected!");
      return;
    }
    try {
      let transaction = await createClaimClaimableBalanceTx(publicKey, balance.id)
      activateModal("SignTransactionModal");
      transaction = await signTransaction(transaction, walletType, publicKey);

      setModalInputData({submitting: true});
      await server.submitTransaction(transaction);
      
      toast.success("Balance claimed!");
      handlerFunctions.closeModal();
    } catch (error) {
      console.error(error);
      toast.error("Transaction failed: " + error.message);
    }
    closeModal();
  }

  return (
    <ModalWrapper handlerFunctions={handlerFunctions} maxWidth={"380px"}>
      <ModalHeader title={`Claim ${balance.asset.split(':')[0]}`} />
      <div className={styles.detailsGrid}>
        <div className={styles.label}>Available:</div>
        <div className={styles.content}>{balance.available}</div>
        <div className={styles.label}>Amount:</div>
        <div className={styles.content}>{parseFloat(balance.amount).toLocaleString()}</div>
        <div className={styles.label}>Vote Pair:</div>
        <div className={styles.content}>{balance.votePair}</div>
        <div className={styles.label}>Address:</div>
        <div className={styles.content}>
          {shortenPublicKey(balance.address, 5, 5)}
          <StellarExpertLinkIcon account={balance.address} />
        </div>
        <div className={styles.label}>Balance ID:</div>
        <div className={styles.content}>{shortenPublicKey(balance.id, 6, 5)}</div>
      </div>
      <Button
        type='button'
        variant={canClaim ? 'green' : 'red'}
        disabled={!canClaim}
        onClick={() => claimBalance(balance.id)}
      >
        {canClaim ? "Claim Balance" : "Cannot Claim Balance"}
      </Button>
    </ModalWrapper>
  )
}

ClaimableBalanceModal.propTypes = {
  onSuccess: PropTypes.func,
  onFailure: PropTypes.func,
  displayResult: PropTypes.func,
}
 
export default ClaimableBalanceModal;