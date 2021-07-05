import algosdk from "algosdk";
import React, { FormEvent, useState } from "react";
import { Button, Col, Form, Label, Nav, NavItem, NavLink, Row, TabContent, TabPane } from "reactstrap";
import Address from "../test/components/commons/Address";
import Amount from "../test/components/commons/Amount";
import PrismCode from '../test/components/commons/Code';
import SenderDropdown from "../test/components/commons/FromDropdown";
import Note from "../test/components/commons/Note";
import { algodClient, connection } from '../test/utils/connections';
import "./interactive-examples.scss";

const codeV1 = `
import algosdk from "algosdk";
import MyAlgoConnect from '@randlabs/myalgo-connect';
 
const algodClient = new algosdk.Algodv2("",'https://api.testnet.algoexplorer.io', '');
const params = await algodClient.getTransactionParams().do();

const txn: any = {
    ...params,
    type: "pay",
    from: sender,
    to: receiver,
    amount: amount
    note: note
};

const myAlgoConnect = new MyAlgoConnect();
const signedTxn = await myAlgoConnect.signTransaction(txn);
`;

const codeV2 = `
import algosdk from "algosdk";
import MyAlgoConnect from '@randlabs/myalgo-connect';

const algodClient = new algosdk.Algodv2("",'https://api.testnet.algoexplorer.io', '');
const params = await algodClient.getTransactionParams().do();

const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    suggestedParams: {
        ...params,
    },
    from: sender,
    to: receiver, 
    amount: amount
    note: note
});

const myAlgoConnect = new MyAlgoConnect();
const signedTxn = await myAlgoConnect.signTransaction(txn.toByte());
`;

export default function Payment(): JSX.Element {
    const accountsList = window.sharedAccounts && Array.isArray(window.sharedAccounts) ? window.sharedAccounts : [];
    const [note, setNote] = useState<Uint8Array | undefined>();
    const [accounts, setAccounts] = useState(accountsList);
    const [receiver, setReceiver] = useState("");
    const [amount, setAmount] = useState(0);
    const [response, setResponse] = useState({});
    const [activeTab, setActiveTab] = useState('1');

    const toggle = (tab: React.SetStateAction<string>) => {
        if (activeTab !== tab) setActiveTab(tab);
    }

    const onSubmitPaymentTx = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
        event.preventDefault();

        try {
            const params = await algodClient.getTransactionParams().do();
            const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
                suggestedParams: {
                    ...params,
                },
                from: accounts[0].address,
                to: receiver, note,
                amount: algosdk.algosToMicroalgos(amount),
            });

            const signedTxn = await connection.signTransaction(txn.toByte());
            // const response = await algodClient.sendRawTransaction(signedTxn.blob).do();
            setResponse(signedTxn);
        }
        catch (err) {
            console.error(err);
            setResponse(err.message);
        }
    }

    return (
        <div className="interactive-example">
            <Nav tabs>
                <NavItem>
                    <NavLink
                        className={activeTab === '1' ? "active active-tab" : ""}
                        onClick={() => { toggle('1'); }}>
                        Form
                    </NavLink>
                </NavItem>
                <NavItem>
                    <NavLink
                        className={activeTab === '2' ? "active active-tab" : ""}
                        onClick={() => { toggle('2'); }}>
                        Code
                </NavLink>
                </NavItem>
            </Nav>
            <TabContent activeTab={activeTab}>
                <TabPane tabId="1">
                    <Row className="mt-3">
                        <Col xs="12" lg="6" className="mt-2">
                            <Form id="payment-tx" onSubmit={onSubmitPaymentTx}>
                                <SenderDropdown onSelectSender={setAccounts} accounts={(window as any).sharedAccounts} />
                                <Address label="To" onChangeAddress={setReceiver} />
                                <Amount amount={amount} onChangeAmount={setAmount} />
                                <Note onChangeNote={setNote} />
                                <Button color="primary" className="mt-2" type="submit">
                                    Submit
                                </Button>
                            </Form>
                        </Col>
                        <Col xs="12" lg="6" className="mt-2 mt-xs-2">
                            <Label className="tx-label">
                                signTransaction() Response
                            </Label>
                            <div className="txn-payment-example-response">
                                <PrismCode
                                    code={response ? JSON.stringify(response, null, 1) : ""}
                                    language="js"
                                    plugins={["response"]}
                                />
                            </div>
                            <Button
                                className="button-margin"
                                color="primary"
                                block
                                disabled={!response}
                                onClick={() => setResponse("")}>
                                Clear Method Response
                            </Button>
                        </Col>
                    </Row>
                </TabPane>
                <TabPane tabId="2">
                    <div className="mt-4"> The following codes allow you to create and sent to MyAlgo Connect a payment transaction to be sign by the user. There are two alternatives to create it. Pick the one you prefere.</div>
                    <Row className="mt-3">
                        <Col>
                            <Label className="tx-label">
                                Using Algosdk (Recommended)
                            </Label>
                            <PrismCode
                                code={codeV2}
                                language="js"
                            />
                        </Col>
                        <Col className="mt-4">
                            <Label className="tx-label">
                                Another alternative
                            </Label>
                            <PrismCode
                                code={codeV1}
                                language="js"
                            />
                        </Col>
                    </Row>
                </TabPane>
            </TabContent>
        </div>
    )
}