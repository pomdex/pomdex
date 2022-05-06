import React from 'react'
import PropTypes from 'prop-types'
import * as styles from "./PaddedSection.module.css"

const PaddedSection = ({children}) => {
  return(
    <div className={styles.paddedSection}>
      {children}
    </div>
  );
}

PaddedSection.propTypes = {
  children: PropTypes.node.isRequired
}

export default PaddedSection