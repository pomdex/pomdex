import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import * as styles from "./ModalWrapper.module.css"
import useOnClickOutside from '../../../hooks/useOnClickOutside.js';

const ModalWrapper = ({children, handlerFunctions, maxWidth}) => {
  const ref = useRef();
  useOnClickOutside(ref, handlerFunctions.closeModal);

  return(
    <div ref={ref} className={styles.modalWrapper} style={{maxWidth}}>
      {children}
    </div>
  );
}

ModalWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  handlerFunctions: PropTypes.object.isRequired
};

export default ModalWrapper;