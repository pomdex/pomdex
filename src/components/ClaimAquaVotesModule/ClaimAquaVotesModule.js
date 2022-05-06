import React, { useState, useEffect, useContext } from 'react'
import { AppContext } from "../../context/AppContextProvider";
import { GlobalModalContext } from "../../context/GlobalModalContextProvider";
import { toast } from 'react-toastify';
import PropTypes from 'prop-types'
import { loadClaimableBalances, httpRequestInterval, shortenPublicKey, formatDateUTC }
  from '../../utils/StellarUtils.js';
import * as styles from "./ClaimAquaVotesModule.module.css"
import { getNextClaimTime } from '../../utils/claimableBalancesHelpers';
 
const ClaimAquaVotesModule = ({marketKeys, snapshotData, onSuccess,
                               onFailure, displayResult}) => {
  const { publicKey } = useContext(AppContext);
  const { activateModal } = useContext(GlobalModalContext);
  const [aquaBalances, setAquaBalances] = useState([]);

  const updateAquaBalances = async (publicKey) => {
    try {
      const allBalances = await loadClaimableBalances(publicKey);
      const aquaVotes = allBalances.filter(element =>
        element.asset === "AQUA:GBNZILSTVQZ4R7IKQDGHYGY2QXL5QOFJYQMXPKWRRM5PAV7Y4M67AQUA"
      );
      setAquaBalances(aquaVotes);
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  }

  const displayAvailability = (claimTimeObject) => {
    if (claimTimeObject.canClaim) {
      return "Now";
    }
    else if (claimTimeObject.isExpired) {
      return "Expired";
    }
    else if (claimTimeObject.isConflict) {
      return "Conflict";
    }
    else {
      return formatDateUTC(claimTimeObject.claimStart._i);
    }
  }

  const createAquaBalanceRow = (balance) => {
    let address = balance.sponsor;
    let votePair = "N/A"; 
    let claimDetails = {};
    let available = "";
    let claimDetailsSet = false;
    let addressFound = false;
    
    for (const claimant of balance.claimants) {
      if (claimDetailsSet && addressFound) {
        break;
      }
      else if (claimant.destination === publicKey) {
        claimDetails = getNextClaimTime(claimant.predicate, Date.now());
        available = displayAvailability(claimDetails);
        balance.available = available;
        balance.claimDetails = claimDetails;
        claimDetailsSet = true;
        continue;
      }
      else if (addressFound) {
        continue;
      }
      else if (claimant.destination in marketKeys) {
        address = claimant.destination;
        addressFound = true;
      }
      else {
        for (const element of snapshotData) {
          if (claimant.destination === element.upvote_account_id ||
              claimant.destination === element.downvote_account_id) {
                address = claimant.destination === element.upvote_account_id
                            ? element.upvote_account_id
                            : element.downvote_account_id
                votePair = `${element.asset1_code}/${element.asset2_code}`;
                addressFound = true;
              }
        }
      }
    }
    
    balance.address = address;

    if (address in marketKeys) {
      votePair = `${marketKeys[address].asset1_code}/${marketKeys[address].asset2_code}`;
    }
    
    balance.votePair = votePair;

    return (
      <div key={balance.id}
        className={styles.balanceRow}
        onClick={() => activateModal("ClaimableBalanceModal", {balance})}
      >
        <div className={styles.timeVoted} style={{flex: 1}}>
          {formatDateUTC(balance.last_modified_time)}
        </div>
        <div className={styles.tableItemWithLabel} style={{flex: 1}}>
          <label className={styles.label}>Available:</label>
          {available}
        </div>
        <div className={styles.tableItemWithLabel} style={{flex: 0.7}}>
          <label className={styles.label}>Pair:</label>
          {votePair}
        </div>
        <div className={styles.address} style={{flex: 1}}>
          {shortenPublicKey(address, 5, 5)}
        </div>
        <div className={styles.tableItemWithLabel} style={{flex: 1}}>
          <label className={styles.label}>Amount:</label>
          {balance.amount}
        </div>
      </div>
    )
  }

  useEffect(() => {
    if (!publicKey) {
      setAquaBalances([]);
      return;
    }
    const fetchData = async () => {
      updateAquaBalances(publicKey); 
    }
    fetchData();
    const timer = setInterval(() => {
      fetchData();
    }, httpRequestInterval);
    return () => {
      clearInterval(timer);
    };
  }, [publicKey]);

  return (
    <div className={styles.container}>
      <h3>Claim AQUA</h3>
      <div className={styles.tableHeader}>
        <div className={styles.timeVotedHeader} style={{flex: 1}}>Date/Time Voted</div>
        <div className={styles.tableHeaderItem} style={{flex: 1}}>Available</div>
        <div className={styles.tableHeaderItem} style={{flex: 0.7}}>Vote Pair</div>
        <div className={styles.addressHeader} style={{flex: 1}}>Address</div>
        <div className={styles.tableHeaderItem} style={{flex: 1}}>Amount</div>
      </div>
      <div className={styles.list}>
        {
          aquaBalances.map(element =>
            createAquaBalanceRow(element)
          )
        }
      </div>
    </div>
  )
}

ClaimAquaVotesModule.propTypes = {
  marketKeys: PropTypes.object,
  snapshotData: PropTypes.array,
  onSuccess: PropTypes.func,
  onFailure: PropTypes.func,
  displayResult: PropTypes.func,
}
 
export default ClaimAquaVotesModule;