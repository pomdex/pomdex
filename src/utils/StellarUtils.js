import Transport from "@ledgerhq/hw-transport-webhid";
import Str from "@ledgerhq/hw-app-str";
import freighterApi from "@stellar/freighter-api";
import albedo from '@albedo-link/intent'
import createStellarIdenticon from './stellar-identicon.js';
import { knownAssets } from '../data/knownAssets.js';
import fallbackImage from '../images/tokens/fallback.png'

const StellarSDK = require('stellar-sdk');
const axios = require('axios').default;

//-----------------------------------------------------------------------------
// Constants

export const usePublicNetwork = true;

// Public Stellar.org Horizon instance
export const server = new StellarSDK.Server(
  usePublicNetwork 
    ? 'https://horizon.stellar.org'
    : 'https://horizon-testnet.stellar.org'
);

export const networkPassphrase = usePublicNetwork
                                   ? StellarSDK.Networks.PUBLIC
                                   : StellarSDK.Networks.TESTNET;

export const httpRequestInterval = 5000; // in milliseconds
export const fee = 100000; // MAXIMUM transaction fee (100000 is 0.01 XLM)
export const transactionTimeout = 60; // in seconds
export const baseReserve = 0.5;
export const accountMinimumMultiplier = 2;
export const platformReserve = 2;

export const WALLET_TYPE = {
  Albedo: "Albedo",
  Freighter: "Freighter",
  Ledger: "Ledger",
  Local: "Local",
  Rabet: "Rabet",
  WalletConnect: "WalletConnect",
  xBull: "xBull"
}

export const ORDER_BOOK_SIDE = {
  Buy: "Buy",
  Sell: "Sell",
}

//-----------------------------------------------------------------------------
// Default Assets

export const defaultAssetXLM = {
  asset_code: "XLM",
  asset_issuer: "native",
  home_domain: "stellar.org",
  asset_logo: knownAssets["native"]["XLM"],
}

export const defaultAssetUSDC = {
  asset_code: "USDC",
  asset_issuer: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",
  home_domain: "centre.io",
  asset_logo: knownAssets["GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN"]["USDC"]
}

export const defaultAssetAQUA = {
  asset_code: "AQUA",
  asset_issuer: "GBNZILSTVQZ4R7IKQDGHYGY2QXL5QOFJYQMXPKWRRM5PAV7Y4M67AQUA",
  home_domain: "aqua.network",
  asset_logo: knownAssets["GBNZILSTVQZ4R7IKQDGHYGY2QXL5QOFJYQMXPKWRRM5PAV7Y4M67AQUA"]["AQUA"]
}

//-----------------------------------------------------------------------------
// Utility functions

export const isXLM = (asset) => {
  return asset.asset_type === "native" ||
         asset.asset_issuer === "native" ||
         asset.asset_issuer === "native lumens";
}

export const isLiquidityPool = (balance) => {
  return balance.asset_type === "liquidity_pool_shares";
}
  
export const prepareAsset = (asset) => {
  if (asset instanceof StellarSDK.Asset) {
    return asset;
  }

  return isXLM(asset)
            ? new StellarSDK.Asset.native()
            : new StellarSDK.Asset(asset.asset_code, asset.asset_issuer)
}

/// Returns the given asset pair in "protocol order."
export const orderAssets = (asset1, asset2) => {
  return (StellarSDK.Asset.compare(asset1, asset2) <= 0) 
            ? [asset1, asset2]
            : [asset2, asset1];
}

export const assetsMatch = (asset1, asset2) => {
  if (isXLM(asset1)) {
    return isXLM(asset1) && isXLM(asset2);
  }
  else  {
    return asset1.asset_code === asset2.asset_code && 
           asset1.asset_issuer === asset2.asset_issuer
  }
}

export const isFloatUpTo7Decimals = (inputString) => {
  const regex = /^(\d+(\.\d{0,7})?|\.?\d{1,7})$/;
  return regex.test(inputString)
}

export const printTransactionResponse = (transactionResponse) => {
  console.log( StellarSDK.xdr.TransactionEnvelope.fromXDR(
    transactionResponse.envelope_xdr, 'base64') );
  console.log( StellarSDK.xdr.TransactionResult.fromXDR(
    transactionResponse.result_xdr, 'base64') );
  console.log( StellarSDK.xdr.TransactionMeta.fromXDR(
    transactionResponse.result_meta_xdr, 'base64') );
};

export const generateIdenticon = (publicKey) => {
  const canvas = createStellarIdenticon(publicKey);
  return canvas.toDataURL() // data URI containing a generated icon in PNG format
}

export const shortenPublicKey = (publicKey, numberOfCharacters = 4, numberOfDots = 3) => {
  let ellipsis = "";
  for (let dots = 0; dots < numberOfDots; ++dots) {
    ellipsis += '.';
  }

  return publicKey.slice(0, numberOfCharacters) + ellipsis +
         publicKey.slice(-numberOfCharacters);
}

