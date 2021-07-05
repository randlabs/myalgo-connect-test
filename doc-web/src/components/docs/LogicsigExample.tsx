import React, { useState, MouseEvent } from "react";
import MyAlgoConnect from "@randlabs/myalgo-connect";

const myAlgoWallet = new MyAlgoConnect({ bridgeUrl: "https://dev.myalgo.com/bridge" });

export default function Connect(): JSX.Element {
    const [ signedTx, setSignTx ] = useState<Uint8Array>(new Uint8Array());

    const onClick = async (e: MouseEvent): Promise<void> => {
        e.preventDefault();
        try {
            if (!window.sharedAccounts || !Array.isArray(window.sharedAccounts) || window.sharedAccounts.length === 0)
                throw new Error("No accounts");
            const teal = Buffer.from("ASABjgcmAyAGeT24BhJl67ueTK8Cl7c1+Xz3oYyNlGtsR1rV/hjpkSDnoNRiBGLU1wZwF31CBCcrT7+SyzmnpRl7yYPJW/+3qyBiozYEE0WoVhgIXksKWVVzdDEGlBa8VeN8VjZ1k4cT8TEUKBIxFCkSETEUKhIxESISERE=", "base64");
            const signature = await myAlgoWallet.signLogicSig(new Uint8Array(teal), window.sharedAccounts[0].address);
            setSignTx(signature);
        }
        catch (err) {
            console.log(err);
        }
    }

    return <div>
        {JSON.stringify(signedTx, null, 2)}
        <button onClick={onClick}>Sign Teal</button>
    </div>
}
