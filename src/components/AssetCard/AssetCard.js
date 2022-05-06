import React from 'react'
import PropTypes from 'prop-types'
import * as styles from "./AssetCard.module.css"
import AssetLogo from '../AssetLogo/AssetLogo'
 
const AssetCard = ({ assetCode, assetIssuer, homeDomain, assetLogo, onSelection }) => {
  const formatAssetIssuer = () => {
    if (!assetIssuer) {
      return "NO ASSET ISSUER";
    }
    else if (assetIssuer === "native" ||
             assetIssuer === "native lumens" ) {
      return "Issuer: " + assetIssuer;
    }
    else {
      return "Issuer: " + assetIssuer.slice(0, 10) +
             "........" + assetIssuer.slice(-10);
    }
  }

  return (
    <div className={styles.assetCard} onClick={onSelection}>
      <AssetLogo src={assetLogo} alt={""} className={styles.assetLogo}/>
      <div>
        <div className={styles.assetIdentifier}>
          <p className={styles.assetCode}>
            {assetCode ?? "NO ASSET CODE"}
          </p>
          <p className={styles.assetDomain}>
            {homeDomain ?? "NO HOME DOMAIN"}
          </p>
        </div>
        <div className={styles.assetIssuer}>
          {formatAssetIssuer()} 
        </div>
      </div>
    </div>
  )
}
 
AssetCard.propTypes = {
  assetCode: PropTypes.string,
  assetIssuer: PropTypes.string,
  homeDomain: PropTypes.string,
  assetLogo: PropTypes.string,
  onSelection: PropTypes.func.isRequired
}

export default AssetCard;