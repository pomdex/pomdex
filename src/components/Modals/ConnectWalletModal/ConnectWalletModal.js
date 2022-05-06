import React, { useContext } from "react"
import { AppContext } from "../../../context/AppContextProvider";
import { toast } from 'react-toastify';
import { getLedgerPublicKey, WALLET_TYPE }
         from '../../../utils/StellarUtils.js';
import * as styles from "./ConnectWalletModal.module.css"
import freighterApi from "@stellar/freighter-api";
import albedo from '@albedo-link/intent'
import ModalWrapper from '../ModalWrapper/ModalWrapper.js';
import ModalHeader from '../ModalHeader/ModalHeader.js';
import Button from '../../Button/Button.js';
 
const ConnectWalletModal = ({handlerFunctions}) => {
  const { setPublicKey, setWalletType } = useContext(AppContext);

  return (
    <ModalWrapper handlerFunctions={handlerFunctions} maxWidth={"360px"}>
      <ModalHeader title="Connect Wallet" />
      <div className={styles.container}>
        <Button 
          type='button'
          onClick={async () => {
            try {
              const key = await getLedgerPublicKey();
              setPublicKey(key);
              setWalletType(WALLET_TYPE.Ledger);
              toast.success("Ledger wallet connected!");
              handlerFunctions.closeModal();
            } catch (error) {
              console.error(error);
              toast.error(error.message);
            }
          }}
          variant='blue'
        >
          Ledger (USB)
        </Button>
        <Button
          type='button'
          onClick={async () => {
            try {
              if (!window.rabet) {
                toast.error("Please install Rabet browser extension!");
                return;
              }
              const result = await window.rabet.connect();
              setPublicKey(result.publicKey);
              setWalletType(WALLET_TYPE.Rabet);
              toast.success("Rabet wallet connected!");
              handlerFunctions.closeModal();
            } catch (error) {
              console.error(error);
              toast.error(error.message);
            }
          }}
          variant='blue'
        >
          Rabet
        </Button>
        <Button
          type='button'
          onClick={async () => {
            try {
              if (!freighterApi.isConnected()) {
                toast.error("Please install Freighter browser extension!");
                return;
              }
              const key = await freighterApi.getPublicKey();
              setPublicKey(key);
              setWalletType(WALLET_TYPE.Freighter);
              toast.success("Freighter wallet connected!");
              handlerFunctions.closeModal();
            } catch (error) {
              console.error(error);
              toast.error(error.message);
            }
          }}
          variant='blue'
        >
          Freighter
        </Button>
        <Button
          type='button'
          onClick={async () => {
            try {
              const result = await albedo.publicKey();
              setPublicKey(result.pubkey);
              setWalletType(WALLET_TYPE.Albedo);
              toast.success("Albedo wallet connected!");
              handlerFunctions.closeModal();
            } catch (error) {
              console.error(error);
              toast.error(error.message);
            }
          }}
          variant='blue'
        >
          Albedo
        </Button>
      </div>
    </ModalWrapper>
  )
}

export default ConnectWalletModal;