---
sidebar_position: 2
---

# Choosing Network

The network selection is abstracted from MyAlgo Connect and is instead defined by the transaction parameters. To connect/select a network, simply define the network genesisID and genesisHash that you desire in the transaction’s param field when creating the transaction(s). You may decide to use Algorand public networks (Mainnet, Testnet or Betanet) or use your own custom private network.

Depending on the network you choose, genesisID and genesisHash will change.
In the following links you can find the data needed for every network respectively: **[MainNet](https://developer.algorand.org/docs/reference/algorand-networks/mainnet/)** , **[TestNet](https://developer.algorand.org/docs/reference/algorand-networks/testnet/)** and **[BetaNet](https://developer.algorand.org/docs/reference/algorand-networks/betanet/)**.

Follow this example to create a transaction choosing the Testnet network and send it to MyAlgo Connect to be signed:

```jsx
import algosdk from "algosdk";
import MyAlgoConnect from '@randlabs/myalgo-connect';
 
const algodClient = new algosdk.Algodv2("",'https://api.testnet.algoexplorer.io', '');
 
const params = await algodClient.getTransactionParams().do();

const txToSigned = algosdk.makePaymentTxnWithSuggestedParams(from, to, amount, undefined, undefined, params);

const myAlgoConnect = new MyAlgoConnect();
// Send testnet txn to be signed by the user through MyAlgo Connect.
const txnSignedByTheUser = await myAlgoConnect.signTransaction(txn.toByte());
```