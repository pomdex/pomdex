import { React, useEffect } from "react";
import useScrollToTop from "./hooks/useScrollToTop.js";
import AppContextProvider from './context/AppContextProvider.js';
import GlobalModalContextProvider from './context/GlobalModalContextProvider.js';
import * as styles from "./App.module.css"
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Layout from './components/Layout/Layout.js';
import NotFound from './routes/NotFound/NotFound.js';
import Home from './routes/Home/Home.js';
import Trading from './routes/Trading/Trading.js';
import Swap from './routes/Swap/Swap.js';
import LiquidityPools from './routes/LiquidityPools/LiquidityPools.js';
import AquaTools from './routes/AquaTools/AquaTools.js';
import POMToken from './routes/POMToken/POMToken.js';
import { loadKnownAssetsArray, storeAssetDomain, storeAssetLogo } from "./utils/StellarUtils";

const App = () => {
  useScrollToTop();

  useEffect(() => {
    // Store known asset domains and logos in local storage
    // in case anything has changed
    for (const asset of loadKnownAssetsArray()) {
      storeAssetDomain(asset.asset_issuer, asset.home_domain);
      storeAssetLogo(asset.asset_code, asset.asset_issuer, asset.asset_logo)
    }
    
    // Preload token logos on app start
    for (const key in localStorage) {
      if (key.split(':')[0] === "logo") {
        const img = new Image();
        img.src = localStorage[key];
        window[img.src] = img;
      }
    }
  }, []);

  return (
    <div className={styles.app}>
      <AppContextProvider>
        <GlobalModalContextProvider>
          <Layout noFooter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/trading/:baseAsset/:quoteAsset" element={<Trading />} />
              <Route path="/swap/:swapFromAsset/:swapToAsset" element={<Swap />} />
              <Route path="/liquidity-pools/:poolAsset1/:poolAsset2" element={<LiquidityPools />} />
              <Route path="/aqua-tools" element={<AquaTools />} />
              <Route path="/pom-token" element={<POMToken />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
          <ToastContainer
            position="bottom-right"
            autoClose={5000}
            hideProgressBar={true}
            newestOnTop={true}
            closeOnClick
          />
        </GlobalModalContextProvider>
      </AppContextProvider>
    </div>
  );
}

export default App;