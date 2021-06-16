import React, { FC, Fragment, useState } from 'react';
import { Container, Row, Col } from 'reactstrap';
import MyAlgoConnect, { Accounts } from '@randlabs/myalgo-connect';
import algosdk from "algosdk"

import './App.scss';

import Navbar from './components/bars/Navbar';
import Footer from './components/bars/Footer';

import Connect from './components/Connect';

const connection = new MyAlgoConnect({ bridgeUrl: "https://wallet.localhost.com:3000" });
const algodClient = new algosdk.Algodv2('', 'https://api.testnet.algoexplorer.io', '');

let firstFetch = false;

const App: FC = (): JSX.Element => {

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
        setTimeout(getTransactionParams, 10000)
    }

    if (!firstFetch) {
        firstFetch = true;
        getTransactionParams();
    }

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
                            accounts.length > 0 && params
                            ? <Fragment></Fragment> : null
                        }
                    </Col>
                </Row>
            </Container>
            <Footer />
        </Fragment>
    );
}

export default App;
