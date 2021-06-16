import React, { FC, useState } from 'react';
import { Container, Row, Col, Button } from 'reactstrap';
import MyAlgo, { Accounts } from '@randlabs/myalgo-connect';
import PrismCode from './commons/Code';

interface ConnectProps {
    connection: MyAlgo;
    onComplete(accounts: Accounts[]): void;
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


const Connect: FC<ConnectProps> = (props: ConnectProps): JSX.Element => {

    const [accounts, setAccounts] = useState<Accounts[]>([]);

    const onClearResponse = (): void => {
        setAccounts([]);
    }

    const connectToMyAlgo = async (): Promise<void> => {
        try {
            const { connection, onComplete } = props;

            const accounts = await connection.connect();

            setAccounts(accounts);
            onComplete(accounts);
        }
        catch (err) {
            console.error(err);
        }
    }

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
                        onClick={connectToMyAlgo}
                    >
                        Connect
                    </Button>
                    <div className="response-cont">
                        <PrismCode
                            code={accounts.length ? JSON.stringify(accounts, null, 1) : "response"}
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
                        disabled={!accounts.length}
                        onClick={onClearResponse}
                    >
                        Clear Response
                    </Button>
                </Col>
            </Row>
        </Container>
    );
}

export default Connect;
