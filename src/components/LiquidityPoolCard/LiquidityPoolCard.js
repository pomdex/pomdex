import React, { useState, useContext } from 'react';
import { GlobalModalContext } from "../../context/GlobalModalContextProvider.js";
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types'
import * as styles from "./LiquidityPoolCard.module.css"
import AssetLogo from '../AssetLogo/AssetLogo'
import Button from "../Button/Button.js"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleDown } from '@fortawesome/free-solid-svg-icons'
import useMatchMedia from '../../hooks/useMatchMedia.js';
import useDelayUnmount from '../../hooks/useDelayUnmount.js';
 
const LiquidityPoolCard = ({ liquidityPosition, expandable = false }) => {
  const [ expanded, setExpanded ] = useState(false);
  const navigate = useNavigate();
  const { activateModal } = useContext(GlobalModalContext);
  const isMobile = useMatchMedia("(max-width: 767px)");

  const shouldRenderChild = useDelayUnmount(expanded, 300);

  let defaultButtonStyle = expandable
                             ? styles.assetCardExpandable
                             : styles.assetCard;

  return (
    <div className={styles.poolCard}>
      <button
        className={expanded ? styles.assetCardExpanded : defaultButtonStyle}
        onClick={() => setExpanded(prevState => !prevState)}
        disabled={!expandable}
      >
        {
          // (!isMobile || !expandable) &&
          <div className={styles.assetLogoSection}>
            <AssetLogo src={liquidityPosition.assetA_logo} alt={""} className={styles.assetLogo}/>
            <AssetLogo src={liquidityPosition.assetB_logo} alt={""} className={styles.assetLogo}/>
          </div>
        }
        <div className={styles.assetIdentifier}>
          <p className={styles.assetCodes}>
            {`${liquidityPosition.assetA_code} / ${liquidityPosition.assetB_code}`}
          </p>
          <div className={styles.assetDomains}>
            {`${liquidityPosition.assetA_domain} / ${liquidityPosition.assetB_domain}`} 
          </div>
        </div>
        {
          !isMobile && expandable &&
          <div className={styles.assetBalancesSection}>
            <div className={styles.assetBalance}>
              {liquidityPosition.assetA_balance}
              <span className={styles.boldAssetCode}>{liquidityPosition.assetA_code}</span>
            </div>
            <div className={styles.assetBalance}>
              {liquidityPosition.assetB_balance}
              <span className={styles.boldAssetCode}>{liquidityPosition.assetB_code}</span>
            </div>
          </div>
        }
        {
          expandable &&
          <FontAwesomeIcon
            icon={ faAngleDown }
            className={expanded ? styles.upArrow : styles.downArrow}
          />
        }
      </button>
      {
        expandable &&
        <div className={expanded ? styles.poolDetailsWrapperExpanded : styles.poolDetailsWrapper}>
          {
            shouldRenderChild &&
            <div className={styles.poolDetails}>
              {
                isMobile &&
                <div className={styles.detailRow}>
                  <div className={styles.detailLabel}>
                    {liquidityPosition.assetA_code}
                  </div>
                  <div>{liquidityPosition.assetA_balance}</div>
                </div>
              }
              {
                isMobile &&
                <div className={styles.detailRow}>
                  <div className={styles.detailLabel}>
                    {liquidityPosition.assetB_code}
                  </div>
                  <div>{liquidityPosition.assetB_balance}</div>
                </div>
              }
              <div className={styles.detailRow}>
                <div className={styles.detailLabel}>
                  {"Pool %"}
                </div>
                <div>{liquidityPosition.poolPercentage}</div>
              </div>
              <div className={styles.detailRow}>
                <div className={styles.detailLabel}>
                  {"Pool Shares"}
                </div>
                <div>{liquidityPosition.balance}</div>
              </div>
              <div className={styles.detailRow}>
                <div className={styles.detailLabel}>
                  {"Pool Members"}
                </div>
                <div>{liquidityPosition.total_trustlines}</div>
              </div>
              <div className={styles.buttonContainer}>
                <Button
                  variant='green'
                  type='button'
                  onClick={() => navigate(`/liquidity-pools/${liquidityPosition.assetA_code}:${liquidityPosition.assetA_issuer}/` +
                                          `${liquidityPosition.assetB_code}:${liquidityPosition.assetB_issuer}`)}
                >
                  {isMobile ? "Add" : "Add Liquidity"}
                </Button>
                <Button
                  variant='red'
                  type='button'
                  onClick={() => activateModal("RemoveLiquidityModal", {liquidityPosition: liquidityPosition})}
                >
                  {isMobile ? "Remove" : "Remove Liquidity"}
                </Button>
              </div>
            </div>
          }
        </div>
      }
    </div>
  )
}
 
LiquidityPoolCard.propTypes = {
  liquidityPosition: PropTypes.object.isRequired,
  expandable: PropTypes.bool
}

export default LiquidityPoolCard;