/**
 * @param {string} price - The price
 * @param {string} suffix - The price suffix
 * @returns {string} The price with suffix added on
 */
export const addSuffixToPrice = (price, suffix) => {
  if (price === "") {
    return price;
  }

  const decimalIndex = price.indexOf('.');
  const noDecimal = decimalIndex === -1;
  const digitsAfterDecimal = noDecimal
                               ? 0
                               : price.length - decimalIndex - 1;

  // Add trailing zeros to 7 decimal places if necessary
  if (digitsAfterDecimal < 7 && suffix !== "") {
    price = parseFloat(price).toFixed(7);
  }

  if (noDecimal) {
    return price + suffix;
  }

  return price.slice(0, decimalIndex + 8) + suffix;
}

export const formatDateUTC = (dateString) => {
  const date = new Date(dateString);
  const day = date.getUTCMonth() + 1;
  const month = date.getUTCDate();
  const year = date.getUTCFullYear();

  let hours = date.getUTCHours();
  let minutes = date.getUTCMinutes();
  let seconds = date.getUTCSeconds();
  
  hours = hours < 10 ? '0' + hours : hours;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  seconds = seconds < 10 ? '0' + seconds : seconds;

  const time = hours + ":" + minutes + ":" + seconds;

  return `${day}/${month}/${year} ${time}`;
}

export const isCurrentHour = (timeString) => {
  const date = new Date(timeString);
  let hour = date.getUTCHours();

  const currentHour = new Date().getUTCHours();

  return hour === currentHour;
}

export const formatTime = (timeString) => {
  const date = new Date(timeString);
  let hours = date.getUTCHours();
  let minutes = date.getUTCMinutes();
  let seconds = date.getUTCSeconds();
  
  hours = hours < 10 ? '0' + hours : hours;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  seconds = seconds < 10 ? '0' + seconds : seconds;

  return hours + ":" + minutes + ":" + seconds;
}

export const createAsset = (assetCode, assetIssuer) => {
  return {
    asset_code: assetCode,
    asset_issuer: assetIssuer
  }
}

export const createAssetFromUrlParameter = (urlParameter) => {
  return {
    asset_code: urlParameter.split(':')[0],
    asset_issuer: urlParameter.split(':')[1]
  }
}

export const loadKnownAssetsArray = () => {
  let newArray = [];

  for (const key in knownAssets) {
    if (key === "native") {
      continue;
    }

    const tempObject = {...knownAssets[key]};
    
    for (const subKey in tempObject) {
      if (subKey === "home_domain") {
        continue;
      }
      
      const asset = {};
      asset.asset_code = subKey;
      asset.asset_issuer = key;
      asset.home_domain = knownAssets[key].home_domain;
      asset.asset_logo = knownAssets[key][subKey];

      newArray.push(asset);
    }
  }

  newArray.sort((a, b) => 
    a.asset_code.localeCompare(b.asset_code) || 
    a.asset_issuer.localeCompare(b.asset_issuer)
  );

  newArray.unshift({
    asset_code: "XLM",
    asset_issuer: "native",
    home_domain: knownAssets["native"].home_domain,
    asset_logo: knownAssets["native"]["XLM"]
  });

  return newArray;
}

export const combineWithKnownAssets = (balancesArray) => {
  const combinedArray = [...balancesArray];
  let existingAssets = new Set();

  for (const balance of combinedArray) {
    existingAssets.add(`${balance.asset_code}:${balance.asset_issuer}`);
  }
  
  const known = loadKnownAssetsArray();
  for (const asset of known) {
    if (!existingAssets.has(`${asset.asset_code}:${asset.asset_issuer}`)) {
      combinedArray.push(asset);
    }
  }
  
  return combinedArray;
}

export const sortAssetsWithBalancesFirst = (balancesArray) => {
  let hasBalance = [];
  let noBalance = [];

  for (const element of balancesArray) {
    if (parseFloat(element.balance) > 0) {
      hasBalance.push(element);
    }
    else {
      noBalance.push(element);
    }
  }

  return [...hasBalance, ...noBalance];
}

export const getAssetDomain = async (assetIssuer) => {
  const key = `domain:${assetIssuer}`;

  // Try to lookup domain locally
  if (key in localStorage) {
    return localStorage.getItem(key);
  }
  else {
    // Try to lookup domain on Horizon
    try {
      const account = await server.loadAccount(assetIssuer);
      const domain = account.home_domain;

      // Store the domain in localStorage if found
      if (domain) {
        storeAssetDomain(assetIssuer, domain);
        return domain;
      }
    } catch (error) {
      console.error(error.message);
    }
  }
  return "unknown";
}

export const storeAssetDomain = (assetIssuer, domain) => {
  if (!assetIssuer || !domain) {
    console.error("Could not store asset domain!");
    return;
  }

  localStorage.setItem(`domain:${assetIssuer}`, domain);
}

