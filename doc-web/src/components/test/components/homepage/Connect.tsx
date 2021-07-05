import MyAlgo, { Accounts } from '@randlabs/myalgo-connect';
import React, { FC, useState } from 'react';
import { Button, Col, Container, Row } from 'reactstrap';
import PrismCode from '../commons/Code';
import "../operations/all.scss";

interface ConnectProps {
    connection: MyAlgo;
    onComplete(accounts: Accounts[]): void;
}

const install = `

npm install @randlabs/myalgo-connect
`;

const code = `
import myAlgo from '@randlabs/myalgo-connect';

const accounts = await myAlgo.connect();
`;

const Connect: FC<ConnectProps> = (props: ConnectProps): JSX.Element => {

    const [accounts, setAccounts] = useState<Accounts[]>([]);

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
            <Row className="connect-content">
                <Col xs="12" lg="4">
                    <h1>Connect</h1>
                    <Button
                        className="button-margin"
                        color="primary"
                        block
                        onClick={connectToMyAlgo}>
                        Connect
                    </Button>
                </Col>
                <Col xs="12" lg="8">
                    <div className="mb-3">
                        <PrismCode
                            code={install}
                            language="js"
                        />
                    </div>
                    <PrismCode
                        code={code}
                        language="js"
                    />
                </Col>
            </Row>
        </Container>
    );
}

export default Connect;
