---
sidebar_position: 0
---

# Baby Steps

This section will cover a common dev flow to request the user's public wallet data, create a transaction, request the user to sign it, and finally send it to the network.

### Install

To integrate MyAlgo Connect to your webapp, first you need to integrate the MyAlgo Connect library into your project by installing it with Node Package Management:

### Get user’s wallet (only public data)

Once the MyAlgo Connect library is integrated, you are ready to interact with the user.
You first need to request permission to connect to the user’s wallet in order to get the user’s address(es).

To do so, you need to call a `connect()` method inside a function that has been triggered by a click event. A new browser window will open requesting permission to share the user’s public wallet data to the website and a selection of the account(s) the user wishes to connect to the Client application. If the user accepts, it will return an array with the account addresses previously selected, if not, the `connect()` method will throw an error.

All of this is done with the following code:

```jsx
import MyAlgoConnect from '@randlabs/myalgo-connect';
 
const myAlgoConnect = new MyAlgoConnect();

const accountsSharedByUser = await myAlgoConnect.connect()
```

### Create and sign transactions

The next step, signing a transaction or a set of transactions with MyAlgo Connect, is accomplished by first creating the transaction itself:

There are two options to create transactions accepted by MyAlgo Connect:

* Use **[AlgoSDK](https://www.npmjs.com/package/algosdk)** EncodedTransaction (Supported in MyAlgo 2.0) - **Recommended**
* Use MyAlgo Connect’s Json transaction types. For more information about this visit the MyAlgo Connect **[Github Repository](https://github.com/randlabs/myalgo-connect)**.

```jsx
import algosdk from "algosdk";
 
const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
  suggestedParams: {
      ...params,
  },
  from: sender,
  to: receiver,
  Amount: amount
  note: note
});
```

Once you have created the transaction, it can be signed by the user by simply sending it to MyAlgo Connect. To do so use the following line of code: 

```jsx
const signedTxn = await myAlgoWallet.signTransaction(txn.toByte());
```

### Send Transactions to the Network

After the user has signed the transaction(s), the object signedTxn should have the final transaction with signature data on it. You can now send it to the network:


```jsx
import algosdk from "algosdk";

const algodClient = new algosdk.Algodv2(“”, 'https://api.testnet.algoexplorer.io', '');

const response = await algodClient.sendRawTransaction(signedTxn.blob).do();
```
