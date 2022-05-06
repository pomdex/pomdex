import React, { useState, useContext, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import * as styles from "./AquaVotingModule.module.css"
import { AppContext } from "../../context/AppContextProvider.js";
import { GlobalModalContext } from '../../context/GlobalModalContextProvider';
import Button from '../Button/Button.js';
import { Link } from 'react-router-dom';
import { getAquaBalance, httpRequestInterval } from '../../utils/StellarUtils.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleLeft, faAngleRight, faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons'
import useMatchMedia from '../../hooks/useMatchMedia';
 
const AquaVotingModule = ({snapshotData, zeroVotePairs,
                           totalVotes, adjustedTotalVotes}) => {
  const itemsPerPage = 10;

  const [ startIndex, setStartIndex ] = useState(0);
  const [ searchString, setSearchString ] = useState("");
  const [ aquaBalance, setAquaBalance ] = useState("");
  
  const { publicKey } = useContext(AppContext);
  const { activateModal } = useContext(GlobalModalContext);

  const displayedDataLength = useRef(snapshotData.length);

  const isMobile = useMatchMedia("(max-width: 1050px)");

  useEffect(() => {
    if (!publicKey) {
      setAquaBalance("");
      return;
    }

    const fetchData = async () => {
      updateAquaBalance(publicKey); 
    }
    fetchData();
    
    const timer = setInterval(() => {
      fetchData();
    }, httpRequestInterval);

    return () => {
      clearInterval(timer);
    };
  }, [publicKey]);

  const handleSearchStringChange = (event) => {
    setSearchString(event.target.value);
    setStartIndex(0);
  }

  const updateAquaBalance = async (publicKey) => {
    try {
      setAquaBalance(await getAquaBalance(publicKey));
    } catch (error) {
      setAquaBalance("");
    }
  }

  const isFirstPage = () => {
    return startIndex === 0;
  }

  const isLastPage = () => {
    return startIndex + itemsPerPage >= displayedDataLength.current;
  }
  
  const decrementStartIndex = () => {
    if (isFirstPage()) {
      return;
    }
    setStartIndex(startIndex - itemsPerPage);
  }
  
  const incrementStartIndex = () => {
    if (isLastPage()) {
      return;
    } 
    setStartIndex(startIndex + itemsPerPage);
  }

  const isRewardEligible = (element) => {
    return parseFloat(element.adjusted_votes_value) / adjustedTotalVotes >= 0.01;
  }

  const isBoosted = (element) => {
    return parseFloat(element.adjusted_votes_value) > 
           parseFloat(element.votes_value);
  }

  const displayAquaBalance = () => {
    let balance = Math.floor(parseFloat(aquaBalance)).toLocaleString();
    if (!aquaBalance) {
      balance = "N/A";
    } else if (aquaBalance === "No Trustline"){
      balance = aquaBalance;
    }
    return `Available AQUA: ${balance}`;
  }

  const displayVotePercentage = (element) => {
    const unrounded = (parseFloat(element.votes_value) / totalVotes) * 100;
    // Display with 2 decimal places, rounded down
    const roundedDown = Math.floor(unrounded * 100) / 100;
    return `${roundedDown}%`; 
  }

  const displayBoostedVotePercentage = (element) => {
    const unrounded = (parseFloat(element.adjusted_votes_value) / 
                                  adjustedTotalVotes) * 100;
    // Display with 2 decimal places, rounded down
    const roundedDown = Math.floor(unrounded * 100) / 100;
    return `${roundedDown}%`; 
  }
  
  const displayPairData = () => {
    const rawData = searchString === ''
                      ? snapshotData
                      : [...snapshotData, ...zeroVotePairs];
                      
    const filteredData =
      rawData.filter(element => 
         element.asset1_code && element.asset2_code &&
        (element.asset1_code.toLowerCase().includes(searchString.toLowerCase()) ||
         element.asset2_code.toLowerCase().includes(searchString.toLowerCase()))
      )

    displayedDataLength.current = filteredData.length;

    return (
      filteredData.slice(startIndex, startIndex + itemsPerPage)
                  .map(element =>
        <div key={element.id} className={styles.balanceRow}>
          <div className={styles.pair}>
            <div className={styles.assetName}>
              {`${element.asset1_code}/${element.asset2_code}`}
            </div>
            {isRewardEligible(element) && <div className={styles.rewardLabel}>REWARDS</div>}
            {isBoosted(element) && <div className={styles.boostLabel}>BOOST</div>}
          </div>
          <div className={styles.voters}>
            <label className={styles.label}>Voters:</label>
            {element.voting_amount}
          </div>
          <div className={styles.aquaVotesContainer}>
            <label className={styles.label}>Votes:</label>
            {
              element.votes_value &&
              <div className={styles.votesDisplay}>
                <div>{Math.round(parseFloat(element.votes_value)).toLocaleString()}</div> 
                <div className={styles.votePercentage}>
                  {displayVotePercentage(element)}
                  <div 
                    className={isBoosted(element) ? styles.boostPercentage : styles.percentage}
                  >
                    <FontAwesomeIcon
                      icon={faArrowUp}
                      transform={{ rotate: isBoosted(element) ? 90 : 90 }}
                    />
                    {` ${displayBoostedVotePercentage(element)}`}
                  </div>
                </div>
              </div>
            }
          </div>
          <div className={styles.actionButtons}>
            <Button
              type='button'
              variant={"green"}
              onClick={
                publicKey 
                  ? () => activateModal("AquaVoteModal", {snapshotData: element,
                                                          aquaBalance,
                                                          upvote: true})
                  : () => activateModal("ConnectWalletModal")
              }
            >
              {isMobile ? "Up " : "Upvote "}
              <FontAwesomeIcon icon={faArrowUp} />
            </Button>
            <Button
              type='button'
              variant={"red"}
              onClick={
                publicKey 
                  ? () => activateModal("AquaVoteModal", {snapshotData: element,
                                                          aquaBalance,
                                                          upvote: false})
                  : () => activateModal("ConnectWalletModal")
              }
            >
              {isMobile ? "Down " : "Downvote "}
              <FontAwesomeIcon icon={faArrowDown} />
            </Button>
            <Link
              to={`/trading/${element.asset1_code}:${element.asset1_issuer}/` + 
                  `${element.asset2_code}:${element.asset2_issuer}`}
              className={styles.tradeLink}
            >
              Trade
            </Link>
            <Link
              to={`/liquidity-pools/${element.asset1_code}:${element.asset1_issuer}/` + 
                  `${element.asset2_code}:${element.asset2_issuer}`}
              className={styles.poolLink}
            >
              {isMobile ? "LP" : "Pool"}
            </Link>
          </div>
        </div>
      )
    ); 
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>AQUA Voting</h3>
      <div className={styles.moduleHeaderGrid}>
        <input 
          className={styles.assetSearch} 
          id='assetSearch'
          name='assetSearch'
          type='text'
          placeholder='Search by asset code'
          autoComplete='off'
          value={searchString}
          onChange={handleSearchStringChange}
        />
        <div className={styles.aquaBalance}>
          {displayAquaBalance()}
        </div>
        <div className={styles.pageButtons}>
          <Button type='button' variant={"transparent"} onClick={() => setStartIndex(0)}>
            First
          </Button>
          <Button type='button' variant={"transparent"} onClick={decrementStartIndex}>
            <FontAwesomeIcon className={styles.navArrow} icon={faAngleLeft} />
          </Button>
          <Button type='button' variant={"transparent"} onClick={incrementStartIndex}>
            <FontAwesomeIcon className={styles.navArrow} icon={faAngleRight} />
          </Button>
          <Button 
            type='button'
            variant={"transparent"}
            onClick={
              () => setStartIndex(
                  displayedDataLength.current % itemsPerPage === 0
                    ? displayedDataLength.current - itemsPerPage
                    : displayedDataLength.current - (displayedDataLength.current % itemsPerPage)
                )
            }
          >
            Last
          </Button>
        </div>
        <div className={styles.totalVotes}>
          {`Votes: ${Math.round(totalVotes).toLocaleString()}`}
          <div className={styles.pairCount}>{`(${snapshotData.length} Pairs)`}</div>
        </div>
      </div>
      <div className={styles.tableHeader}>
        <div className={styles.pairHeader}>Pair</div>
        <div className={styles.votersHeader}>Voters</div>
        <div className={styles.aquaVotesHeader}>AQUA Votes</div>
        <div className={styles.actionButtonsHeader}>Actions</div>
      </div>
      <div className={styles.list}>
        {displayPairData()}
      </div>
    </div>
  )
}

AquaVotingModule.propTypes = {
  snapshotData: PropTypes.array.isRequired,
  zeroVotePairs: PropTypes.array.isRequired,
  totalVotes: PropTypes.number.isRequired,
  adjustedTotalVotes: PropTypes.number.isRequired
}
 
export default AquaVotingModule;