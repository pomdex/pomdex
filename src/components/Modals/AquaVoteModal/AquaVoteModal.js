import React, { useState, useContext } from 'react'
import { AppContext } from "../../../context/AppContextProvider";
import { GlobalModalContext } from "../../../context/GlobalModalContextProvider.js";
import { toast } from 'react-toastify';
import PropTypes from 'prop-types'
import { server, createAquaVoteTx, signTransaction,
  shortenPublicKey } from '../../../utils/StellarUtils.js';
import * as styles from "./AquaVoteModal.module.css"
import ModalWrapper from '../ModalWrapper/ModalWrapper.js';
import ModalHeader from '../ModalHeader/ModalHeader.js';
import Button from '../../Button/Button.js';
import NumericalDropdown from '../../NumericalDropdown/NumericalDropdown.js';
import StellarExpertLinkIcon from '../../StellarExpertLinkIcon/StellarExpertLinkIcon';
 
const secondsInYear = 31536000;
const secondsInDay = 86400;
const secondsInHour = 3600;
const secondsInMinute = 60;
const initialDuration = "3600";
const initialTimeState = {
  seconds: "0",
  minutes: "0",
  hours: "1",
  days: "0",
};

const AquaVoteModal = ({handlerFunctions, snapshotData, aquaBalance, upvote}) => {
  const [aquaVotes, setAquaVotes] = useState("");
  const [durationInSeconds, setDurationInSeconds] = useState(initialDuration);
  const [timeState, setTimeState] = useState(initialTimeState);

  const {publicKey, walletType} = useContext(AppContext);
  const { activateModal, setModalInputData, closeModal } = useContext(GlobalModalContext);

  const destination = upvote
                        ? snapshotData.upvote_account_id
                        : snapshotData.downvote_account_id

  const handleInputChange = (event) => {
    const inputName = event.target.name;
    const value = event.target.value.replace(/^0+/, '');

    // Return if input value is not digits only and not empty
    if (!(/^\d+$/.test(value)) && value.length !== 0) {
      return;
    }
    else if (inputName === "aquaVotes") {
      setAquaVotes(value);
    }
    else if (inputName === "durationInSeconds") {
      // Return if value is more than one year
      if (value > secondsInYear) {
        return;
      }

      setDurationInSeconds(value);

      const days = Math.floor(value / secondsInDay);
      const daysValue = days * secondsInDay;
      
      const hours = Math.floor((value - daysValue) / secondsInHour);
      const hoursValue = hours * secondsInHour;

      const minutes = Math.floor((value - daysValue - hoursValue) / secondsInMinute);
      const seconds = value - daysValue - hoursValue - (minutes * secondsInMinute);

      setTimeState({days, minutes, hours, seconds});
    }
    else {
      toast.error("Invalid input!");
    }
  }

  const handleDropdownChange = (event) => {
    const updatedState = {...timeState};
    updatedState[event.target.name] = event.target.value;
    setTimeState(updatedState);

    const duration = ((parseInt(updatedState.days) * secondsInDay) +
                      (parseInt(updatedState.hours) * secondsInHour) +
                      (parseInt(updatedState.minutes) * secondsInMinute) +
                       parseInt(updatedState.seconds)).toString();
                       
    setDurationInSeconds(duration);
  }

  const resetDuration = () => {
    setDurationInSeconds(initialDuration);
    setTimeState(initialTimeState);
  }

  const handleSubmitVote = async (event) => {
    event.preventDefault();
    if (!publicKey) {
      toast.error("Wallet not connected!");
      return;
    }

    try {
      let transaction = await createAquaVoteTx(publicKey, destination,
                                               aquaVotes, durationInSeconds);
      activateModal("SignTransactionModal");   
      transaction = await signTransaction(transaction, walletType, publicKey);
      setModalInputData({submitting: true});
      await server.submitTransaction(transaction);
      toast.success(`${aquaVotes.toLocaleString()} AQUA votes cast!`);
      handlerFunctions.closeModal();
    } catch (error) {
        toast.error("Transaction failed: " + error.message);
    }
    closeModal();
  }

  const displayAquaBalance = () => {
    if (!aquaBalance) {
      return "0";
    } else if (aquaBalance === "No Trustline"){
      return aquaBalance;
    }
    else {
      return Math.floor(parseFloat(aquaBalance)).toLocaleString();
    }
  }

  return (
    <ModalWrapper handlerFunctions={handlerFunctions} maxWidth={"520px"}>
      <ModalHeader
        title={`${upvote ? "Upvote" : "Downvote"} 
                ${snapshotData.asset1_code}/${snapshotData.asset2_code}`}
      />
      <form className={styles.modalBody}>
        <div className={styles.textInputSection}>
          <div className={styles.textInputGrid}>
            <div className={styles.rowName}>Available AQUA:</div>
            <div className={styles.aquaBalanceContainer}>
              <span className={styles.aquaBalance}>
                {displayAquaBalance()}
              </span>
            </div>
            <div className={styles.rowName}>Vote Account:</div>
            <div className={styles.publicKey}>
              {shortenPublicKey(destination, 5, 3)}
              <StellarExpertLinkIcon account={destination} />
            </div>
            <label htmlFor="aquaVotes" className={styles.rowName}>
              AQUA Votes:
            </label>
            <input
              className={styles.input}
              type="text"
              autoComplete="off"
              id="aquaVotes"
              name="aquaVotes"
              value={aquaVotes}
              onChange={handleInputChange}
            />
            <label htmlFor="durationInSeconds" className={styles.rowName}>
              Duration (seconds):
            </label>
            <input
              className={styles.input}
              type="text"
              autoComplete="off"
              id="durationInSeconds"
              name="durationInSeconds"
              value={durationInSeconds}
              onChange={handleInputChange}
              onBlur={event => {
                if (event.target.value === "") {
                  setDurationInSeconds("0");
                }
              }}
            />
            <div className={styles.submitButtonWrapper}>
              <Button type='submit' variant='green' onClick={handleSubmitVote}>
                Submit AQUA Votes
              </Button>
            </div>
          </div>
        </div>
        <div className={styles.dropdownSection}>
          <NumericalDropdown
            name="seconds"
            labelText="Seconds"
            value={timeState.seconds}
            elements={[...Array(60).keys()]}
            onChange={handleDropdownChange}
          />
          <NumericalDropdown
            name="minutes"
            labelText="Minutes"
            value={timeState.minutes}
            elements={[...Array(60).keys()]}
            onChange={handleDropdownChange}
          />
          <NumericalDropdown
            name="hours"
            labelText="Hours"
            value={timeState.hours}
            elements={[...Array(24).keys()]}
            onChange={handleDropdownChange}
          />
          <NumericalDropdown
            name="days"
            labelText="Days"
            value={timeState.days}
            elements={[...Array(366).keys()]}
            onChange={handleDropdownChange}
          />
          <Button type='button' variant='red' onClick={resetDuration}>
            Reset Duration
          </Button>
        </div>
      </form>
      <div className={styles.message}>
        *AQUA votes may not be counted if vote duration is less than 1 hour
      </div>
    </ModalWrapper>
  )
}

AquaVoteModal.propTypes = {
  onSuccess: PropTypes.func,
  onFailure: PropTypes.func,
  displayResult: PropTypes.func,
}
 
export default AquaVoteModal;