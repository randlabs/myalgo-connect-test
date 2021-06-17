import { Accounts } from '@randlabs/myalgo-connect';
import algosdk from "algosdk";
import React, { Fragment, useEffect, useState } from 'react';
import { Col, Container, Row } from 'reactstrap';
import './App.scss';
import Footer from './components/bars/Footer';
import Navbar from './components/bars/Navbar';
import Connect from './components/Connect';
import AsaTransfer from './components/operations/AsaTransfer';
import Payment from './components/operations/Payment';
import AccountsProvider from "./context/accountsContext";
import ParamsProvider from "./context/paramsContext";
import { algodClient, connection } from './utils/connections';

let timeoutResolution: NodeJS.Timeout | null = null;

export default function App(): JSX.Element {

    const [ params, setParams ] = useState<algosdk.SuggestedParams>();
    const [ accounts, setAccounts ] = useState<Accounts[]>([]);

    const onCompleteConnect = (accounts: Accounts[]): void => {
        setAccounts(accounts);
    };

    const getTransactionParams = async (): Promise<void> => {
        try {
            const params = await algodClient.getTransactionParams().do();
            setParams(params);
        }
        catch (err) {
            console.log(err);
        }
        timeoutResolution = setTimeout(getTransactionParams, 10000);
    }

    useEffect(() => {
        if (timeoutResolution)
            clearTimeout(timeoutResolution);
        getTransactionParams();
    }, [ accounts ])

    console.log(accounts, params)

    return (
        <Fragment>
            <Navbar />
            <Container className="main-container" fluid>
                <Row className="main-row">
                    <Col>
                        <Connect
                            connection={connection}
                            onComplete={onCompleteConnect}
                        />
                        {
                            accounts.length > 0 && params &&
                            <ParamsProvider params = {params}>
                                <AccountsProvider accounts = {accounts}>
                                    <Payment />
                                    <AsaTransfer />
                                </AccountsProvider>
                            </ParamsProvider>
                        }
                    </Col>
                </Row>
            </Container>
            <Footer />
        </Fragment>
    );
}
