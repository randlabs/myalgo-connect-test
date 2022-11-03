import MyAlgoConnect, { Accounts, WalletTransaction } from "@randlabs/myalgo-connect";
import algosdk from "algosdk";
import { createContext, PropsWithChildren } from "react";
import { algodClient, connection } from "../utils/connections";

export type SignatureMethod = 'legacy' | 'arc-0001';

export class Connector {
    constructor(
        private readonly connection: MyAlgoConnect,
        public readonly method: SignatureMethod = 'legacy'
    ) {
    }    

	public async connect(): Promise<Accounts[]> {
        return this.connection.connect();
    }

    public async signTransaction(txs: algosdk.Transaction | algosdk.Transaction[]): Promise<Uint8Array[]> {
        txs = Array.isArray(txs) ? txs : [ txs ];

        if (this.method === 'legacy') {
            const result = await this.connection.signTransaction(txs.map(tx => tx.toByte()));
            return result.map(st => st.blob);
        } else {
            const result = await this.connection.signTxns(txs.map(tx => ({
                txn: Buffer.from(tx.toByte()).toString('base64')
            })));

            return result
                .filter(st => Boolean(st))
                .map(st => new Uint8Array(Buffer.from(st!, 'base64')))
        }
    }

    public async signTxns(wtxs: WalletTransaction[]): Promise<Uint8Array[]> {
        const result = await this.connection.signTxns(wtxs);
        return result.map(st => new Uint8Array(Buffer.from(st!, 'base64')));
    }

	public async signLogicSig(logic: Uint8Array | string, address: string): Promise<Uint8Array> {
        return this.connection.signLogicSig(logic, address)
    }

    public async tealSign(data: Uint8Array | string, contractAddress: string, address: string): Promise<Uint8Array> {
        return this.connection.tealSign(data, contractAddress, address);
    }

    public async signBytes(bytes: Uint8Array, address: string): Promise<Uint8Array> {
        return this.connection.signBytes(bytes, address);
    }
}

export interface IAppContext {
    accounts: Accounts[];
    connection: Connector;
    algodClient: algosdk.Algodv2;
    signatureMethod: SignatureMethod;
}

export const AppContext = createContext<IAppContext>({
    connection: new Connector(connection),
    algodClient,
    accounts: [],
    signatureMethod: 'legacy'
});

export default function AppContextComponent(props: PropsWithChildren<{ context: IAppContext }>): JSX.Element {
    return <AppContext.Provider value={props.context}>{props.children}</AppContext.Provider>;
}
