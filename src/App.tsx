import React, { Component, ReactNode } from 'react';
import MyAlgo, { Accounts } from '@randlabs/myalgo-connect';

import './App.scss';

import Connect from './components/connect/Connect';
import Payment from './components/payment/Payment';
import PaymentRekeyed from './components/payment-rekeyed/payment-rekeyed';
import MultisigPayment from './components/multisig-payment/multisig-payment';
//import logo from './assets/images/MyAlgo.svg';

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

        this.connection = new MyAlgo("https://wallet.localhost.com:3000");

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
            <div className="app">
                {/* <Row className="mb-5">
                        <Col>
                            <img src={logo} className="myalgo-logo" alt="MyAlgo logo" />
                        </Col>
                    </Row> */}
                <Connect
                    connection={this.connection}
                    onComplete={this.onCompleteConnect}
                />
                <Payment
                    connection={this.connection}
                    accounts={accounts}
                />
                <PaymentRekeyed
                    connection={this.connection}
                    accounts={accounts}
                />
                <MultisigPayment
                    connection={this.connection}
                    accounts={accounts}
                />
            </div>
        );
    }
}

export default App;
