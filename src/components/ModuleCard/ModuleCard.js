import React from 'react';
import PropTypes from 'prop-types';
import * as styles from "./ModuleCard.module.css"

const ModuleCard = ({children, className}) => {  
  return(
    <div className={`${styles.moduleCard} ${className}`}>
      {children}
    </div>
  );
}

ModuleCard.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export default ModuleCard;
