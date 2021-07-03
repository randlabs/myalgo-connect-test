import { Accounts } from '@randlabs/myalgo-connect';
import algosdk from "algosdk";
import 'prismjs/themes/prism.css';
import React, { Fragment, useEffect, useState } from 'react';
import Connect from './components/homepage/Connect';
import SignTransaction from './components/homepage/SignTransaction';
// import LogicSignature from './components/homepage/LogicSignature';
import AccountsProvider from "./context/accountsContext";
import ParamsProvider from "./context/paramsContext";
import './index.scss';
import { algodClient, connection } from './utils/connections';
import 'bootstrap/dist/css/bootstrap.min.css';

let timeoutResolution: NodeJS.Timeout | null = null;

export default function App(): JSX.Element {

    const [params, setParams] = useState<algosdk.SuggestedParams>();
    const [accounts, setAccounts] = useState<Accounts[]>([]);

    const onCompleteConnect = (accounts: Accounts[]): void => {
        setAccounts(accounts);
    };

    const getTransactionParams = async (): Promise<void> => {
        try {
            const params = await algodClient.getTransactionParams().do();
            setParams(params);
        }
        catch (err) {
            console.error(err);
        }
        timeoutResolution = setTimeout(getTransactionParams, 10000);
    }

    useEffect(() => {
        if (timeoutResolution)
            clearTimeout(timeoutResolution);
        getTransactionParams();
    }, [accounts])

    return (
        <Fragment>
            <div className="main-container">
                <div className="main-row">
                    <div>
                        <Connect
                            connection={connection}
                            onComplete={onCompleteConnect}
                        />
                        {
                            <ParamsProvider params={params}>
                                <AccountsProvider accounts={accounts}>
                                    <SignTransaction />
                                </AccountsProvider>
                            </ParamsProvider>
                        }
                    </div>
                </div>
            </div>
        </Fragment>
    );
}
