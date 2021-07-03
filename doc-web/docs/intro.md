---
sidebar_position: 0
---

# Introduction

Welcome to MyAlgo Connect’s Developer Documentation. This documentation explains how to connect **dapps** to the Algorand blockchain through MyAlgo Connect.


## Why MyAlgo Connect?

MyAlgo Connect handles all aspects of account management. It connects websites and users of Algorand applications to Algorand’s blockchain. 
Users can manage their accounts through **[MyAlgo Wallet](https://wallet.myalgo.com/home)** and sign all kinds of transactions with MyAlgo Connect, abstracting that complexity from the web application.


## What is MyAlgo Connect?


MyAlgo Connect**[MyAlgo Connect](https://github.com/randlabs/myalgo-connect)** is an SDK for dapp developers looking to integrate with **[My Algo Wallet](https://wallet.myalgo.com/home)** to allow WebApp users to review and sign Algorand transactions securely. This enables Algorand applications to use MyAlgo Wallet to interact with the Algorand blockchain and users to access the applications in a private and secure manner.
The integration with MyAlgo Wallet grants users secure access to Algorand dapps by enabling  them to review and sign all types of transactions  ***without exposing their private keys*** while only sharing their public address. The main advantage of MyAlgo Connect is that the process is managed in the user’s browser without any backend service nor downloads, extensions, or browser plugins. Unlike extension-based wallets like Metamask or AlgoSigner, MyAlgo Connect works in any browser (including Safari)  and any mobile device giving developers a native HTML5 solution that works on all platforms.
MyAlgo Connect supports all Algorand transaction types, along with atomic transaction groups and arrays of transactions. It also supports hardware wallets like Ledger Nano S and Ledger Nano X, and it’s fully compatible with **[lgoSDK](https://github.com/algorand/js-algorand-sdk)**. Developers can easily construct transactions in MyAlgo Connect in the same way they use the AlgoSDK.
