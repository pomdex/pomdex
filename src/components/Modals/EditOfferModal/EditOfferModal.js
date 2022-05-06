import React from "react"
import PropTypes from 'prop-types'
import ModalWrapper from '../ModalWrapper/ModalWrapper.js';
import ModalHeader from '../ModalHeader/ModalHeader.js';
import ManageOffer from "../../ManageOffer/ManageOffer";
 
const EditOfferModal = ({handlerFunctions, offer, sellingAsset,
                         buyingAsset, isBuyOffer, onSuccess, onFailure}) => {
  const headerTitle = isBuyOffer ? "Edit Buy Offer" : "Edit Sell Offer";
  
  const availableBalance =
    isBuyOffer
      ? (parseFloat(buyingAsset.available_balance) + parseFloat(offer.amount)).toFixed(7)
      : (parseFloat(sellingAsset.available_balance) + parseFloat(offer.amount)).toFixed(7);

  const price =
    isBuyOffer
      ? (offer.price_r.d/offer.price_r.n).toFixed(7)
      :  offer.price

  const amount =
    isBuyOffer
      ? (offer.amount * (offer.price_r.n/offer.price_r.d)).toFixed(7)
      :  offer.amount

  return (
    <ModalWrapper handlerFunctions={handlerFunctions} maxWidth={"500px"}>
      <ModalHeader title={headerTitle} />
      <ManageOffer
        sellingAsset={sellingAsset}
        buyingAsset={buyingAsset}
        availableBalance={availableBalance}
        currentPrice={price}
        currentAmount={amount}
        offerID={offer.id}
        isBuyOffer={isBuyOffer}
        onOfferPlaced={handlerFunctions.closeModal}
      />
    </ModalWrapper>
  )
}

EditOfferModal.propTypes = {
  handlerFunctions: PropTypes.object.isRequired,
  offer: PropTypes.object.isRequired,
  sellingAsset: PropTypes.object.isRequired,
  buyingAsset: PropTypes.object.isRequired,
  isBuyOffer: PropTypes.bool.isRequired,
  onSuccess: PropTypes.func.isRequired,
  onFailure: PropTypes.func
}
 
export default EditOfferModal;