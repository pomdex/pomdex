import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import * as styles from "./ModalHeader.module.css"
import { GlobalModalContext } from "../../../context/GlobalModalContextProvider";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'

const ModalHeader = ({title}) => {
  const { closeModal } = useContext(GlobalModalContext);

  return(
    <div className={styles.modalHeader}>
      <span className={styles.title}>{title}</span>
      <button type='button' className={styles.closeButton} onClick={closeModal}>
        <FontAwesomeIcon icon={faTimes} />
      </button>
    </div>
  );
}

ModalHeader.propTypes = {
  title: PropTypes.string.isRequired
}

export default ModalHeader