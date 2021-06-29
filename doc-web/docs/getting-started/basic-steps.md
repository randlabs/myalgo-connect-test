---
sidebar_position: 0
---

# Baby Steps

This section will cover a common dev flow to request the user's public wallet data, create a transaction, request the user to sign it, and finally send it to the network.

### Install

To develop for Algorand, first, you need to integrate the MyAlgoConnect library into your project by installing it with Node Package Management (NPM).

`npm install @randlabs/myalgo-connect`

Also, you will want to create transaction(s) to be signed by the user, then you have two possibilities:
* Use **[AlgoSDK](https://www.npmjs.com/package/algosdk)** (Supported was added in My Algo 2.0) - **Recommended**
* Use our own transaction types. For more information visit the **[My Algo Connect Github Repository](https://github.com/randlabs/myalgo-connect)**.

### Get user’s wallet (only public data)

You may request permission to connect to the user’s wallet in order to get the **user’s allowed address(es)**.

To do this you need to call a `connect()` method. A new browser window will open requesting permission to share the user’s public wallet data to the Dapp, as well as selecting which account(s) wish to connect to the Client application. If the user accepts, it will return an array with all account’s addresses previously selected, if not, the `connect()` method will throw an error.

All of this can be archived with the following code:

```jsx
import MyAlgoConnect from '@randlabs/myalgo-connect';
 
const myAlgoConnect = new MyAlgoConnect();
 
const accountsSharedByUser = await myAlgoConnect.connect();
```

### Create and sign transaction

The next step will be to sign a set of transactions you wish with My Algo Connect, this can be accomplished by creating the transaction with some of the way talk avobe. Let's use AlgoSDK library and create a Payment transaction as an example

```jsx
import algosdk from "algosdk";
 
const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
  suggestedParams: {
      ...params,
      fee: 1000,
      flatFee: true,
  },
  from: sender,
  to: receiver,
  Amount: amount
  note: note
});
```

Once you have created the transaction, you just need to send it to be signed by the user through My Algo Connect using the following line of code: 

```jsx
const signedTxn = await myAlgoWallet.signTransaction(txn.toByte());
```

### Send transaction to the network

After the user has signed the transaction(s), the object signedTxn should have the final transaction with signature data on it, afterwards, if you consider it, you can send it to the network.


```jsx
import algosdk from "algosdk";

const algodClient = new algosdk.Algodv2(“”, 'https://api.testnet.algoexplorer.io', '');

const response = await algodClient.sendRawTransaction(signedTxn.blob).do()
```
