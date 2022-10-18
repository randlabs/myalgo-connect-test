import { Accounts } from '@randlabs/myalgo-connect';
import { Fragment, useState } from 'react';
import { Col, Container, Row } from 'reactstrap';
import './App.scss';
import Footer from './components/bars/Footer';
import Navbar from './components/bars/Navbar';
import SignatureMethodSelector from './components/commons/SignatureMethodSelector';
import Connect from './components/Connect';
import AppCloseOut from './components/operations/ApplCloseOut';
import ApplCreate from './components/operations/ApplCreate';
import ApplDelete from './components/operations/ApplDelete';
import AppOptIn from './components/operations/ApplOptIn';
import ApplUpdate from './components/operations/ApplUpdate';
import AsaTransfer from './components/operations/AsaTransfer';
import GroupTransaction from './components/operations/GroupTransaction';
import GroupWithTeal from './components/operations/GroupWithTeal';
import Payment from './components/operations/Payment';
import SignBytes from './components/operations/SignBytes';
import SignerOverride from './components/operations/SignerOverride';
import SignTeal from './components/operations/SignTeal';
import TealSign from './components/operations/TealSign';
import AppContext, { Connector, IAppContext, SignatureMethod } from "./context/appContext";
import { algodClient, connection } from './utils/connections';

export default function App(): JSX.Element {
    const [context, setContext] = useState<IAppContext>({
        connection: new Connector(connection),
        algodClient,
        accounts: [],
        signatureMethod: 'legacy'
    });

    const onCompleteConnect = (accounts: Accounts[]): void => {
        setContext({ ...context, accounts });
    };

    const onSignatureMethodChange = (signatureMethod: SignatureMethod): void => {
        setContext({
            ...context,
            signatureMethod,
            connection: new Connector(connection, signatureMethod)
        });
    };

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
                        <SignatureMethodSelector
                            value={context.signatureMethod}
                            onChange={onSignatureMethodChange}
                        />
                        {
                            context.accounts.length > 0 &&
                            <AppContext context={context}>
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
                            </AppContext>
                        }
                    </Col>
                </Row>
            </Container>
            <Footer />
        </Fragment>
    );
}
