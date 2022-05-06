import React from 'react'
import PropTypes from 'prop-types'
import * as styles from "./StellarPublicKey.module.css"
import { generateIdenticon, shortenPublicKey } from '../../utils/StellarUtils.js';
import AssetLogo from '../AssetLogo/AssetLogo';

const StellarPublicKey = ({publicKey}) => {
  return(
    <div className={styles.account}>
      {
        publicKey &&
        <AssetLogo
          src={generateIdenticon(publicKey)}
          alt=''
          className={styles.identicon}
        />
      }
      {publicKey ? shortenPublicKey(publicKey, 4, 5) : "Connect Wallet:"}
    </div>
  );
}

StellarPublicKey.propTypes = {
  publicKey: PropTypes.string.isRequired,
}

export default StellarPublicKey