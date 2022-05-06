import React, { useContext } from 'react'
import { AppContext } from "../../../context/AppContextProvider";
import PropTypes from 'prop-types'
import { WALLET_TYPE } from '../../../utils/StellarUtils.js';
import * as styles from "./SignTransactionModal.module.css"
import ModalWrapper from '../ModalWrapper/ModalWrapper.js';
import ModalHeader from '../ModalHeader/ModalHeader.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSyncAlt } from '@fortawesome/free-solid-svg-icons'
 
const SignTransactionModal = ({handlerFunctions, submitting}) => {
  const { walletType } = useContext(AppContext);

  return (
    <ModalWrapper handlerFunctions={handlerFunctions} maxWidth={"500px"}>
      <ModalHeader title={"Sign Transaction"} />
      <div className={styles.modalBody}>
        <div className={styles.header}>
          {`Please confirm transaction with ${WALLET_TYPE[walletType]}`}
        </div>
        {/* <div className={styles.transactionDetails}>
          Transaction Details
        </div> */}
        <div className={styles.status}>
          <FontAwesomeIcon icon={faSyncAlt} spin />
          {submitting 
            ? "Submitting transaction to Horizon..."
            : "Waiting for signature..."}
        </div>
      </div>
    </ModalWrapper>
  )
}

SignTransactionModal.propTypes = {
  handlerFunctions: PropTypes.object.isRequired,
  submitting: PropTypes.bool
}
 
export default SignTransactionModal;