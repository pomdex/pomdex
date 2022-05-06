import React from 'react'
import PropTypes from 'prop-types'
import * as styles from "./StellarExpertLinkIcon.module.css"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons'

const StellarExpertLinkIcon = ({account}) => {
  return(
    <span className={styles.container}>
      <a
        className={styles.link}
        target="_blank"
        href={`https://stellar.expert/explorer/public/account/${account}`}
        rel="noopener noreferrer"
      >
        <FontAwesomeIcon icon={faExternalLinkAlt} alt="(opens in new tab)" />
      </a>
    </span>
  );
}

StellarExpertLinkIcon.propTypes = {
  account: PropTypes.string.isRequired,
}

export default StellarExpertLinkIcon