export const getAssetLogo = async (assetCode, assetIssuer) => {
  const key = `logo:${assetCode}:${assetIssuer}`

  // Try to lookup logo locally
  if (key in localStorage) {
    return localStorage.getItem(key);
  }
  else {
    // Try to lookup domain on with Toml resolver
    try {
      const assetToml = await loadTomlForAsset(assetIssuer, assetCode)
      const logo = assetToml.image;

      // Store the logo in localStorage if found
      if (logo) {
        storeAssetLogo(assetCode, assetIssuer, logo);
        return logo;
      }
    } catch (error) {
      return fallbackImage;
    }
  }
  return fallbackImage;
}

export const storeAssetLogo = (assetCode, assetIssuer, assetLogo) => {
  if (!assetCode || !assetIssuer || !assetLogo ) {
    console.error("Could not store asset logo!");
    return;
  }

  localStorage.setItem(`logo:${assetCode}:${assetIssuer}`, assetLogo);
}

export const getLiquidityPoolIDFromPoolAsset = (poolAsset) => {
  return StellarSDK.getLiquidityPoolId(
    "constant_product",
    poolAsset.getLiquidityPoolParameters()
  ).toString("hex");
}

export const getLiquidityPoolIDFromAssets = (asset1, asset2) => {
  const [ assetA, assetB ] = orderAssets(prepareAsset(asset1), prepareAsset(asset2));

  const poolAsset = new StellarSDK.LiquidityPoolAsset(assetA,
                                                      assetB,
                                                      StellarSDK.LiquidityPoolFeeV18);

  return StellarSDK.getLiquidityPoolId(
    "constant_product",
    poolAsset.getLiquidityPoolParameters()
  ).toString("hex");
}

export const getLiquidityPoolPercentage = (liquidityPosition) => {
  const poolShare = parseFloat(liquidityPosition.balance) /
                    parseFloat(liquidityPosition.total_shares);

  const poolPercentage = poolShare * 100;

  return poolPercentage < 0.01 
           ? "< 0.01%"
           : `${poolPercentage.toFixed(2)}%`;
}

//-----------------------------------------------------------------------------
// Ledger/Keypair functions

export const getLocalPublicKey = () => {
  return StellarSDK.Keypair.fromSecret(
                              usePublicNetwork
                              ? process.env.REACT_APP_SECRET_KEY
                              : process.env.REACT_APP_TESTNET_SECRET_KEY
                            )
                            .publicKey();
};

export const getLedgerPublicKey = async () => {
  const transport = await Transport.create();
  const str = new Str(transport);
  const result = await str.getPublicKey("44'/148'/0'");
  transport.close();

  // Handle Ledger SDK bug where this account key is returned if
  // user is not signed in to the Ledger App
  if (result.publicKey ===
    "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF") {
      throw new Error("Please make sure Ledger is unlocked and " +
                      "the Stellar app is open!");
    }

  return result.publicKey;
};

export const signTransactionLocally = (transaction) => {
  transaction.sign(StellarSDK.Keypair.fromSecret(
    usePublicNetwork
      ? process.env.REACT_APP_SECRET_KEY
      : process.env.REACT_APP_TESTNET_SECRET_KEY
  ));
  return transaction;
}

export const signTransactionWithLedger = async (transaction, publicKey) => {
  const transport = await Transport.create();
  try {
    const str = new Str(transport);
    const result = await str.signTransaction("44'/148'/0'", transaction.signatureBase());
    
    // add signature to transaction
    const keyPair = StellarSDK.Keypair.fromPublicKey(publicKey);
    const hint = keyPair.signatureHint();
    const decorated = new StellarSDK.xdr.DecoratedSignature({hint: hint, signature: result.signature});
    transaction.signatures.push(decorated);
    
    transport.close();
    return transaction;
  }
  catch(error) {
    transport.close();
    throw(error);
  }
}

export const signTransaction = async (transaction, walletType, publicKey) => {
  switch (walletType) {
    case WALLET_TYPE.Albedo:
      {
        const result = await albedo.tx({
          xdr: transaction.toXDR(),
          pubkey: publicKey,
          network: networkPassphrase === StellarSDK.Networks.PUBLIC
                     ? "public"
                     : "testnet"
        });
        const envelope = StellarSDK.xdr.TransactionEnvelope.fromXDR(
          result.signed_envelope_xdr,
          'base64'
        );
        return new StellarSDK.Transaction(envelope, networkPassphrase);
      }
    case WALLET_TYPE.Freighter:
      {
        const result = await freighterApi.signTransaction(
          transaction.toXDR(),
          networkPassphrase === StellarSDK.Networks.PUBLIC
            ? "PUBLIC"
            : "TESTNET"
        );
        const transactionToSubmit = StellarSDK.TransactionBuilder.fromXDR( 
          result,
          networkPassphrase
        );
        return transactionToSubmit;
      }
    case WALLET_TYPE.Ledger:
      await signTransactionWithLedger(transaction, publicKey);
      break;
    case WALLET_TYPE.Local:
      signTransactionLocally(transaction);
      break;
    case WALLET_TYPE.Rabet:
      {
        const result = await window.rabet.sign(transaction.toXDR(), networkPassphrase);
        const envelope = StellarSDK.xdr.TransactionEnvelope.fromXDR(result.xdr, 'base64');
        return new StellarSDK.Transaction(envelope, networkPassphrase);
      }
    default:
      throw new Error("Invalid Wallet type!");
  }
  return transaction;
}

