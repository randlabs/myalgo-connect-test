import React, { Component, ReactNode } from 'react';
import { Container, Row, Col, Button } from 'reactstrap';
import MyAlgo, { Accounts } from '@randlabs/myalgo-connect';

import PrismCode from '../code/Code';


interface IConnectProps {
    connection: MyAlgo;
    onComplete(accounts: Accounts[]): void;
}

interface IConnectState {
    response: Accounts[];
}

const code = `
const connectToMyAlgo = async() => {
    try {
        const accounts = await myAlgoWallet.connect();
        console.log(accounts);
    }
    catch (err) {
        console.error(err);
    }
}
`;


class Connect extends Component<IConnectProps, IConnectState> {
    constructor(props: IConnectProps) {
		super(props);

		this.state = {
			response: []
		};

        this.onClearResponse = this.onClearResponse.bind(this);
        this.connectToMyAlgo = this.connectToMyAlgo.bind(this);
	}
    
    onClearResponse(): void {
        this.setState({
			response: []
		});
    }

    async connectToMyAlgo(): Promise<void> {
        try {
            const { connection, onComplete } = this.props;
            
            const accounts = await connection.connect();

            this.setState({
                response: accounts
            })
        
            onComplete(accounts);
        }
        catch (err) {
          console.error(err);
        }
    }

    render(): ReactNode {
        const { response } = this.state;

        return (
            <Container className="mt-5 pb-5">
                <Row className="mt-4">
                    <Col xs="12" sm="6">
                        <h1>Connect</h1>
                        <p>Connect to My Algo</p>
                    </Col>
                </Row>
                <Row>
                    <Col xs="12" lg="6">
                        <Button
                            color="primary"
                            block
                            onClick={this.connectToMyAlgo}
                        >
                            Connect
                        </Button>
                        <div className="response-cont">
                            <PrismCode
                                code={response.length ? JSON.stringify(response, null, 1) : "response"}
                                language="js"
                                plugins={["response"]}
                            />
                        </div>
                    </Col>
                    <Col xs="12" lg="6">
                        <PrismCode
                            code={code}
                            language="js"
                        />
                         <Button
                            color="primary"
                            disabled={!response.length}
                            onClick={this.onClearResponse}
                        >
                            Clear Response
                        </Button>
                    </Col>
                </Row>
            </Container>
        );
    }
}

export default Connect;
