import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from "../../context/AppContextProvider.js";
import * as styles from "./LiquidityPositionsModule.module.css"
import { httpRequestInterval, loadAccountLiquidityPositions } from '../../utils/StellarUtils';
import ModuleCard from "../ModuleCard/ModuleCard.js"
import LiquidityPoolCard from '../LiquidityPoolCard/LiquidityPoolCard.js';

const LiquidityPositionsModule = (props) => {
  const [liquidityPositions, setLiquidityPositions] = useState([]);
  const { publicKey } = useContext(AppContext);

  useEffect(() => {
    if (!publicKey) {
      return;
    }

    const fetchData = async () => {
      updateLiquidityPositions(publicKey);
    }

    fetchData();
    
    const timer = setInterval(() => {
      fetchData();
    }, httpRequestInterval);

    return () => {
      clearInterval(timer);
    };
  }, [publicKey]);

  const updateLiquidityPositions = async (publicKey) => {
    try {
      const updatedPositions = await loadAccountLiquidityPositions(publicKey);
      setLiquidityPositions(updatedPositions);
    } catch (error) {
      console.error(error);
    }
  }

  const displayMessage = () => {
    return publicKey
             ? "No liquidity positions found"
             : "Connect your wallet to view";
  }

  return(
    <ModuleCard className={styles.module}>
      <p className={styles.title}>My Liquidity Pools</p>
      <div className={styles.liquidityPositions}>
        {
          liquidityPositions.length === 0
            ? <div>{displayMessage()}</div>
            : liquidityPositions.map(element =>
                <div key={element.id} >
                  <LiquidityPoolCard liquidityPosition={element} expandable/>
                </div>
              )
        }
      </div>
    </ModuleCard>
  );
}

export default LiquidityPositionsModule;