//-----------------------------------------------------------------------------
// Horizon HTTP request functions

export const loadAccountBalances = async (publicKey, 
                                          includeLiquidityPoolShares = true,
                                          XLMfirst = true) => {
  const account = await server.loadAccount(publicKey);
  const reservedXLM = (baseReserve * (accountMinimumMultiplier + account.subentry_count)) +
                       platformReserve;
  
  let balances = [...account.balances];

  for (let index = 0; index < balances.length; index++) {
    const element = balances[index];
    const isNativeXLM = isXLM(element);

    element.available_balance =
      (parseFloat(element.balance) - parseFloat(element.selling_liabilities)).toFixed(7);
    
    // Look up domain or fetch from server
    if (isNativeXLM) {
      element.available_balance = (element.available_balance - reservedXLM).toFixed(7);
      element.available_balance = element.available_balance > 0
                                    ? element.available_balance
                                    : (0).toFixed(7);
      element.asset_code = "XLM";
      element.asset_issuer = "native";
      element.home_domain = await getAssetDomain("native")
      element.asset_logo = await getAssetLogo("XLM", "native")
    }
    else if (isLiquidityPool(element)) {
      const domainString = "Pool ID: " + element.liquidity_pool_id.slice(0, 5) +
                            "..." + element.liquidity_pool_id.slice(-4);

      element.home_domain = domainString;
      element.asset_code = "Liquidity Pool";
      element.available_balance = "pool shares";
    }
    else {
      element.home_domain = await getAssetDomain(element.asset_issuer);
      element.asset_logo = await getAssetLogo(element.asset_code, element.asset_issuer);
    }
  }
  
  if (!includeLiquidityPoolShares) {
    balances = balances.filter(element => !isLiquidityPool(element));
  }
  
  if (XLMfirst) {
    // Move XLM to the front of the array
    balances.unshift(balances.pop());
  }

  return balances;
}

export const loadTradesByOffer = async (offerID) => {
  const trades = await server.trades()
                             .forOffer(offerID)
                             .limit(200)
                             .call();
  return trades;
}

export const loadTransactions = async (publicKey) => {
  const transactions = await server.transactions()
                                   .forAccount(publicKey)
                                   .order("desc")
                                   .limit(200)
                                   .call();
  return transactions;
}

export const loadOperations = async (publicKey) => {
  const operations = await server.operations()
                                 .forAccount(publicKey)
                                 .order("desc")
                                 .limit(200)
                                 .join("transactions")
                                 .call();
  return operations;
}

export const loadOrderBook = async (sellingAsset, buyingAsset) => {
  const orders = await server.orderbook(prepareAsset(sellingAsset),
                                        prepareAsset(buyingAsset)).call();
  return orders;
}

export const loadOffersForAccount = async (publicKey, sellingAsset, buyingAsset) => {
  const offers = await server.offers().forAccount(publicKey).limit(200).call();
  const records = offers.records;

  const buyOffers = records.filter(element => {
    return assetsMatch(element.buying, sellingAsset) &&
            assetsMatch(element.selling, buyingAsset);
  });
          
  const sellOffers = records.filter(element => {
    return assetsMatch(element.buying, buyingAsset) &&
            assetsMatch(element.selling, sellingAsset);
  });
        
  return {buyOffers, sellOffers};
}

export const loadRecentTrades = async (sellingAsset, buyingAsset) => {
  const recentTrades = await server.trades()
                                   .forAssetPair(prepareAsset(sellingAsset),
                                                 prepareAsset(buyingAsset))
                                   .order("desc")
                                   .limit(200)
                                   .join("transactions")
                                   .call();
  return recentTrades.records;
}

export const loadRecentOffers = async (sellingAsset, buyingAsset) => {
  const recentBuyOffers = await server.offers()
                                      .buying(prepareAsset(sellingAsset))
                                      .selling(prepareAsset(buyingAsset))
                                      .order("desc")
                                      
                                      .limit(200)
                                      .call();

  const recentSellOffers = await server.offers()
                                       .buying(prepareAsset(buyingAsset))
                                       .selling(prepareAsset(sellingAsset))
                                       .order("desc")
                                       .limit(200)
                                       .call();

  const buyOffers = recentBuyOffers.records;
  const sellOffers = recentSellOffers.records;

  return {buyOffers, sellOffers};
}

export const loadClaimableBalances = async (publicKey) => {
  const claimableBalances = await server.claimableBalances()
                                        .claimant(publicKey)
                                        .order("desc")
                                        .limit(200)
                                        .call();
  return claimableBalances.records;
}

