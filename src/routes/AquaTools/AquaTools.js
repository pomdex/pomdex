import { React, useState, useEffect } from "react";
import * as styles from "./AquaTools.module.css"
import ClaimAquaVotesModule from '../../components/ClaimAquaVotesModule/ClaimAquaVotesModule.js';
import AquaVotingModule from '../../components/AquaVotingModule/AquaVotingModule.js';
import { getAquaMarketKeys, getAquaVotingSnapshot } from '../../utils/StellarUtils.js';

const AquaTools = () => {
  const [{marketKeys, snapshotData, zeroVotePairs,
          totalVotes, adjustedTotalVotes}, setState] = useState({
            marketKeys: {},
            snapshotData: [],
            zeroVotePairs: [],
            totalVotes: 0,
            adjustedTotalVotes: 0
          });

  const updateAquaData = async () => {
    const marketKeys = await getAquaMarketKeys();
    
    // Convert to a lookup table
    const marketKeysObject = {};
    for (const element of marketKeys) {
      // Handle XLM special case for asset issuer fields
      if (element.asset1 === "native") {
        element.asset1_issuer = "native";
      }
      if (element.asset2 === "native") {
        element.asset2_issuer = "native";
      }
      marketKeysObject[element.account_id] = {...element};
    }

    const snapshotData = await getAquaVotingSnapshot();

    // Add data from market keys object to snapshotData
    for (const element of snapshotData) {
      for (const key in marketKeysObject[element.market_key]) {
        element[key] = marketKeysObject[element.market_key][key];
      }
      // Delete key/value from marketKeysObject, as we'll use what's left next
      delete marketKeysObject[element.market_key];
    }

    let zeroVoteArray = [];
    // Add pairs with no votes to snapshotdata
    for (const key in marketKeysObject) {
      zeroVoteArray.push(marketKeysObject[key]);
    }

    let votes = 0;
    let adjVotes = 0;

    for (const element of snapshotData) {
      votes += parseFloat(element.votes_value);
      adjVotes += parseFloat(element.adjusted_votes_value);
    }

    setState({
      marketKeys: marketKeysObject,
      snapshotData: snapshotData,
      zeroVotePairs: zeroVoteArray,
      totalVotes: votes,
      adjustedTotalVotes: adjVotes
    });
  }

  useEffect(() => {
    updateAquaData();

    const timer = setInterval(() => {
      updateAquaData();
    }, 300000); // 5 minutes

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <div className={styles.aquaTools}>
      <AquaVotingModule
        snapshotData={snapshotData}
        zeroVotePairs={zeroVotePairs}
        totalVotes={totalVotes}
        adjustedTotalVotes={adjustedTotalVotes}
      />
      <ClaimAquaVotesModule
        marketKeys={marketKeys}
        snapshotData={snapshotData}
      />
    </div>
  );
}

export default AquaTools;