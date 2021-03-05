import React, { Component, Fragment, ReactNode } from 'react';
import { Container, Row, Col } from 'reactstrap';
import MyAlgo, { Accounts } from '@randlabs/myalgo-connect';

import './App.scss';

import Navbar from './components/navbar/Navbar';
import Connect from './components/connect/Connect';
import Payment from './components/payment/Payment';
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
                            <Payment
                                connection={this.connection}
                                accounts={accounts}
                            />
                        </Col>
                    </Row>
                </Container>
                <Footer />
            </Fragment>
        );
    }
}

export default App;