export const loadTomlForAsset = async (assetIssuer, assetCode) => {
  const account = await server.accounts()
                              .accountId(assetIssuer)
                              .call();

  const toml = await StellarSDK.StellarTomlResolver.resolve(account.home_domain);

  let assetToml;
  for (const currency of toml.CURRENCIES) {
    if (currency.code === assetCode) {
      assetToml = currency;
      break;
    }
  }

  return assetToml;
}

export const printTomlForDomain = async (domain) => {
  console.log(await StellarSDK.StellarTomlResolver.resolve(domain));
}

export const loadEstimatedSendAndPath = async (sourceAsset, 
                                               sourceAmount,
                                               destinationAsset) => {
  const result = await server.strictSendPaths(
    prepareAsset(sourceAsset),
    sourceAmount,
    [prepareAsset(destinationAsset)]
  ).call();
  
  if (result.records.length === 0) {
    throw new Error("No available swap paths found!");
  }

  const bestPath = result.records[0];
  return bestPath;                                              
}

export const loadEstimatedReceiveAndPath = async (sourceAsset,
                                                  destinationAsset,
                                                  destinationAmount) => {
  const result = await server.strictReceivePaths(
    [prepareAsset(sourceAsset)],
    prepareAsset(destinationAsset),
    destinationAmount
  ).call();
  
  if (result.records.length === 0) {
    throw new Error("No available swap paths found!");
  }

  const bestPath = result.records[0];
  return bestPath; 
}

export const loadLiquidityPoolData = async (asset1, asset2) => {
  const result = await server.liquidityPools()
                             .forAssets([prepareAsset(asset1), prepareAsset(asset2)])
                             .limit("200")
                             .call()
                             
  if (result.records.length === 0) {
    throw new Error("No Liquidity Pool found!");
  }

  const poolData = result.records[0];
  return poolData; 
}

export const loadLiquidityPoolBalances = async (publicKey) => {
  const balances = await loadAccountBalances(publicKey);
  return balances.filter(element => element.asset_type === "liquidity_pool_shares");
}

export const loadLiquidityPoolsForAccount = async (publicKey) => {
  const pools = await server.liquidityPools()
                            .forAccount(publicKey)
                            .limit(200)
                            .call();
  return pools.records;
}

export const loadAccountLiquidityPositions = async (publicKey) => {
  const poolBalances = await loadLiquidityPoolBalances(publicKey);

  // Convert to a lookup table
  const poolBalancesObject = {};
  for (const element of poolBalances) {
    poolBalancesObject[element.liquidity_pool_id] = {...element};
  }

  const pools = await loadLiquidityPoolsForAccount(publicKey);
  
  // Add balances to a pool data, plus other fields to make display easier
  for (const element of pools) {
    element.balance = poolBalancesObject[element.id].balance;
    element.poolPercentage = getLiquidityPoolPercentage(element);
    
    const shareOfPool = parseFloat(element.balance) /
                        parseFloat(element.total_shares);

    const isNativeAssetA = element.reserves[0].asset === "native";
    element.assetA_code = isNativeAssetA
                            ? "XLM"
                            : element.reserves[0].asset.split(':')[0];
    element.assetA_issuer = isNativeAssetA
                              ? "native"
                              : element.reserves[0].asset.split(':')[1];
    element.assetA_balance = (parseFloat(element.reserves[0].amount) *
                              shareOfPool).toFixed(8).slice(0, -1);
    element.assetA_domain = await getAssetDomain(element.assetA_issuer);
    element.assetA_logo = await getAssetLogo(element.assetA_code,
                                             element.assetA_issuer);

    const isNativeAssetB = element.reserves[1].asset === "native";                          
    element.assetB_code = isNativeAssetB
                            ? "XLM"
                            : element.reserves[1].asset.split(':')[0];
    element.assetB_issuer = isNativeAssetB
                              ? "native"
                              : element.reserves[1].asset.split(':')[1];
    element.assetB_balance = (parseFloat(element.reserves[1].amount) *
                              shareOfPool).toFixed(8).slice(0, -1);
    element.assetB_domain = await getAssetDomain(element.assetB_issuer);
    element.assetB_logo = await getAssetLogo(element.assetB_code,
                                             element.assetB_issuer);
  }

  return pools;
}

//-----------------------------------------------------------------------------
// Horizon stream functions

export const streamOrderBook = async (sellingAsset, buyingAsset,
                                      handleMessage, handleError) => {
  const endStream = await server.orderbook(prepareAsset(sellingAsset),
                                           prepareAsset(buyingAsset))
                                .stream({
                                  onmessage: orders => handleMessage(orders),
                                  onerror: error => handleError(error)
                                });
  return endStream;
}

export const streamOffersForAccount = async (publicKey, sellingAsset, buyingAsset,
                                             handleMessage, handleError) => {
  const endStream = await server.offers()
                                .forAccount(publicKey)
                                .limit(200)
                                .stream({
                                  onmessage: offers => handleMessage(offers),
                                  onerror: error => handleError(error)
                                });
  return endStream;
}

