import React from 'react'
import PropTypes from 'prop-types'
import * as styles from "./NumericalDropdown.module.css"

const NumericalDropDown = ({name, labelText, value, elements, onChange, ...props}) => {
  return(
    <div className={styles.numericalDropdown}>
      <label htmlFor={name}>{labelText}</label>
      <select name={name} id={name} value={value} onChange={onChange} className={styles.select}>
        {
          elements.map(element =>
            <option key={element} value={element}>{element}</option>
          )
        }
      </select>
    </div>
  );
}

NumericalDropDown.propTypes = {
  name: PropTypes.string.isRequired,
  labelText: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  elements: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired
}

export default NumericalDropDown