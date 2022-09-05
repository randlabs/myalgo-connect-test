import { Accounts } from '@randlabs/myalgo-connect';
import algosdk from "algosdk";
import { Fragment, useEffect, useState } from 'react';
import { Col, Container, Row } from 'reactstrap';
import Footer from './components/bars/Footer';
import Navbar from './components/bars/Navbar';
import Connect from './components/Connect';
import AppCloseOut from './components/operations/ApplCloseOut';
import AppOptIn from './components/operations/ApplOptIn';
import AsaTransfer from './components/operations/AsaTransfer';
import Payment from './components/operations/Payment';
import GroupTransaction from './components/operations/GroupTransaction';
import SignTeal from './components/operations/Signteal';
import ApplCreate from './components/operations/ApplCreate';
import ApplDelete from './components/operations/ApplDelete';
import ApplUpdate from './components/operations/ApplUpdate';
import GroupWithTeal from './components/operations/GroupWithTeal';
import AccountsProvider from "./context/accountsContext";
import ParamsProvider from "./context/paramsContext";
import { algodClient, connection } from './utils/connections';

import './App.scss';
import SignerOverride from './components/operations/SignerOverride';
import TealSign from './components/operations/TealSign';
import SignBytes from './components/operations/SignBytes';

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
    }, [ accounts ])

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
                            <ParamsProvider params={params}>
                                <AccountsProvider accounts={accounts}>
                                    <Payment />
                                    <GroupWithTeal />
                                    <AsaTransfer />
                                    <AppOptIn />
                                    <AppCloseOut />
                                    <SignTeal />
                                    <GroupTransaction />
                                    <ApplCreate />
                                    <ApplDelete />
                                    <ApplUpdate />
                                    <SignerOverride />
                                    <TealSign />
                                    <SignBytes />
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