export const streamRecentTrades = async (sellingAsset, buyingAsset, handleMessage) => {
  const endStream = await server.trades()
                                .forAssetPair(prepareAsset(sellingAsset),
                                              prepareAsset(buyingAsset))
                                .cursor("now")
                                .stream({
                                  onmessage: trades => handleMessage(trades),
                                  onerror: error => { throw(error); }
                                });
  return endStream;
}

//-----------------------------------------------------------------------------
// Horizon transaction functions

export const createManageBuyOfferTx = async (publicKey, sellingAsset, buyingAsset,
                                             amount, price, offerId = 0) => {
  const account = await server.loadAccount(publicKey);

  return new StellarSDK.TransactionBuilder(account, {
      fee,
      networkPassphrase
    })
    .addOperation(StellarSDK.Operation.manageBuyOffer({
      buying: prepareAsset(sellingAsset),
      selling: prepareAsset(buyingAsset),
      buyAmount: amount,
      price: price,
      offerId: offerId
    }))
    .setTimeout(transactionTimeout) // in seconds
    .build();
}

export const createManageSellOfferTx = async (publicKey, sellingAsset, buyingAsset,
                                              amount, price, offerId = 0) => {
  const account = await server.loadAccount(publicKey);

  return new StellarSDK.TransactionBuilder(account, {
      fee,
      networkPassphrase
    })
    .addOperation(StellarSDK.Operation.manageSellOffer({
      selling: prepareAsset(sellingAsset),
      buying: prepareAsset(buyingAsset),
      amount: amount,
      price: price,
      offerId: offerId
    }))
    .setTimeout(transactionTimeout) // in seconds
    .build();
}

export const createSimultaneousBuyAndSellOfferTx =
               async (publicKey, sellingAsset, sellAmount,
                      sellPrice, buyingAsset, buyAmount, buyPrice, 
                      sellOfferId = 0, buyOfferId = 0) => {
  
  const account = await server.loadAccount(publicKey);

  return new StellarSDK.TransactionBuilder(account, {
    fee,
    networkPassphrase
  })
  .addOperation(StellarSDK.Operation.manageBuyOffer({
    buying: prepareAsset(sellingAsset),
    selling: prepareAsset(buyingAsset),
    buyAmount: buyAmount,
    price: buyPrice,
    offerId: buyOfferId
  }))
  .addOperation(StellarSDK.Operation.manageSellOffer({
    selling: prepareAsset(sellingAsset),
    buying: prepareAsset(buyingAsset),
    amount: sellAmount,
    price: sellPrice,
    offerId: sellOfferId
  }))
  .setTimeout(transactionTimeout) // in seconds
  .build();
}

export const createCancelOfferTx = async (publicKey, sellingAsset,
                                          buyingAsset, offerId) => {
  const account = await server.loadAccount(publicKey);
    
  return new StellarSDK.TransactionBuilder(account, {
    fee,
    networkPassphrase
  })
  // Doesn't matter if we send a Buy or Sell Transaction if amount is 0
  .addOperation(StellarSDK.Operation.manageBuyOffer({
    selling: prepareAsset(sellingAsset),
    buying: prepareAsset(buyingAsset),
    buyAmount: "0",
    price: "0.00000001",
    offerId: offerId
  }))
  .setTimeout(transactionTimeout) // in seconds
  .build();
}

export const createCancelAllOffersForPairTx = async (publicKey, sellingAsset, buyingAsset) => {
  const offers = await server.offers().forAccount(publicKey).limit(200).call();
  const records = offers.records;

  const offersToCancel = records.filter(element => 
    (assetsMatch(element.buying, buyingAsset) &&
     assetsMatch(element.selling, sellingAsset)) ||
    (assetsMatch(element.buying, sellingAsset) &&
     assetsMatch(element.selling, buyingAsset))
  );

  if (offersToCancel.length === 0) {
    throw new Error("There are no offers to cancel!");
  }

  const account = await server.loadAccount(publicKey);

  let transaction = new StellarSDK.TransactionBuilder(account, {
      fee,
      networkPassphrase
  });

  offersToCancel.forEach(async element => {
    transaction = transaction.addOperation(StellarSDK.Operation.manageBuyOffer({
      selling: prepareAsset(sellingAsset),
      buying: prepareAsset(buyingAsset),
      buyAmount: "0",
      price: "0.00000001",
      offerId: element.id
    }));
  });

  return transaction.setTimeout(transactionTimeout).build(); // timeout is in seconds
}

