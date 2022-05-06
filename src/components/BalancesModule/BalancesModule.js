import React, { useState } from 'react'
import PropTypes from 'prop-types'
import * as styles from "./BalancesModule.module.css"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleUp, faAngleDown } from '@fortawesome/free-solid-svg-icons';

const BalancesModule = ({balances}) => {
  const [balancesShowing, setBalancesShowing] = useState(false);
  const [zeroBalancesShowing, setZeroBalancesShowing] = useState(false);

  const handleBalancesShowing = (event) => {
    setBalancesShowing(prevState => !prevState);
  }

  const handleZeroBalancesShowing = (event) => {
    setZeroBalancesShowing(prevState => !prevState);
  }

  const generateUniqueKey = (balanceObject) => {
    if (balanceObject.asset_type === "liquidity_pool_shares") {
      return balanceObject.liquidity_pool_id;
    }
    else {
      return `${balanceObject.asset_code}:${balanceObject.asset_issuer}`;
    }
  }

  return(
    <div className={styles.balancesModule}> 
      <div className={styles.header}>
        <button
          type='button'
          className={styles.settingButton}
          onClick={handleBalancesShowing}
        >
          Account Balances
          <FontAwesomeIcon
            icon={balancesShowing ? faAngleUp : faAngleDown}
            className={styles.icon}
          />
        </button>
        {
          balancesShowing &&
          <button
            type='button'
            className={styles.settingButton}
            onClick={handleZeroBalancesShowing}
          >
            {`${zeroBalancesShowing ? "Hide" : "Show"} Zero Balances`}
          </button>
        }
      </div>
      {
        balancesShowing &&
        <div className={styles.balancesGrid}>
          {
            Object.values(balances).map(element =>
               element.balance &&
              (element.balance > 0 || zeroBalancesShowing) && element.balance &&
              <div key={generateUniqueKey(element)} className={styles.balance}>
                <p className={styles.balanceAssetCode}>{element.asset_code ?? "XLM"}</p>
                <p>{element.balance}</p>
                <p>
                    {element.asset_type === "liquidity_pool_shares"
                      ? element.available_balance
                      : element.available_balance + " avail."}
                </p>
                <p>{element.home_domain ?? "UNKNOWN DOMAIN"}</p>
              </div>
            )
          }
        </div>
      }
    </div>  
  );
}

BalancesModule.propTypes = {
  balances: PropTypes.array.isRequired
}

export default BalancesModule