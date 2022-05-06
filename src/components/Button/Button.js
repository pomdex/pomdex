import React from 'react'
import PropTypes from 'prop-types'
import * as styles from "./Button.module.css"

const Button = ({variant, type, onClick, disabled = false, children}) => {
  return(
    <>
      <button 
        className={styles[`${variant}Button`]}
        onClick={onClick}
        disabled={disabled}
        type={type}
      >
        {children}
      </button>
    </>
  );
}

Button.propTypes = {
  variant: PropTypes.oneOf([
    'red',
    'green',
    'blue',
    'purple',
    'transparent',
    'white'
  ]).isRequired,
  type: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  children: PropTypes.node.isRequired
}

Button.defaultProps = {
  disabled: false
}

export default Button