export const createCancelOffersOnSideTx = async (publicKey, sellingAsset,
                                                 buyingAsset, isBuySide) => {
  if (isBuySide !== true &&
      isBuySide !== false) {
    throw new Error("No order book side specified!");
  }

  const offers = await server.offers().forAccount(publicKey).limit(200).call();
  const records = offers.records;

  let offersToCancel = [];

  if (isBuySide) {
    offersToCancel = records.filter(element => 
      assetsMatch(element.buying, sellingAsset) &&
      assetsMatch(element.selling, buyingAsset)
    );
  }
  else {
    offersToCancel = records.filter(element => 
      assetsMatch(element.buying, buyingAsset) &&
      assetsMatch(element.selling, sellingAsset)
    );
  }

  if (offersToCancel.length === 0) {
    throw new Error("There are no offers to cancel!");
  }

  const account = await server.loadAccount(publicKey);

  let transaction = new StellarSDK.TransactionBuilder(account, {
      fee,
      networkPassphrase
  });

  offersToCancel.forEach(async element => {
    transaction = transaction.addOperation(StellarSDK.Operation.manageBuyOffer({
      selling: prepareAsset(sellingAsset),
      buying: prepareAsset(buyingAsset),
      buyAmount: "0",
      price: "0.00000001",
      offerId: element.id
    }));
  });

  return transaction.setTimeout(transactionTimeout).build(); // timeout is in seconds
}

export const createClaimClaimableBalanceTx = async (publicKey, balanceId) => {
  const account = await server.loadAccount(publicKey);

  const transaction = new StellarSDK.TransactionBuilder(account, {
      fee,
      networkPassphrase
    })
    .addOperation(StellarSDK.Operation.claimClaimableBalance({balanceId}))
    .setTimeout(transactionTimeout) // in seconds
    .build();

  return transaction;
}

export const createSwapTx = async (publicKey, swapDetails, minReceived, createTrustline = false) => {
  if (!minReceived) {
    throw new Error("No minimum receive amount specified!");
  }

  const account = await server.loadAccount(publicKey);

  let transaction = new StellarSDK.TransactionBuilder(account, {
    fee,
    networkPassphrase: StellarSDK.Networks.PUBLIC,
  });

  const sendAsset = {
    asset_code: swapDetails.source_asset_code,
    asset_issuer: swapDetails.source_asset_issuer,
    asset_type: swapDetails.source_asset_type
  }

  const destinationAsset = {
    asset_code: swapDetails.destination_asset_code,
    asset_issuer: swapDetails.destination_asset_issuer,
    asset_type: swapDetails.destination_asset_type,
  }

  const path = swapDetails.path.map(element => prepareAsset(element));

  transaction = transaction
    .addOperation(
      StellarSDK.Operation.pathPaymentStrictSend({
        sendAsset: prepareAsset(sendAsset),
        sendAmount: swapDetails.source_amount,
        destination: publicKey,
        destAsset: prepareAsset(destinationAsset),
        destMin: minReceived,
        path,
      }),
    )
    .setTimeout(transactionTimeout)
    .build();

  return transaction;
}

export const createAddLiquidityTx = async (publicKey,
                                           asset1,
                                           maxReserve1,
                                           asset2,
                                           maxReserve2,
                                           priceSpreadAllowed) => {
  if (!priceSpreadAllowed) {
    throw new Error("No price spread specified!");
  }

  const [ assetA, assetB ] = orderAssets(prepareAsset(asset1), prepareAsset(asset2));

  const poolAsset = new StellarSDK.LiquidityPoolAsset(assetA,
                                                      assetB,
                                                      StellarSDK.LiquidityPoolFeeV18);

  const poolID = getLiquidityPoolIDFromPoolAsset(poolAsset);

  // Swap maxReserves if orderAssets() function reordered our assets
  if (assetA.code === asset2.asset_code ||
      assetB.code === asset1.asset_code) {
    [maxReserve1, maxReserve2] = [maxReserve2, maxReserve1];
  }

  const exactPrice = maxReserve1 / maxReserve2;
  const minPrice = exactPrice - (exactPrice * priceSpreadAllowed);
  const maxPrice = exactPrice + (exactPrice * priceSpreadAllowed);

  // Begin transaction
  const account = await server.loadAccount(publicKey);

  const transaction = new StellarSDK.TransactionBuilder(account, {
      fee,
      networkPassphrase,
      withMuxing: true
    })
    .addOperation(StellarSDK.Operation.changeTrust({
      asset: poolAsset
    }))
    .addOperation(StellarSDK.Operation.liquidityPoolDeposit({
      liquidityPoolId: poolID,
      maxAmountA: maxReserve1,
      maxAmountB: maxReserve2,
      minPrice: minPrice.toFixed(7),
      maxPrice: maxPrice.toFixed(7),
    }))
    .setTimeout(transactionTimeout) // in seconds
    .build();

  return transaction;
}

