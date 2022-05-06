import React, { createContext, useState } from 'react'
import PropTypes from 'prop-types'
import GlobalModal from '../components/Modals/GlobalModal/GlobalModal.js';

export const GlobalModalContext = createContext({
  activateModal: (modalType, inputData) => {},
  closeModal: () => {},
  setModalInputData: (inputData, merge) => {}
});

const GlobalModalContextProvider = ({children}) => {

  const [modalType, setModalType] = useState('');
  const [active, setActive] = useState(false);
  const [inputData, setInputData] = useState({});
  const [handlerFunctions] = useState({
    activateModal: (modalType: string, inputData = {}) => {
      if (active) {
          // Only able to activate if not already active
          console.error(`Bug: Trying to create ${modalType} but a modal is already active`);
          return;
      }
      setActive(true);
      setModalType(modalType);
      setInputData(inputData);
    },

    closeModal: () => {
      setActive(false);
      setModalType('');
    },

    setModalInputData: (inputData, merge = true) => {
      if (merge)
      {
        setInputData(prevData => ({...prevData, ...inputData}));
      }
      else {
        setInputData(inputData);
      }
    },
  });

  return(
    <GlobalModalContext.Provider value={handlerFunctions}>
      <GlobalModal 
        type={modalType}
        active={active}
        inputData={inputData}
        handlerFunctions={handlerFunctions}
      />
      {children}
    </GlobalModalContext.Provider>
  );
}

GlobalModalContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
}

export default GlobalModalContextProvider