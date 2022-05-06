import React, { useState, useRef, useContext, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppContext } from "../../context/AppContextProvider";
import { GlobalModalContext } from "../../context/GlobalModalContextProvider";
import useStatus from '../../hooks/useStatus.js';
import * as styles from "./SwapModule.module.css"
import ModuleCard from "../ModuleCard/ModuleCard.js"
import Button from "../Button/Button.js"
import AssetLogo from '../AssetLogo/AssetLogo';
import { toast } from 'react-toastify';
import { loadEstimatedSendAndPath, loadEstimatedReceiveAndPath, httpRequestInterval,
         loadAccountBalances, createSwapTx, server, signTransaction, combineWithKnownAssets,
         loadKnownAssetsArray, getAssetDomain, assetsMatch, isFloatUpTo7Decimals,
         getAssetLogo, createAssetFromUrlParameter, sortAssetsWithBalancesFirst,
         defaultAssetXLM, defaultAssetUSDC } 
         from '../../utils/StellarUtils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExchangeAlt, faAngleDown, faSyncAlt } from '@fortawesome/free-solid-svg-icons'

const INPUT_FETCH_DELAY = 1000 // in milliseconds
const INPUT_FETCH_INTERVAL = 10000 // in milliseconds
const STATUS = {
  Loading: "Loading",
  Ready: "Ready"
};