export const createRemoveLiquidityTx = async (publicKey,
                                              poolSharesAmount,
                                              asset1,
                                              minReserve1,
                                              asset2,
                                              minReserve2) => {
  const [ assetA, assetB ] = orderAssets(prepareAsset(asset1), prepareAsset(asset2));

  const poolAsset = new StellarSDK.LiquidityPoolAsset(assetA,
                                                      assetB,
                                                      StellarSDK.LiquidityPoolFeeV18);

  const poolID = getLiquidityPoolIDFromPoolAsset(poolAsset);

  // Swap maxReserves if orderAssets() function reordered our assets
  if (assetA.code === asset2.asset_code ||
      assetB.code === asset1.asset_code) {
    [minReserve1, minReserve2] = [minReserve2, minReserve1];
  }

  // Begin transaction
  const account = await server.loadAccount(publicKey);

  // Determine if we are removing the full balance from the pool
  let isEntireBalance = false;
  for (const balance of account.balances) {
    if (balance.liquidity_pool_id === poolID) {
      if (balance.balance === poolSharesAmount) {
        isEntireBalance = true;
      }
      break;
    }
  }

  let transaction = new StellarSDK.TransactionBuilder(account, {
      fee,
      networkPassphrase,
      withMuxing: true
    })
    .addOperation(StellarSDK.Operation.liquidityPoolWithdraw({
      liquidityPoolId: poolID,
      amount: poolSharesAmount,
      minAmountA: minReserve1,
      minAmountB: minReserve2,
    }));

  // Remove trustline to the pool if necessary
  if (isEntireBalance) {
    transaction = transaction.addOperation(StellarSDK.Operation.changeTrust({
                                asset: poolAsset,
                                limit: "0"
                              }));
  }

  transaction = transaction.setTimeout(transactionTimeout) // in seconds
                           .build();
  return transaction;
}

//-----------------------------------------------------------------------------
// Aqua functions

export const createAquaVoteTx = async (originPublicKey, pairWalletDestination,
                                     voteAmount, durationInSeconds = 0) => {
  const asset = new StellarSDK.Asset(
    'AQUA',
    'GBNZILSTVQZ4R7IKQDGHYGY2QXL5QOFJYQMXPKWRRM5PAV7Y4M67AQUA'
  );

  const claimants = [
    // Predicate "not unconditional", so vote pair wallet cannot claim funds
    new StellarSDK.Claimant(
      pairWalletDestination,
      StellarSDK.Claimant.predicateNot(
        StellarSDK.Claimant.predicateUnconditional()
      )
    ),
    // 2nd claimant is the User
    new StellarSDK.Claimant(
      originPublicKey,
      StellarSDK.Claimant.predicateNot(
        StellarSDK.Claimant.predicateBeforeRelativeTime(
          Math.round(durationInSeconds).toString() // seconds from ledger inclusion time)
        )
      )
    )
  ];

  const account = await server.loadAccount(originPublicKey);

  const transaction = new StellarSDK.TransactionBuilder(account, {
      fee,
      networkPassphrase
    })
    .addOperation(StellarSDK.Operation.createClaimableBalance({
      asset,
      amount: voteAmount,
      claimants
    }))
    .setTimeout(transactionTimeout) // in seconds
    .build();

  return transaction;
}

export const getTotalAquaVotes = async (publicKey) => {
  let claimableBalances = await server.claimableBalances()
                                      .claimant(publicKey)
                                      .order("desc")
                                      .limit(200)
                                      .call();
  let totalVotes = 0;

  while(claimableBalances.records.length !== 0) {
    for (let index = 0; index < claimableBalances.records.length; ++index) {
      const element = claimableBalances.records[index];
      if (element.asset === "AQUA:GBNZILSTVQZ4R7IKQDGHYGY2QXL5QOFJYQMXPKWRRM5PAV7Y4M67AQUA") {
        totalVotes += parseFloat(element.amount);
      }
    }

    claimableBalances = await claimableBalances.next();
  }

  return totalVotes;
}

export const getAquaMarketKeys = async () => {
  let marketKeysData;
    let response = await axios.get('https://marketkeys-tracker.aqua.network/api/market-keys/?limit=200');
    marketKeysData = [...response.data.results];
    
    while(response.data.next !== null) {  
      response = await axios.get(response.data.next);
      marketKeysData = [...marketKeysData, ...response.data.results];
    }
    
  return marketKeysData;
}

export const getAquaVotingSnapshot = async () => {
  let snapshotData;
    let response = await axios.get('https://voting-tracker.aqua.network/api/voting-snapshot/top-volume/?limit=200');
    snapshotData = [...response.data.results];
    
    while(response.data.next !== null) {  
      response = await axios.get(response.data.next);
      snapshotData = [...snapshotData, ...response.data.results];
    }
    
  return snapshotData;
}

export const getAquaBalance = async (publicKey) => {
  const account = await server.loadAccount(publicKey);
  
  for (const balance of account.balances) {
    if (balance.asset_code === "AQUA" &&
        balance.asset_issuer === "GBNZILSTVQZ4R7IKQDGHYGY2QXL5QOFJYQMXPKWRRM5PAV7Y4M67AQUA") {
      return (parseFloat(balance.balance) - 
              parseFloat(balance.selling_liabilities)).toFixed(7);
    }
  }

  return 'No Trustline';
}