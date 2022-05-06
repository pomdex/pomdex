import React, { useState, useContext, useEffect } from "react"
import useMatchMedia from "../../hooks/useMatchMedia";
import PropTypes from "prop-types"
import { AppContext } from "../../context/AppContextProvider";
import * as styles from "./Header.module.css"
import SiteLogo from '../../components/SiteLogo/SiteLogo.js';
import NavLinks from '../../components/NavLinks/NavLinks.js';
import AccountSelector from '../../components/AccountSelector/AccountSelector.js';
import UTCClock from '../../components/UTCClock/UTCClock.js';
import Hamburger from '../../components/Hamburger/Hamburger.js';
import Button from '../../components/Button/Button.js';

const Header = ({ siteTitle }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const {publicKey, setPublicKey} = useContext(AppContext);
  const isMobile = useMatchMedia("(max-width: 1100px)");

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden"
      document.body.style.height = "100%";
    }
    else {
      document.body.style.overflow = ""
      document.body.style.height = "";
    }
  }, [menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
  }, [isMobile]);

  return (
    <header className={styles.container}>
      <div className={styles.header}>
        <div className={styles.logoWrapper}>
          <SiteLogo />
          <div className={styles.clockWrapper}>
            <UTCClock />
          </div>
        </div>
        <div className={styles.navLinksWrapper}>
          <NavLinks />
        </div>
        <div className={styles.accountSelectorWrapper}>
          <AccountSelector />
        </div>
        <div className={styles.menuButtonWrapper}>
          <Hamburger menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
        </div>
      </div>
      {
        menuOpen && 
        <div className={styles.menu}>
          <NavLinks vertical onSelection={() => setMenuOpen(false)}/>
          {publicKey &&
            <div className={styles.accountSection}>
              <Button
                type='button'
                onClick={() => {
                  setPublicKey("");
                  setMenuOpen(false);
                }}
                variant='blue'
              >
                Log Out
              </Button>
            </div>
          }
        </div>
      }
    </header>
  )
}

Header.propTypes = {
  siteTitle: PropTypes.string,
}

Header.defaultProps = {
  siteTitle: ``,
}

export default Header
