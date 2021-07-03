import React, { FC, useState } from 'react';
import { Container, Row, Col, Button, Label } from 'reactstrap';
import MyAlgo, { Accounts } from '@randlabs/myalgo-connect';
import PrismCode from './commons/Code';
import "./operations/all.scss";

interface ConnectProps {
    connection: MyAlgo;
    onComplete(accounts: Accounts[]): void;
}

const code = `
import myAlgo from '@randlabs/myalgo-connect';

const accounts = await myAlgo.connect();
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
        <Container className="mt-5">
            <Row className="mt-4">
                <Col>
                    <h1>Connect</h1>
                    <p>Connect to My Algo</p>
                </Col>
            </Row>
            <Row className="connect-content">
                <Col xs="12" lg="6">
                    <Label className="tx-label">
                        Code
                    </Label>
                    <div className="connect-code">
                        <PrismCode
                            code={code}
                            language="js"
                        />
                    </div>
                    <Button
                        className="button-margin"
                        color="primary"
                        block
                        onClick={connectToMyAlgo}>
                        Connect
                    </Button>
                </Col>
                <Col xs="12" lg="6" className="mt-xs-2">
                    <Label className="tx-label">
                        Response
                    </Label>
                    <div className="response-base code-connect">
                        <PrismCode
                            code={accounts.length ? JSON.stringify(accounts, null, 1) : ""}
                            language="js"
                            plugins={["response"]}
                        />
                    </div>
                    <Button
                        className="button-margin"
                        color="primary"
                        block
                        disabled={!accounts.length}
                        onClick={onClearResponse}>
                        Clear Response
                    </Button>
                </Col>
            </Row>
        </Container>
    );
}

export default Connect;
