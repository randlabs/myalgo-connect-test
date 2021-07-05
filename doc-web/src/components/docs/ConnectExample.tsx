import MyAlgoConnect, { Accounts } from "@randlabs/myalgo-connect";
import React, { MouseEvent, useState } from "react";
import { Button, Col, Label, Row } from "reactstrap";
import PrismCode from '../test/components/commons/Code';
import "./interactive-examples.scss"

const myAlgoWallet = new MyAlgoConnect({ bridgeUrl: "https://dev.myalgo.com/bridge" });

const code = `
import MyAlgoConnect from '@randlabs/myalgo-connect';

const myAlgoConnect = new MyAlgoConnect();

const accounts = await myAlgoConnect.connect({ shouldSelectOneAccount: true });
`;

export default function ConnectExample(): JSX.Element {
    const [accounts, setAccounts] = useState<Accounts[]>([]);

    const onClick = async (e: MouseEvent): Promise<void> => {
        e.preventDefault();
        try {
            const sharedAccounts = await myAlgoWallet.connect({ shouldSelectOneAccount: true });
            setAccounts(sharedAccounts);
            window.sharedAccounts = sharedAccounts;
        }
        catch (err) {
            console.log(err);
        }
    }

    const onClearResponse = (): void => {
        setAccounts([]);
    }

    return (
        <Row className="connect-example-content">
            <Col xs="12" lg="6">
                <Label className="tx-label">
                    Code
                    </Label>
                <div className="connect-code2">
                    <PrismCode code={code} language="js"/>
                </div>
                <Button
                    className="button-margin"
                    color="primary"
                    block
                    onClick={onClick}>
                    Connect
                    </Button>
            </Col>
            <Col xs="12" lg="6">
                <Label className="tx-label">
                    Response
                    </Label>
                <div className="response-base code-connect-example">
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
    )
}
