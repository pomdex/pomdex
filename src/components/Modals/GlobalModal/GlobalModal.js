import React from 'react';
import PropTypes from 'prop-types';
import * as styles from "./GlobalModal.module.css"
import AquaVoteModal from '../AquaVoteModal/AquaVoteModal.js';
import AssetSelectorModal from '../AssetSelectorModal/AssetSelectorModal.js';
import ClaimableBalanceModal from '../ClaimableBalanceModal/ClaimableBalanceModal.js';
import ConnectWalletModal from '../ConnectWalletModal/ConnectWalletModal.js';
import EditOfferModal from '../EditOfferModal/EditOfferModal.js';
import RemoveLiquidityModal from '../RemoveLiquidityModal/RemoveLiquidityModal.js';
import SignTransactionModal from '../SignTransactionModal/SignTransactionModal.js';
import ModalWrapper from '../ModalWrapper/ModalWrapper';
import ModalHeader from '../ModalHeader/ModalHeader';

const GlobalModal = ({type, active, inputData, handlerFunctions}) => {
  let body;

  switch (type) {
    case 'AquaVoteModal':
      body = <AquaVoteModal
               handlerFunctions={handlerFunctions}
               snapshotData={inputData.snapshotData}
               aquaBalance={inputData.aquaBalance}
               upvote={inputData.upvote}
             />;
      break;
    case 'AssetSelectorModal':
      body = <AssetSelectorModal
               handlerFunctions={handlerFunctions}
               assets={inputData.assets}
               onSelection={inputData.onSelection}
             />;
      break;
    case 'ClaimableBalanceModal':
      body = <ClaimableBalanceModal
               handlerFunctions={handlerFunctions}
               balance={inputData.balance}
             />;
      break;
    case 'ConnectWalletModal':
      body = <ConnectWalletModal handlerFunctions={handlerFunctions}/>;
      break;
    case 'EditOfferModal':
      body = <EditOfferModal
               handlerFunctions={handlerFunctions}
               offer={inputData.offer}
               sellingAsset={inputData.sellingAsset}
               buyingAsset={inputData.buyingAsset}
               isBuyOffer={inputData.isBuyOffer}
               onSuccess={inputData.onSuccess}
               onFailure={inputData.onFailure}
             />;
      break;
    case 'RemoveLiquidityModal':
      body = <RemoveLiquidityModal
               handlerFunctions={handlerFunctions}
               liquidityPosition={inputData.liquidityPosition}
             />;
      break;
    case 'SignTransactionModal':
      body = <SignTransactionModal
               handlerFunctions={handlerFunctions}
               submitting={inputData.submitting ?? false}
             />;
      break;
    default:
      body = (
        <ModalWrapper handlerFunctions={handlerFunctions} maxWidth={"500px"}>
          <ModalHeader title={"ERROR: Invalid Modal"} />
        </ModalWrapper>
      );
      break;
  }
    
  return(
    <div className={active ? styles.modalContainer : styles.hidden}>
      {body}
    </div>
  );
}

GlobalModal.propTypes = {
  type: PropTypes.string.isRequired,
  active: PropTypes.bool.isRequired,
  inputData: PropTypes.object,
  handlerFunctions: PropTypes.object.isRequired,
};

export default GlobalModal;
