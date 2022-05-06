import { React } from "react";
import * as styles from "./LiquidityPools.module.css"
import AddLiquidityModule from '../../components/AddLiquidityModule/AddLiquidityModule.js';
import LiquidityPositionsModule from '../../components/LiquidityPositionsModule/LiquidityPositionsModule.js';

const LiquidityPools = () => {
  return (
    <div className={styles.liquidityPools}>
      <AddLiquidityModule />
      <LiquidityPositionsModule />
    </div>
  );
}

export default LiquidityPools;