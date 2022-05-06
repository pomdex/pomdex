import React, { useState, useRef, useContext, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppContext } from "../../context/AppContextProvider.js";
import { GlobalModalContext } from "../../context/GlobalModalContextProvider.js";
import useStatus from '../../hooks/useStatus.js';
import * as styles from "./AddLiquidityModule.module.css"
import ModuleCard from "../ModuleCard/ModuleCard.js"
import Button from "../Button/Button.js"
import AssetLogo from "../AssetLogo/AssetLogo.js"
import { toast } from 'react-toastify';
import { server, loadLiquidityPoolData, httpRequestInterval, loadAccountBalances,
         signTransaction, assetsMatch, isFloatUpTo7Decimals, combineWithKnownAssets,
         loadKnownAssetsArray, getAssetDomain, getAssetLogo, createAddLiquidityTx,
         createAssetFromUrlParameter, sortAssetsWithBalancesFirst,
         defaultAssetXLM, defaultAssetUSDC } 
         from '../../utils/StellarUtils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleDown, faSyncAlt } from '@fortawesome/free-solid-svg-icons'

const STATUS = {
  Loading: "Loading",
  Ready: "Ready"
};

const AddLiquidityModule = (props) => {
  const { poolAsset1, poolAsset2 } = useParams();
  const navigate = useNavigate();

  const [asset1Amount, setAsset1Amount] = useState("");
  const [asset2Amount, setAsset2Amount] = useState("");

  const [{assets, asset1, asset2}, setAssets] = useState({
    assets: [],
    asset1: defaultAssetXLM,
    asset2: defaultAssetUSDC,
  });

  const [liquidityPoolData, setLiquidityPoolData] = useState({});
  const [poolExists, setPoolExists] = useState(true);

  const [asset1Price, setAsset1Price] = useState(0);
  const [asset2Price, setAsset2Price] = useState(0);

  const [priceSpread, setPriceSpread] = useState(0.01);

  const basedOnAsset1 = useRef(true);

  const { publicKey, walletType } = useContext(AppContext);
  const { activateModal, closeModal, setModalInputData} = useContext(GlobalModalContext);
  
  const [status, setStatus] = useStatus(STATUS.Ready);

  useEffect(() => {
    const assetA = createAssetFromUrlParameter(poolAsset1);
    const assetB = createAssetFromUrlParameter(poolAsset2);

    const fetchData = async () => {
      updateAssets(publicKey, assetA, assetB);
    }

    fetchData();
    
    const timer = setInterval(() => {
      fetchData();
    }, httpRequestInterval);

    return () => {
      clearInterval(timer);
    };
  }, [publicKey, poolAsset1, poolAsset2]);

  useEffect(() => {
    const fetchData = async () => {
      updateLiquidityPoolData(asset1, asset2);
    }
    fetchData();
    
    const timer = setInterval(() => {
      fetchData();
    }, httpRequestInterval);

    return () => {
      clearInterval(timer);
    };
  }, [asset1, asset2]);
  
  useEffect(() => {
    if (basedOnAsset1.current) {
      const amount = (parseFloat(asset1Amount) * asset1Price);
      setAsset2Amount(amount ? amount.toFixed(7) : '');
    }
  }, [asset1Price, asset1Amount]);

  useEffect(() => {
    if (!basedOnAsset1.current) {
      const amount = (parseFloat(asset2Amount) * asset2Price);
      setAsset1Amount(amount ? amount.toFixed(7) : '');
    }
  }, [asset2Price, asset2Amount]);
  
  const handleAsset1Selection = (asset) => {
    if (assetsMatch(asset, asset1)) {
      return;
    }
    
    if (assetsMatch(asset, asset2)) {
      switchAsset1AndAsset2();
      return;
    }

    changeAsset1Amount("");
    changeAsset2Amount("");
    navigate(`/liquidity-pools/${asset.asset_code}:${asset.asset_issuer}/` +
             `${asset2.asset_code}:${asset2.asset_issuer}`);
  }

  const handleAsset2Selection = (asset) => {
    if (assetsMatch(asset, asset2)) {
      return;
    }

    if (assetsMatch(asset, asset1)) {
      switchAsset1AndAsset2();
      return;
    }

    changeAsset1Amount("");
    changeAsset2Amount("");
    navigate(`/liquidity-pools/${asset1.asset_code}:${asset1.asset_issuer}/` +
             `${asset.asset_code}:${asset.asset_issuer}`);
  }

  const handleAsset1AmountChange = (event) => {
    const amount = event.target.value;
    if (!isFloatUpTo7Decimals(amount) && amount !== '') {
      return;
    }
    changeAsset1Amount(amount);
  }
  
  const handleAsset2AmountChange = (event) => {
    const amount = event.target.value;
    if (!isFloatUpTo7Decimals(amount) && amount !== '') {
      return;
    }
    changeAsset2Amount(amount);
  }

  const changeAsset1Amount = (amount) => {
    basedOnAsset1.current = true;

    if (parseFloat(amount) === 0 || amount === "") {
      setAsset1Amount(amount);
      setAsset2Amount("");
      return;
    }

    setAsset1Amount(amount);
  }

  const changeAsset2Amount = (amount) => {
    basedOnAsset1.current = false;

    if (parseFloat(amount) === 0 || amount === "") {
      setAsset1Amount("");
      setAsset2Amount(amount);
      return;
    }

    setAsset2Amount(amount);
  }

  const updateLiquidityPoolData = async (asset1, asset2) =>{
    try {
      const result = await loadLiquidityPoolData(asset1, asset2);
      const reserves = result.reserves;

      const asset2Code = reserves[1].asset === 'native'
                          ? "XLM"
                          : reserves[1].asset.split(':')[0];

      let asset1Price = (parseFloat(reserves[1].amount) /
                         parseFloat(reserves[0].amount));
      let asset2Price = (parseFloat(reserves[0].amount) /
                         parseFloat(reserves[1].amount));

      if (asset1.asset_code === asset2Code) {
        [asset1Price, asset2Price] = [asset2Price, asset1Price];
        [result.reserves[0], result.reserves[1]] = [result.reserves[1], result.reserves[0]];
      }

      setLiquidityPoolData(result);
      setAsset1Price(asset1Price);
      setAsset2Price(asset2Price);
      setPoolExists(true);
    } catch (error) {
      console.error(error);

      if (error.message === "No Liquidity Pool found!") {
        setPoolExists(false);
        setAsset1Price(0);
        setAsset2Price(0);
      }
    }
  }

  const updateAssets = async (publicKey, asset1, asset2) => {
    let updatedAssets = [];
    
    try {
      if (publicKey) {
        updatedAssets = await loadAccountBalances(publicKey);
        updatedAssets = combineWithKnownAssets(updatedAssets);
        updatedAssets = sortAssetsWithBalancesFirst(updatedAssets);
      }
      else {
        updatedAssets = loadKnownAssetsArray();
      }

      let asset1Found = false;
      let asset2Found = false;

      for (const asset of updatedAssets) {
        if (assetsMatch(asset, asset1)) {
          asset1Found = true;
          asset1 = asset;
        }
        else if (assetsMatch(asset, asset2)) {
          asset2Found = true;
          asset2 = asset;
        }
      }

      if (!asset1Found) {
        asset1.home_domain = await getAssetDomain(asset1.asset_issuer);
        asset1.asset_logo = await getAssetLogo(asset1.asset_code,
                                                     asset1.asset_issuer);
      }
      
      if (!asset2Found) {
        asset2.home_domain = await getAssetDomain(asset2.asset_issuer);
        asset2.asset_logo = await getAssetLogo(asset2.asset_code,
                                                    asset2.asset_issuer);
      }

      setAssets({
        assets: updatedAssets,
        asset1,
        asset2
      });
    } catch (error) {
      console.error(error);
    }
  }

  const calculatePoolShare = () => {
    if (!liquidityPoolData.reserves ||
        !asset1Amount ||
        !asset2Amount) {
      return "0%";
    }

    for (const asset of liquidityPoolData.reserves) {
      if ((asset1.asset_code === "XLM" && asset.asset === 'native') ||
           asset1.asset_code === asset.asset.split(":")[0]) {
        return ((parseFloat(asset1Amount) / 
                (parseFloat(asset1Amount) + parseFloat(asset.amount))) * 100).toFixed(7) + '%';
      }
    }

    return "ERROR";
  }

  const submitAddLiquidity = async () => {
    if (!publicKey) {
      toast.error("Wallet not connected!");
      return;
    }
    setStatus(STATUS.Loading);
    try {
      let transaction = await createAddLiquidityTx(publicKey,
                                                   asset1,
                                                   asset1Amount,
                                                   asset2,
                                                   asset2Amount,
                                                   priceSpread);

      activateModal("SignTransactionModal");                                               
      transaction = await signTransaction(transaction, walletType, publicKey);

      setModalInputData({submitting: true});
      await server.submitTransaction(transaction);
      
      let successMessage = "Liquidity added!" // Generic success message
      
      toast.success(successMessage);
      updateAssets(publicKey, asset1, asset2);
      setAsset1Amount("");
      setAsset2Amount("");
    } catch (error) {
      toast.error("Transaction failed: " + error.message);
    }
    setStatus(STATUS.Ready);
    closeModal();
  }

  const switchAsset1AndAsset2 = () => {
    changeAsset1Amount("");
    changeAsset2Amount("");

    navigate(`/liquidity-pools/${asset2.asset_code}:${asset2.asset_issuer}/` + 
             `${asset1.asset_code}:${asset1.asset_issuer}`);
  }

  const createAddLiquidityButton = () => {
    const walletNotConnected = publicKey === "";
    const notEnoughAsset1 = parseFloat(asset1.available_balance) < parseFloat(asset1Amount);
    const notEnoughAsset2 = parseFloat(asset2.available_balance) < parseFloat(asset2Amount);
    const insufficientFunds = notEnoughAsset1 || notEnoughAsset2;
    const amountEntered = parseFloat(asset1Amount) > 0 && parseFloat(asset2Amount) > 0;
    const loading = status === STATUS.Loading;
    const loadingIcon = <FontAwesomeIcon icon={faSyncAlt} spin />

    let buttonVariant = "green";
    let buttonChild = "Add Liquidity";
    let buttonDisabled = loading ? true : false;
    let buttonFunction = loading ? () => {} : submitAddLiquidity;

    if (walletNotConnected) {
      buttonVariant = "blue";
      buttonChild = "Connect Wallet";
      buttonFunction = () => activateModal("ConnectWalletModal");
    }
    else if (!poolExists) {
      buttonVariant = "red";
      buttonChild = `No Liquidity Pool Found`;
      buttonDisabled = true;
    }
    else if (insufficientFunds || !amountEntered) {
      buttonVariant = "red";
      if (notEnoughAsset1) {
        buttonChild = `Insufficient ${asset1.asset_code} Balance`;
      }
      else if (notEnoughAsset2) {
        buttonChild = `Insufficient ${asset2.asset_code} Balance`;
      }
      else {
        buttonChild = "Enter Amount";
      }
      buttonDisabled = true;
      buttonFunction = () => {};
    }
    else if (!asset1.available_balance || !asset2.available_balance) {
      buttonVariant = "red";
      buttonChild = loadingIcon;
      buttonDisabled = true;
      buttonFunction = () => {};
    }

    if (loading) {
      buttonChild = loadingIcon;
    }

    return(
      <Button 
        type='submit'
        variant={buttonVariant}
        disabled={buttonDisabled}
        onClick={(event) => {
          event.preventDefault();
          buttonFunction();
        }}
      >
        {buttonChild}
      </Button>
    );
  }

  return(
    <ModuleCard className={styles.addLiquidityModule}>
      <p className={styles.title}>Add Liquidity</p>
      <form>
        <div className={styles.inputGrid}>
          <label htmlFor='asset1' className={styles.asset1Label}>Asset 1</label>
          <input
            className={styles.input}
            id='asset1'
            name='asset1'
            type='text'
            placeholder='0'
            autoComplete='off'
            value={asset1Amount}
            onChange={handleAsset1AmountChange}
          />
          <button
            type='button'
            className={styles.assetSelector}
            onClick={ () => activateModal("AssetSelectorModal", {
              assets: assets,
              onSelection: handleAsset1Selection
            })}
          >
            <AssetLogo src={asset1.asset_logo} alt='' className={styles.tokenLogo}/>
            <span className={styles.assetCode}>{asset1.asset_code}</span>
            <FontAwesomeIcon className={styles.downArrow} icon={faAngleDown} />
          </button>
          <div className={styles.asset1Balance}>
            <div>{"Available balance: "}</div>
            <div
              className={styles.availableBalance}
              onClick={() => changeAsset1Amount(asset1.available_balance)}
            >
              {asset1.available_balance}
            </div>
          </div>
          <label htmlFor='asset2' className={styles.asset2Label}>Asset 2</label>
          <input
            className={styles.input}
            id='asset2'
            name='asset2'
            type='text'
            placeholder='0'
            autoComplete='off'
            value={asset2Amount}
            onChange={handleAsset2AmountChange}
          />
          <button
            type='button'
            className={styles.assetSelector}
            onClick={ () => activateModal("AssetSelectorModal", {
              assets: assets,
              onSelection: handleAsset2Selection
            })}
          >
            <AssetLogo src={asset2.asset_logo} alt='' className={styles.tokenLogo}/>
            <span className={styles.assetCode}>{asset2.asset_code}</span>
            <FontAwesomeIcon className={styles.downArrow} icon={faAngleDown} />
          </button>
          <div className={styles.asset2Balance}>
            <div>{"Available balance: "}</div>
            <div
              className={styles.availableBalance}
              onClick={() => changeAsset2Amount(asset2.available_balance)}
            >
              {asset2.available_balance}
            </div>
          </div>
        </div>

        <div className={styles.buttonContainer}>
          {createAddLiquidityButton()}
        </div>

        <div className={styles.swapDetails}>
          <div className={styles.detailRow}>
            <div className={styles.priceLabel}>Price:</div>
            <div className={styles.prices}>
              <div>{`1 ${asset1.asset_code} = ${asset1Price.toFixed(7)} ${asset2.asset_code}`}</div>
              <div>{`1 ${asset2.asset_code} = ${asset2Price.toFixed(7)} ${asset1.asset_code}`}</div>
            </div>
          </div>
          <div className={styles.detailRow}>
            <div>Share of Pool:</div>
            <div>{calculatePoolShare()}</div>
          </div>
          <div className={styles.detailRow}>
            <div>Price spread allowed:</div>
            <div className={styles.priceSpreadButtonContainer}>
              <Button
                type='button'
                variant={priceSpread === 0.001 ? 'blue' : 'white'}
                onClick={() => {setPriceSpread(0.001)}}
              >
                {"0.1%"}
              </Button>
              <Button
                type='button'
                variant={priceSpread === 0.005 ? 'blue' : 'white'}
                onClick={() => {setPriceSpread(0.005)}}
              >
                {"0.5%"}
              </Button>
              <Button
                type='button'
                variant={priceSpread === 0.01 ? 'blue' : 'white'}
                onClick={() => {setPriceSpread(0.01)}}
              >
                {"1%"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </ModuleCard>
  );
}

export default AddLiquidityModule;
