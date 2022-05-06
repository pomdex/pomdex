import { React } from "react";
import * as styles from "./Swap.module.css"
import SwapModule from '../../components/SwapModule/SwapModule.js';

const Swap = () => {
  return (
    <div className={styles.swap}>
      <SwapModule />
    </div>
  );
}

export default Swap;