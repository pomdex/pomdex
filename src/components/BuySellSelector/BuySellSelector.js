import React from 'react'
import PropTypes from 'prop-types'
import * as styles from "./BuySellSelector.module.css"
import Button from '../Button/Button'

const BuySellSelector = ({buySelected, setBuySelected}) => {
  return(
    <div className={styles.buySellSelector}>
      <Button
        type='button'
        variant={buySelected ? 'green' : 'transparent'}
        onClick={() => setBuySelected(true)}
      >
        BUY
      </Button>
      <Button
        type='button'
        variant={buySelected ? 'transparent' : 'red'}
        onClick={() => setBuySelected(false)}
      >
        SELL
      </Button>
    </div>
  );
}

BuySellSelector.propTypes = {
  buySelected: PropTypes.bool.isRequired,
  setBuySelected: PropTypes.func.isRequired
}

export default BuySellSelector