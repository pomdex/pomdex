import React from 'react'
import PropTypes from 'prop-types'
import * as styles from "./ModuleTitle.module.css"

const ModuleTitle = ({text}) => {
  return <div className={styles.moduleTitle}>{text}</div>;
}

ModuleTitle.propTypes = {
  text: PropTypes.string.isRequired
}

export default ModuleTitle