import { useState, useEffect, useContext } from 'react';
import { AppContext } from "../../context/AppContextProvider";
import { useParams, useNavigate } from 'react-router-dom';
import useSignal from '../../hooks/useSignal.js';
import * as styles from "./Trading.module.css"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExchangeAlt } from '@fortawesome/free-solid-svg-icons'
import AssetDropdown from '../../components/AssetDropdown/AssetDropdown.js';
import BalancesModule from '../../components/BalancesModule/BalancesModule';
import ManageOffersModule from '../../components/ManageOffersModule/ManageOffersModule';
import OrderBookModule from '../../components/OrderBookModule/OrderBookModule';
import AccountOffersModule from '../../components/AccountOffersModule/AccountOffersModule';
import RecentTradesModule from '../../components/RecentTradesModule/RecentTradesModule';
import RecentOffersModule from '../../components/RecentOffersModule/RecentOffersModule';
import { httpRequestInterval, assetsMatch, loadAccountBalances,
         createAssetFromUrlParameter, loadKnownAssetsArray, getAssetLogo, 
         combineWithKnownAssets, getAssetDomain,
         defaultAssetXLM, defaultAssetUSDC
        } from '../../utils/StellarUtils.js';

const Trading = () => {
  const { publicKey } = useContext(AppContext);

  const { baseAsset, quoteAsset } = useParams();
  const navigate = useNavigate();

  const [{assets, sellingAsset, buyingAsset}, setAssets] = useState({
    assets: [],
    sellingAsset: defaultAssetXLM,
    buyingAsset: defaultAssetUSDC,
  });
  const [currentOfferPrice, setCurrentOfferPrice] = useState("");

  const [updateSignal, emitUpdateSignal] = useSignal();

  useEffect(() => {
    const base = createAssetFromUrlParameter(baseAsset);
    const quote = createAssetFromUrlParameter(quoteAsset);

    const fetchData = async () => {
      updateAssets(publicKey, base, quote);
    }

    fetchData();
    
    const timer = setInterval(() => {
      fetchData();
    }, httpRequestInterval);

    return () => {
      clearInterval(timer);
    };
  }, [publicKey, baseAsset, quoteAsset, updateSignal]);

  const onPriceClicked = (newPrice) => {
    if (isNaN(newPrice)) {
      return;
    }
    setCurrentOfferPrice(newPrice);
  }

  const handleSellingAssetSelection = (asset) => {
    if (assetsMatch(asset, sellingAsset)) {
      return;
    }
    
    if (assetsMatch(asset, buyingAsset)) {
      switchBuyingAndSellingAssets();
      return;
    }

    navigate(`/trading/${asset.asset_code}:${asset.asset_issuer}/` +
             `${buyingAsset.asset_code}:${buyingAsset.asset_issuer}`);
  }

  const handleBuyingAssetSelection = (asset) => {
    if (assetsMatch(asset, buyingAsset)) {
      return;
    }

    if (assetsMatch(asset, sellingAsset)) {
      switchBuyingAndSellingAssets();
      return;
    }

    navigate(`/trading/${sellingAsset.asset_code}:${sellingAsset.asset_issuer}/` +
             `${asset.asset_code}:${asset.asset_issuer}`);
  }

  const updateAssets = async (publicKey, sellingAsset, buyingAsset) => {
    let updatedAssets = [];
    
    try {
      if (publicKey) {
        updatedAssets = await loadAccountBalances(publicKey);
        updatedAssets = combineWithKnownAssets(updatedAssets);
      }
      else {
        updatedAssets = loadKnownAssetsArray();
      }

      let sellingAssetFound = false;
      let buyingAssetFound = false;

      for (const asset of updatedAssets) {
        if (assetsMatch(asset, sellingAsset)) {
          sellingAssetFound = true;
          sellingAsset = asset;
        }
        else if (assetsMatch(asset, buyingAsset)) {
          buyingAssetFound = true;
          buyingAsset = asset;
        }
      }

      if (!sellingAssetFound) {
        sellingAsset.home_domain = await getAssetDomain(sellingAsset.asset_issuer);
        sellingAsset.asset_logo = await getAssetLogo(sellingAsset.asset_code,
                                                     sellingAsset.asset_issuer);
      }
      
      if (!buyingAssetFound) {
        buyingAsset.home_domain = await getAssetDomain(buyingAsset.asset_issuer);
        buyingAsset.asset_logo = await getAssetLogo(buyingAsset.asset_code,
                                                    buyingAsset.asset_issuer);
      }

      setAssets({
        assets: updatedAssets,
        sellingAsset,
        buyingAsset
      });
    } catch (error) {
      console.error(error);
    }
  }

  const switchBuyingAndSellingAssets = () => {
    navigate(`/trading/${buyingAsset.asset_code}:${buyingAsset.asset_issuer}/` + 
             `${sellingAsset.asset_code}:${sellingAsset.asset_issuer}`);
  }

  return (
    <div className={styles.trading}>
      {publicKey && <BalancesModule balances={assets}/>}

      <div className={styles.assetSelectorSection}>
        <div className={styles.dropdownWrapper}>
          <AssetDropdown
            assets={assets} 
            assetCode={sellingAsset.asset_code}
            assetIssuer={sellingAsset.asset_issuer}
            homeDomain={sellingAsset.home_domain}
            assetLogo={sellingAsset.asset_logo}
            onSelection={handleSellingAssetSelection} 
          />
        </div>
        <button
          type='button'
          className={styles.swapAssetsButton}
          onClick={switchBuyingAndSellingAssets}
        >
          <FontAwesomeIcon icon={faExchangeAlt} />
        </button>
        <div className={styles.dropdownWrapper}>
          <AssetDropdown
            assets={assets}
            assetCode={buyingAsset.asset_code}
            assetIssuer={buyingAsset.asset_issuer}
            homeDomain={buyingAsset.home_domain}
            assetLogo={buyingAsset.asset_logo}
            onSelection={handleBuyingAssetSelection} 
          />
        </div>
      </div>
      
      <ManageOffersModule 
        sellingAsset={sellingAsset}
        buyingAsset={buyingAsset}
        currentPrice={currentOfferPrice}
        emitUpdateSignal={emitUpdateSignal}
      />

      <OrderBookModule 
        sellingAssetCode={sellingAsset.asset_code}
        sellingAssetIssuer={sellingAsset.asset_issuer}
        buyingAssetCode={buyingAsset.asset_code}
        buyingAssetIssuer={buyingAsset.asset_issuer}
        onRowClicked={onPriceClicked}
      />
      
      <AccountOffersModule 
        sellingAsset={sellingAsset}
        buyingAsset={buyingAsset}
        updateSignal={updateSignal}
        emitUpdateSignal={emitUpdateSignal}
      />

      <RecentTradesModule 
        sellingAssetCode={sellingAsset.asset_code}
        sellingAssetIssuer={sellingAsset.asset_issuer}
        buyingAssetCode={buyingAsset.asset_code}
        buyingAssetIssuer={buyingAsset.asset_issuer}
      />

      <RecentOffersModule 
        sellingAssetCode={sellingAsset.asset_code}
        sellingAssetIssuer={sellingAsset.asset_issuer}
        buyingAssetCode={buyingAsset.asset_code}
        buyingAssetIssuer={buyingAsset.asset_issuer}
      />
    </div>
  );
}

export default Trading;
