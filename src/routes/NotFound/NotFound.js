import { React } from "react";
import * as styles from "./NotFound.module.css"
import pomSquare from '../../images/PomSquare.png'

const NotFound = () => {
  return (
    <div className={styles.notFound}>
      <img className={styles.logo} src={pomSquare} alt="The PomDEX.io logo" />
      <p className={styles.title}>Ruh Roh!</p>
      <p className={styles.subtitle}>404 - Page Not Found</p>
    </div>
  );
}

export default NotFound;