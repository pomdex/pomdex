import React from 'react'
import * as styles from "./SiteLogo.module.css"
import { Link } from "react-router-dom";
import pomCircle from '../../images/PomCircle.png'

const SiteLogo = (props) => {
  return(
    <div className={styles.logoContainer}>
      <Link to="/" className={styles.link}>
        <img className={styles.logo} src={pomCircle} alt="The PomDEX.io logo" />
        {"PomDEX"}
      </Link>
    </div>
  );
}

export default SiteLogo