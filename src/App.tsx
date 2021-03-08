import React, { Component, Fragment, ReactNode } from 'react';
import { Container, Row, Col } from 'reactstrap';
import MyAlgo, { Accounts } from '@randlabs/myalgo-connect';

import './App.scss';

import Navbar from './components/navbar/Navbar';
import Connect from './components/connect/Connect';
import Payment from './components/payment/Payment';
import PaymentRekeyed from './components/payment-rekeyed/payment-rekeyed';
import MultisigPayment from './components/multisig-payment/multisig-payment';
import ASATransfer from './components/asatransfer/asatransfer';
import SignTeal from './components/signteal/signteal';
import ApplOptIn from './components/applOptin/applOptin';
import ApplCallNoOp from "./components/applCallNoOp/applCallNoOp";
import ApplCloseOut from './components/applCloseOut/applCloseOut';
//import logo from './assets/images/MyAlgo.svg';
import Footer from './components/footer/Footer';


interface IAppState {
    accounts: Accounts[];
}

class App extends Component<{}, IAppState> {
    private connection: MyAlgo;

    constructor(props: {}) {
        super(props);

        this.state = {
            accounts: []
        }

        this.connection = new MyAlgo();

        this.onCompleteConnect = this.onCompleteConnect.bind(this);
    }

    onCompleteConnect(accounts: Accounts[]): void {
        this.setState({
            accounts
        })
    }

    render(): ReactNode {
        const { accounts } = this.state;

        return (
            <Fragment>
                <Navbar />
                <Container className="main-container" fluid>
                    <Row className="main-row">
                        <Col>
                            <Connect
                                connection={this.connection}
                                onComplete={this.onCompleteConnect}
                            />
                            {
                                accounts.length > 0
                                ? <Fragment>
                                    <Payment
                                        connection={this.connection}
                                        accounts={accounts}
                                    />
                                    {/* <PaymentRekeyed
                                        connection={this.connection}
                                        accounts={accounts}
                                    /> */}
                                    <MultisigPayment
                                        connection={this.connection}
                                        accounts={accounts}
                                    />
                                    <SignTeal
                                        connection={this.connection}
                                        accounts={accounts}
                                    />
                                    <ASATransfer
                                        connection={this.connection}
                                        accounts={accounts}
                                    />
                                    <ApplOptIn
                                        connection={this.connection}
                                        accounts={accounts}
                                    />
                                    <ApplCallNoOp
                                        connection={this.connection}
                                        accounts={accounts}
                                    />
                                    <ApplCloseOut
                                        connection={this.connection}
                                        accounts={accounts}
                                    />
                                </Fragment> : null
                            }
                        </Col>
                    </Row>
                </Container>
                <Footer />
            </Fragment>
        );
    }
}

export default App;
