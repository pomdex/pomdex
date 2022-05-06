import React, { createContext, useState } from 'react'
import PropTypes from 'prop-types'

export const AppContext = createContext({
  publicKey: "",
  walletType: null,
  setPublicKey: (publicKey) => {},
  setWalletType: (type) => {}
});

const GlobalModalContextProvider = ({children}) => {
  const setPublicKey = (key) => {
    setAppContext(prevState => {
      return {...prevState, "publicKey": key}
    });
  }

  const setWalletType = (type) => {
    setAppContext(prevState => {
      return {...prevState, "walletType": type}
    });
  }

  const [appContext, setAppContext] = useState({
    "publicKey": "",
    "walletType": null,
    "setPublicKey": setPublicKey,
    "setWalletType": setWalletType,
  });

  return(
    <AppContext.Provider value={appContext}>
      {children}
    </AppContext.Provider>
  );
}

GlobalModalContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
}

export default GlobalModalContextProvider