import { React } from "react";
import * as styles from "./Home.module.css"
import pomSquare from '../../images/PomSquare.png'

const Home = () => {
  return (
    <div className={styles.home}>
      <img className={styles.logo} src={pomSquare} alt="The PomDEX.io logo" />
      <h1 className={styles.title}>PomDEX</h1>
      <p className={styles.subtitle}>Stellar Blockchain Tools</p>
    </div>
  );
}

export default Home;