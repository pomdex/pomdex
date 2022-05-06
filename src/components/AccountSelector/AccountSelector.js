import React, { useContext } from "react"
import { AppContext } from "../../context/AppContextProvider.js";
import { GlobalModalContext } from "../../context/GlobalModalContextProvider";
import PropTypes from "prop-types"
import * as styles from "./AccountSelector.module.css"
import StellarPublicKey from '../../components/StellarPublicKey/StellarPublicKey.js';
import Button from '../../components/Button/Button.js';

const AccountSelector = ({ vertical }) => {
  const { publicKey } = useContext(AppContext);
  const { activateModal } = useContext(GlobalModalContext);

  const walletConnected = publicKey !== "";  

  return (
    <div
      className={vertical ? styles.accountSelectorVertical : styles.accountSelectorHorizontal}
    >
      {walletConnected && 
        <button
          type='button'
          className={styles.accountWrapper}
          onClick={() => activateModal("ConnectWalletModal")} 
        >
          <div
            className={styles.account}
            >
            <StellarPublicKey publicKey={publicKey}/>
          </div>
        </button>
      }
      {
        !walletConnected &&
        <Button 
          type='button'
          onClick={ () => activateModal("ConnectWalletModal")}
          variant='blue'
        >
          Connect Wallet
        </Button>
      }
    </div>
  )
}

AccountSelector.propTypes = {
  vertical: PropTypes.bool,
}

export default AccountSelector
