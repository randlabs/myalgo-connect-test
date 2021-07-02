import React, { useState, MouseEvent } from "react";
import MyAlgoConnect, { Accounts } from "@randlabs/myalgo-connect";

const myAlgoWallet = new MyAlgoConnect({ bridgeUrl: "https://dev.myalgo.com/bridge" });

export default function Connect(): JSX.Element {
    const [ accounts, setAccounts ] = useState<Accounts[]>([]);

    const onClick = async (e: MouseEvent): Promise<void> => {
        e.preventDefault();
        try {
            const sharedAccounts = await myAlgoWallet.connect({ shouldSelectOneAccount: true });
            setAccounts(sharedAccounts);
            window.sharedAccounts = sharedAccounts;
        }
        catch (err) {
            console.log(err);
        }
    }

    return <div>
        {accounts.map(a => <div key={a.address}>{a.address}<br/></div>)}
        <button onClick={onClick}>Connect</button>
    </div>
}
