import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import * as styles from "./AssetSelectorModal.module.css"
import ModalWrapper from '../ModalWrapper/ModalWrapper.js';
import ModalHeader from '../ModalHeader/ModalHeader.js';
import AssetLogo from '../../AssetLogo/AssetLogo.js';
 
const AssetSelectorModal = ({handlerFunctions, assets, onSelection}) => {
  const [searchString, setSearchString] = useState("");

  const handleSearchStringChange = (event) => {
    setSearchString(event.target.value);
  }

  const displayAssets = () => {
    const filtered = assets.filter(element => 
                       (element.asset_code.toLowerCase().includes(searchString.toLowerCase()) ||
                        element.home_domain.toLowerCase().includes(searchString.toLowerCase())) &&
                        element.asset_code !== "Liquidity Pool"
                     );
    if (filtered.length === 0) {
      return(<div>No results found</div>);
    }
    else {
      return(
        filtered.map(element => 
          <div
            className={styles.asset}
            key={`${element.asset_code}:${element.asset_issuer}`}
            onClick={() => {
              onSelection(element);
              handlerFunctions.closeModal();
            }}
          >
            <AssetLogo
              src={element.asset_logo}
              alt=''
              className={styles.logo}
            />
            <div className={styles.assetInfo}>
              <div className={styles.assetCode}>{element.asset_code}</div>
              <div className={styles.domain}>{element.home_domain}</div>
            </div>
            <div className={styles.balance}>{element.available_balance}</div>
          </div>
        )
      );
    }
  }

  useEffect(() => {
    if (!window.matchMedia("(max-width: 767px)").matches) {
      document.getElementById("assetSearch").focus();
    }
  }, []);

  return (
    <ModalWrapper handlerFunctions={handlerFunctions} maxWidth={"450px"}>
      <div className={styles.headerContainer}>
        <ModalHeader title="Select an asset" />
      </div>
      <input
          className={styles.input}
          id='assetSearch'
          name='assetSearch'
          type='text'
          placeholder='Search asset code or domain'
          autoComplete='off'
          value={searchString}
          onChange={handleSearchStringChange}
      />
      <div className={styles.assetsContainer}>
        {displayAssets()}
      </div>
    </ModalWrapper>
  )
}

AssetSelectorModal.propTypes = {
  assets: PropTypes.array.isRequired,
  onSelection: PropTypes.func.isRequired,
}
 
export default AssetSelectorModal;