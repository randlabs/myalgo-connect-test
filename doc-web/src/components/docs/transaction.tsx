import React, { useState, MouseEvent } from "react";
import MyAlgoConnect, { SignedTx } from "@randlabs/myalgo-connect";
import algosdk from "algosdk";

const myAlgoWallet = new MyAlgoConnect({ bridgeUrl: "https://dev.myalgo.com/bridge" });

export default function Connect(): JSX.Element {
    const [ signedTx, setSignTx ] = useState<SignedTx|undefined>();

    const onClick = async (e: MouseEvent): Promise<void> => {
        e.preventDefault();
        try {
            if (!window.sharedAccounts || !Array.isArray(window.sharedAccounts) || window.sharedAccounts.length === 0)
                throw new Error("No accounts");
            const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
                suggestedParams: { fee: 1000, firstRound: 8000000, lastRound: 8000900, genesisID: "testnet-v1.0", genesisHash: "SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=", flatFee: true },
                from: window.sharedAccounts[0].address,
                to: window.sharedAccounts[0].address,
                amount: 0,
            });
            console.log(txn)
            const signature = await myAlgoWallet.signTransaction(txn.toByte());
            setSignTx(signature);
        }
        catch (err) {
            console.log(err);
        }
    }

    return <div>
        {JSON.stringify(signedTx, null, 2)}
        <button onClick={onClick}>Sign Transaction</button>
    </div>
}
