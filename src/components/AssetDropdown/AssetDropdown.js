import React, { useState, useContext, useRef, useEffect } from 'react'
import { GlobalModalContext } from "../../context/GlobalModalContextProvider";
import useMatchMedia from '../../hooks/useMatchMedia';
import useOnClickOutside from '../../hooks/useOnClickOutside.js';
import PropTypes from 'prop-types'
import * as styles from "./AssetDropdown.module.css"
import AssetCard from '../AssetCard/AssetCard.js';
 
const AssetDropdown = ({ assets, assetCode, assetIssuer, 
                         homeDomain, assetLogo, onSelection }) => {
  const[isOpen, setIsOpen] = useState(false);
  const [searchString, setSearchString] = useState("");

  const { activateModal } = useContext(GlobalModalContext);
  
  const ref = useRef();
  
  const isMobile = useMatchMedia("(max-width: 767px)");

  useOnClickOutside(ref, () => {
    if (isOpen) {
      setIsOpen(false);
    }
  });

  useEffect(() => {
    if (isOpen) {
      document.getElementById("assetSearch").focus();
    }
    else {
      setSearchString("");
    }
  }, [isOpen]);

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
      return(
        <div className={styles.dropdownItems}>
          <div className={styles.noResults}>No results found</div>
        </div>
      );
    }
    else {
      return(
        <div className={styles.dropdownItems}>
          {
            filtered.map((element, index) =>
              <AssetCard
                key={`${element.asset_code}:${element.asset_issuer}`}
                assetCode={element.asset_code}
                assetIssuer={element.asset_issuer}
                homeDomain={element.home_domain}
                assetLogo={element.asset_logo}
                onSelection={() => {
                  onSelection(element);
                  setIsOpen(false);
                }}
              />
            )
          }
        </div>
      );
    }
  }

  return (
    <div className={isOpen ? styles.dropdownOpen : styles.dropdownClosed} ref={ref}>
      { 
        isOpen 
          ? <div> 
              <input
                  className={styles.input}
                  id='assetSearch'
                  name='assetSearch'
                  type='text'
                  placeholder='Search by asset code or home domain'
                  autoComplete='off'
                  value={searchString}
                  onChange={handleSearchStringChange}
              />
              {displayAssets()}
            </div>
          : <AssetCard
              assetCode={assetCode}
              assetIssuer={assetIssuer}
              homeDomain={homeDomain}
              assetLogo={assetLogo}
              onSelection={
                isMobile
                  ? () => activateModal("AssetSelectorModal", {
                      assets,
                      onSelection
                    })
                  : () => setIsOpen(true)
              }
            />
      }
    </div>
  )
}
 
AssetDropdown.propTypes = {
  assetCode: PropTypes.string,
  assetIssuer: PropTypes.string,
  homeDomain: PropTypes.string,
  assetLogo: PropTypes.string,
  onSelection: PropTypes.func.isRequired
}

export default React.memo(AssetDropdown);