const SwapModule = (props) => {  
  const { swapFromAsset, swapToAsset } = useParams();
  const navigate = useNavigate();

  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");

  const [{assets, fromAsset, toAsset}, setAssets] = useState({
    assets: [],
    fromAsset: defaultAssetXLM,
    toAsset: defaultAssetUSDC
  });

  const [swapDetails, setSwapDetails] = useState({});
  const [slippageTolerance, setSlippageTolerance] = useState(0.01);

  const fetchTimeout = useRef(0);
  const fetchInterval = useRef(0);
  
  const { publicKey, walletType } = useContext(AppContext);
  const { activateModal, setModalInputData, closeModal } = useContext(GlobalModalContext);
  
  const [status, setStatus] = useStatus(STATUS.Ready);
  const swapInProgress = useRef(false);

  useEffect(() => {
    const from = createAssetFromUrlParameter(swapFromAsset);
    const to = createAssetFromUrlParameter(swapToAsset);

    const fetchData = async () => {
      updateAssets(publicKey, from, to);
    }

    fetchData();
    
    const timer = setInterval(() => {
      fetchData();
    }, httpRequestInterval);

    return () => {
      clearInterval(timer);
    };
  }, [publicKey, swapFromAsset, swapToAsset]);

  useEffect(() => {
    return () => {
      clearTimeout(fetchTimeout.current);
      clearInterval(fetchInterval.current);
    };
  }, []);

  const handleFromAssetSelection = (asset) => {
    if (assetsMatch(asset, fromAsset)) {
      return;
    }
    
    if (assetsMatch(asset, toAsset)) {
      switchFromAndToAssets();
      return;
    }

    clearAmountInputs();
    navigate(`/swap/${asset.asset_code}:${asset.asset_issuer}/` +
             `${toAsset.asset_code}:${toAsset.asset_issuer}`);
  }

  const handleToAssetSelection = (asset) => {
    if (assetsMatch(asset, toAsset)) {
      return;
    }

    if (assetsMatch(asset, fromAsset)) {
      switchFromAndToAssets();
      return;
    }

    clearAmountInputs();
    navigate(`/swap/${fromAsset.asset_code}:${fromAsset.asset_issuer}/` +
             `${asset.asset_code}:${asset.asset_issuer}`);
  }

  const handleFromAmountChange = (event) => {
    const amount = event.target.value;
    if (!isFloatUpTo7Decimals(amount) && amount !== '') {
      return;
    }
    changeFromAmount(amount);
  }
  
  const handleToAmountChange = (event) => {
    const amount = event.target.value;
    if (!isFloatUpTo7Decimals(amount) && amount !== '') {
      return;
    }
    changeToAmount(amount);
  }

  const changeFromAmount = (amount) => {
    clearTimeout(fetchTimeout.current);
    clearInterval(fetchInterval.current);

    if (parseFloat(amount) === 0 || amount === "") {
      setFromAmount(amount);
      setToAmount("");
      setStatus(STATUS.Ready);
      return;
    }

    fetchTimeout.current = setTimeout(() => {
      updateStrictSendPath(amount);
    }, INPUT_FETCH_DELAY);

    fetchInterval.current = setInterval(() => {
      updateStrictSendPath(amount);
    }, INPUT_FETCH_INTERVAL);

    setFromAmount(amount);
    setStatus(STATUS.Loading);
  }

  const changeToAmount = (amount) => {
    clearTimeout(fetchTimeout.current);
    clearInterval(fetchInterval.current);

    if (parseFloat(amount) === 0 || amount === "") {
      setToAmount(amount);
      setFromAmount("");
      setStatus(STATUS.Ready);
      return;
    }

    fetchTimeout.current = setTimeout(() => {
      updateStrictReceivePath(amount);
    }, INPUT_FETCH_DELAY);

    fetchInterval.current = setInterval(() => {
      updateStrictReceivePath(amount);
    }, INPUT_FETCH_INTERVAL);

    setToAmount(amount);
    setStatus(STATUS.Loading);
  }

  const updateStrictSendPath = async (fromAmount) =>{
    if (swapInProgress.current) {
      return;
    }

    try {
      const result = await loadEstimatedSendAndPath(
        fromAsset,
        fromAmount,
        toAsset
      );
      setToAmount(result.destination_amount);
      setSwapDetails(result);
    } catch (error) {
      toast.error(error.message);
      clearTimeout(fetchTimeout.current);
      clearInterval(fetchInterval.current);
    }
    setStatus(STATUS.Ready);
  }
  
  const updateStrictReceivePath = async (toAmount) =>{
    if (swapInProgress.current) {
      return;
    }

    try {
      const result = await loadEstimatedReceiveAndPath(
        fromAsset,
        toAsset,
        toAmount
      );
      setFromAmount(result.source_amount);
      setSwapDetails(result);
    } catch (error) {
      toast.error(error.message);
      clearTimeout(fetchTimeout.current);
      clearInterval(fetchInterval.current);
    }
    setStatus(STATUS.Ready);
  }

  const updateAssets = async (publicKey, fromAsset, toAsset) => {
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

      let fromAssetFound = false;
      let toAssetFound = false;

      for (const asset of updatedAssets) {
        if (assetsMatch(asset, fromAsset)) {
          fromAssetFound = true;
          fromAsset = asset;
        }
        else if (assetsMatch(asset, toAsset)) {
          toAssetFound = true;
          toAsset = asset;
        }
      }

      if (!fromAssetFound) {
        fromAsset.home_domain = await getAssetDomain(fromAsset.asset_issuer);
        fromAsset.asset_logo = await getAssetLogo(fromAsset.asset_code,
                                                     fromAsset.asset_issuer);
      }
      
      if (!toAssetFound) {
        toAsset.home_domain = await getAssetDomain(toAsset.asset_issuer);
        toAsset.asset_logo = await getAssetLogo(toAsset.asset_code,
                                                    toAsset.asset_issuer);
      }

      setAssets({
        assets: updatedAssets,
        fromAsset,
        toAsset
      });
    } catch (error) {
      console.error(error);
    }
  }

  const displayPrice = () => {
    const priceTop = (parseFloat(toAmount) / parseFloat(fromAmount)).toFixed(7);
    const priceBottom = (parseFloat(fromAmount) / parseFloat(toAmount)).toFixed(7);
    let priceStringTop = `1 ${fromAsset.asset_code} = ${priceTop} ${toAsset.asset_code}`;
    let priceStringBottom = `1 ${toAsset.asset_code} = ${priceBottom} ${fromAsset.asset_code}`;
    
    if (!fromAmount || !toAmount) {
      priceStringTop = `0 ${fromAsset.asset_code} = 0 ${toAsset.asset_code}`;
      priceStringBottom = `0 ${toAsset.asset_code} = 0 ${fromAsset.asset_code}`;
    }

    return(
      <div className={styles.prices}>
        <div>{priceStringTop}</div>
        <div>{priceStringBottom}</div>
      </div>
    );
  }

  const calculateMinimumReceived = () => {
    return (toAmount * (1 - slippageTolerance)).toFixed(7).toString();
  }

  const displayPath = (path) => {
    if (!path) {
      return "";
    }
    let middlePath = "";
    for (const step of path) {
      middlePath += ` > ${step.asset_type === "native"
                            ? "XLM"
                            : step.asset_code}`;
    }
    return `${fromAsset.asset_code}${middlePath} > ${toAsset.asset_code}`;
  }

  const clearAmountInputs = () => {
    setFromAmount("");
    setToAmount("");

    clearTimeout(fetchTimeout.current);
    clearInterval(fetchInterval.current);
  }

  const switchFromAndToAssets = () => {
    clearAmountInputs();

    navigate(`/swap/${toAsset.asset_code}:${toAsset.asset_issuer}/` + 
             `${fromAsset.asset_code}:${fromAsset.asset_issuer}`);
  }

  const submitSwap = async () => {
    if (!publicKey) {
      toast.error("Wallet not connected!");
      return;
    }
    setStatus(STATUS.Loading);
    swapInProgress.current = true;
    try {
      let transaction = await createSwapTx(publicKey,
                                           swapDetails,
                                           calculateMinimumReceived());
      activateModal("SignTransactionModal");   
      transaction = await signTransaction(transaction, walletType, publicKey);

      setModalInputData({submitting: true});
      const transactionResult = await server.submitTransaction(transaction);
      
      let successMessage = "Swap completed!" // Generic success message
      
      // Query Horizon for more details about the successful swap
      try {
        const ops = await server.operations()
                                .forTransaction(transactionResult.hash)
                                .call();
        const operation = ops.records[0];
        const sourceAsset = operation.source_asset_type === "native"
                              ? "XLM"
                              : operation.source_asset_code
        const destinationAsset = operation.asset_type === "native"
                                   ? "XLM"
                                   : operation.asset_code
        
        successMessage = `Swapped ${operation.source_amount} ${sourceAsset} for ${operation.amount} ${destinationAsset}`;
      } catch (error) {
        // Do nothing, just use the generic success message
      }
      
      toast.success(successMessage);
      updateAssets(publicKey, fromAsset, toAsset);
      setFromAmount("");
      setToAmount("");
      clearTimeout(fetchTimeout.current);
      clearInterval(fetchInterval.current);
    } catch (error) {
      toast.error("Transaction failed: " + error.message);
    }
    setStatus(STATUS.Ready);
    swapInProgress.current = false;
    closeModal();
  }

  const createSwapButton = () => {
    const walletNotConnected = publicKey === "";
    const insufficientFunds = parseFloat(fromAsset.available_balance) < 
                              parseFloat(fromAmount);
    const amountEntered = parseFloat(fromAmount) > 0 && parseFloat(toAmount) > 0;
    const loading = (status === STATUS.Loading);
    const loadingIcon = <FontAwesomeIcon icon={faSyncAlt} spin />

    let buttonVariant = "green";
    let buttonChild = "Swap";
    let buttonDisabled = loading ? true : false;
    let buttonFunction = loading ? () => {} : submitSwap;
    
    if (walletNotConnected) {
      buttonVariant = "blue";
      buttonChild = "Connect Wallet";
      buttonFunction = () => activateModal("ConnectWalletModal");
    }
    else if (insufficientFunds || !amountEntered) {
      buttonVariant = "red";
      buttonChild = insufficientFunds
                      ? `Insufficient ${fromAsset.asset_code} Balance`
                      : "Enter Amount";
      buttonDisabled = true;
      buttonFunction = () => {};
    }
    else if (!fromAsset.available_balance || !toAsset.available_balance) {
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
    <ModuleCard>
      <p className={styles.title}>Swap</p>
      <form>
        <div className={styles.inputGrid}>
          <label htmlFor='from' className={styles.fromLabel}>From</label>
          <input
            className={styles.input}
            id='from'
            name='from'
            type='text'
            placeholder='0'
            autoComplete='off'
            value={fromAmount}
            onChange={handleFromAmountChange}
          />
          <button 
            type='button'
            className={styles.assetSelector}
            onClick={ () => activateModal("AssetSelectorModal", {
              assets: assets,
              onSelection: handleFromAssetSelection
            })}
          >
            <AssetLogo src={fromAsset.asset_logo} alt='' className={styles.tokenLogo}/>
            <span className={styles.assetCode}>{fromAsset.asset_code}</span>
            <FontAwesomeIcon className={styles.downArrow} icon={faAngleDown} />
          </button>
          <div className={styles.fromBalance}>
            <div>{"Available balance: "}</div>
            <div
              className={styles.availableBalance}
              onClick={() => changeFromAmount(fromAsset.available_balance)}
            >
              {fromAsset.available_balance}
            </div>
          </div>
          <button
            type='button'
            className={styles.swapIcon}
            onClick={switchFromAndToAssets}
          >
            <FontAwesomeIcon icon={faExchangeAlt} rotation={90} />
          </button>
          <label htmlFor='to' className={styles.toLabel}>To (estimated)</label>
          <input
            className={styles.input}
            id='to'
            name='to'
            type='text'
            placeholder='0'
            autoComplete='off'
            value={toAmount}
            onChange={handleToAmountChange}
          />
          <button
            type='button'
            className={styles.assetSelector}
            onClick={ () => activateModal("AssetSelectorModal", {
              assets: assets,
              onSelection: handleToAssetSelection
            })}
          >
            <AssetLogo src={toAsset.asset_logo} alt='' className={styles.tokenLogo}/>
            <span className={styles.assetCode}>{toAsset.asset_code}</span>
            <FontAwesomeIcon className={styles.downArrow} icon={faAngleDown} />
          </button>
          <div className={styles.toBalance}>
            <div>{"Available balance: "}</div>
            <div
              className={styles.availableBalance}
              onClick={() => changeToAmount(toAsset.available_balance)}
            >
              {toAsset.available_balance}
            </div>
          </div>
        </div>

        <div className={styles.buttonContainer}>
          {createSwapButton()}
        </div>

        <div className={styles.swapDetails}>
          <div className={styles.detailRow}>
            <div className={styles.priceLabel}>Price:</div>
            {displayPrice()}
          </div>
          <div className={styles.detailRow}>
            <div>Minimum received:</div>
            <div>{fromAmount && toAmount && calculateMinimumReceived()}</div>
          </div>
          <div className={styles.detailRow}>
            <div>Slippage tolerance:</div>
            <div className={styles.slippageButtonContainer}>
              <Button
                type='button'
                variant={slippageTolerance === 0.001 ? 'blue' : 'white'}
                onClick={() => {setSlippageTolerance(0.001)}}
              >
                {"0.1%"}
              </Button>
              <Button
                type='button'
                variant={slippageTolerance === 0.005 ? 'blue' : 'white'}
                onClick={() => {setSlippageTolerance(0.005)}}
              >
                {"0.5%"}
              </Button>
              <Button
                type='button'
                variant={slippageTolerance === 0.01 ? 'blue' : 'white'}
                onClick={() => {setSlippageTolerance(0.01)}}
              >
                {"1%"}
              </Button>
            </div>
          </div>
          <div className={styles.detailRow}>
            <div>Path:</div>
            <div>{displayPath(swapDetails.path)}</div>
          </div>
        </div>
      </form>
    </ModuleCard>
  );
}

export default SwapModule;
