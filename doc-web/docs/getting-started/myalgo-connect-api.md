---
sidebar_position: 1
---

# MyAlgo Connect API

MyAlgo Connect offers 3 methods, summarized here.

## connect

Request the user to give access to the dapp and which account(s) to share (only the public data). 
In order to request a signature from the user or have the user approve a transaction, one must be able to access the user's wallet address. 
Connect method allows the dapp to know the list of addresses allowed by the user for future signatures.

The Connect method is agnostic for all networks.


### Fingerprint

```jsx
export interface Accounts {
  address: Address;
  name: string;
}

export interface ConnectionSettings {
  shouldSelectOneAccount: boolean; 
}

connect(settings?: ConnectionSettings): Promise<Accounts[]>;
```

### Params

Object `settings` has the following field:

`shouldSelectOneAccount`: Users are allowed to select just one account. Default is false.

### Response

Will return an array of Account object, which contains the public wallet(s) data selected by the user in the “Manage your account” section. 

```json
[
  {
    "address": "46QNIYQEMLKNOBTQC56UEBBHFNH37EWLHGT2KGL3ZGB4SW77W6V7GBKPDY",
    "name": "Wallet #1"
  }
]
```

If the user closes the popup, Promise will be rejected with an error message. These  cases need to be handled by the application being developed.


## signTransaction

Sends to My Algo Connect an Algorand transaction(s) to be signed by the user.
Sent in transactions will be validated against our own set of validations and then for the Algo SDK, just in case some transaction fails, the whole set of transactions will be rejected.

Every transaction will be signed by the corresponding wallet  (My Algo Connect will use corresponding wallet’s address in case the transaction is rekeyed)

### Fingerprint

```jsx 
export type Address = string;
export type Base64 = string;
export type TxHash = string;
export type EncodedTransaction = Base64 | Uint8Array;
export type AlgorandTxn = PaymentTxn | AssetTxn | AssetConfigTxn | AssetCreateTxn | DestroyAssetTxn | FreezeAssetTxn | KeyRegTxn | ApplTxn;
 
export interface SignedTx {
   txID: TxHash;
   blob: Uint8Array;
}
 
signTransaction(transaction: AlgorandTxn | EncodedTransaction | AlgorandTxn[] | EncodedTransaction[]): Promise<SignedTx | SignerdTx[]>;
```

### Params

`transaction`: an array or a single transaction of these types: AlgorandTxn or EncodedTransaction.


### Response

Calling signTransaction with an array of transactions will return an array of SignedTx object. 

```json
[
   {
       "txID": "XC2PBS2UM4AQOVW47G6INYC7RNGSOHWRXGPOAPHLY74JOJY6C3QA",
       "blob": {
        "0": 130,
        "1": 163,
        ...
        "245": 97,
        "246": 121
       }
   },
   {
       "txID": "E2S4JVCC76PBW6UBLMOKZA2CSJE36OFBRJEZY3AGFZMIRSFSEZKQ",
       "blob": {
        "0": 130,
        "1": 163,
        ...
        "245": 97,
        "246": 121
       }
   }
]
```

Otherwise, it will return a SignedTx object.

```json
{
  "txID": "XC2PBS2UM4AQOVW47G6INYC7RNGSOHWRXGPOAPHLY74JOJY6C3QA",
  "blob": {
  "0": 130,
  "1": 163,
  ...
  "245": 97,
  "246": 121
  }
}
```

### Considerations

* Networks accepted are: Algorand’s **MAINNET**, **TESTNET** and **BETANET**. Also, **private** networks are allowed by just specifying the network in the transaction params.
* Set of transactions that are sent to sign must have the same Network. Otherwise My Algo Connect will fail.
* Different addresses are allowed to be specified as a sender (“from”) in transaction(s), however, the address(es) should be a subset of the accounts shared by the user in the `connect` method.

## signLogicSig

Send to My Algo Connect an Algorand program to be signed by the user.

### Fingerprint

```jsx
export type Address = string;
export type Base64 = string;

signLogicSig(logic: Uint8Array | Base64, address: Address): Promise<Uint8Array>;
```

### Params
`Logic`:  TEAL program to be signed by the user.

`Address`: Signer’s Address.

### Response


```json
// Uint8Array
{
  "0": 248,
  "1": 77,
  "2": 132,
  ...
  "61": 28,
  "62": 131,
  "63": 14
}
```

