import algosdk from "algosdk";
import React, { FormEvent, useState } from "react";
import { Button, Col, Container, Form, Label, Nav, NavItem, NavLink, Row, TabContent, TabPane } from "reactstrap";
import Address from "../test/components/commons/Address";
import Amount from "../test/components/commons/Amount";
import AssetIndex from "../test/components/commons/AssetId";
import PrismCode from '../test/components/commons/Code';
import SenderDropdown from "../test/components/commons/FromDropdown";
import Note from "../test/components/commons/Note";
import { algodClient, connection } from '../test/utils/connections';
import "./interactive-examples.scss";

const algoSdkCode = `
import algosdk from "algosdk";
import MyAlgoConnect from '@randlabs/myalgo-connect';
 
const algodClient = new algosdk.Algodv2("",'https://api.testnet.algoexplorer.io', '');
const params = await algodClient.getTransactionParams().do();

const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    suggestedParams: {
        ...params,
    },
    from: sender,
    to: receiver,
    assetIndex: 12400859,
    amount: amount,
    note: note
});

const myAlgoConnect = new MyAlgoConnect();
const signedTxn = await myAlgoConnect.signTransaction(txn.toByte());
`;

const anotherAlternativeCode = `
import algosdk from "algosdk";
import MyAlgoConnect from '@randlabs/myalgo-connect';
 
const algodClient = new algosdk.Algodv2("",'https://api.testnet.algoexplorer.io', '');
const params = await algodClient.getTransactionParams().do();

const txn = {
    ...params,
    type: 'axfer',
    from: sender,
    to: receiver,
    assetIndex: 12400859,
    amount: amount,
    note: note
};

const myAlgoConnect = new MyAlgoConnect();
const signedTxn = await myAlgoConnect.signTransaction(txn);
`;

export default function ASATransactionExample(): JSX.Element {
    const accountsList = window.sharedAccounts && Array.isArray(window.sharedAccounts) ? window.sharedAccounts : [];
    const [accounts, setAccounts] = useState(accountsList);
    const [note, setNote] = useState<Uint8Array | undefined>();
    const [receiver, setReceiver] = useState("");
    const [amount, setAmount] = useState(0);
    const [assetIndex, setAssetIndex] = useState(12400859);
    const [response, setResponse] = useState({});
    const [activeTab, setActiveTab] = useState('1');

    const toggle = (tab: React.SetStateAction<string>) => {
        if (activeTab !== tab) setActiveTab(tab);
    }

    const onSubmitAsaTransferTx = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
        event.preventDefault();

        try {
            const params = await algodClient.getTransactionParams().do();
            if (!params || accounts.length === 0 || receiver.length === 0) return;

            const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
                suggestedParams: {
                    ...params,
                    fee: 1000,
                    flatFee: true,
                },
                from: accounts[0].address,
                to: receiver, note,
                amount: algosdk.algosToMicroalgos(amount) * 100,
                assetIndex: assetIndex
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
                            <Form id="payment-tx" onSubmit={onSubmitAsaTransferTx}>
                                <SenderDropdown onSelectSender={setAccounts} accounts={accounts} />
                                <Address label="To" onChangeAddress={setReceiver} />
                                <Amount amount={amount} decimals={8} onChangeAmount={setAmount} />
                                <AssetIndex assetIndex={assetIndex} disabled={true} onChangeAssetIndex={setAssetIndex} />
                                <Note onChangeNote={setNote} />
                                <Button color="primary" block type="submit" className="mt-2" >
                                    Submit
                                </Button>
                            </Form>
                        </Col>
                        <Col xs="12" lg="6" className="mt-2 mt-xs-2">
                            <Label className="tx-label">
                                signTransaction() Response
                            </Label>
                            <div className="response-base txn-asa-transfer-response">
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
                    <div className="mt-4"> The following codes allow you to create and sent to MyAlgo Connect a asset payment transaction to be sign by the user. There are two alternatives to create it. Pick the one you prefere.</div>
                    <Row className="mt-3">
                        <Col>
                            <Label className="tx-label">
                                Using Algosdk (Recommended)
                            </Label>
                            <PrismCode
                                code={algoSdkCode}
                                language="js"
                            />
                        </Col>
                        <Col className="mt-4">
                            <Label className="tx-label">
                                Another alternative
                            </Label>
                            <PrismCode
                                code={anotherAlternativeCode}
                                language="js"
                            />
                        </Col>
                    </Row>
                </TabPane>
            </TabContent>
        </div>
    )
}