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

const codeV2 =
`
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

const lsig = algosdk.makeLogicSig(new Uint8Array(Buffer.from(compiledTeal, "base64")));
lsig.sig = await myAlgoConnect.signLogicSig(lsig.logic, sender);

const signedTxn = algosdk.signLogicSigTransaction(txn, lsig);
`

const statelessTeal =
`
txn Amount
int 0
>=
txn Fee
int 1000
==
&&
txn Type
byte "pay"
==
txn TxID
byte b32 $REPLACE_FOR_TXID
==
&&
&&
`

export default function SignTealExample(): JSX.Element {
    const accountsList = window.sharedAccounts && Array.isArray(window.sharedAccounts) ? window.sharedAccounts : [];
    const [accounts, setAccounts] = useState(accountsList);
    const [note, setNote] = useState<Uint8Array | undefined>();
    const [receiver, setReceiver] = useState("");
    const [amount, setAmount] = useState(0);
    const [response, setResponse] = useState("");
    const [activeTab, setActiveTab] = useState('1');
    const [teal, setTeal] = useState("");
    const [preparedTxn, setTxn] = useState<algosdk.Transaction | null>(null);

    const toggle = (tab: React.SetStateAction<string>) => {
        if (activeTab !== tab) setActiveTab(tab);
    }

    const onPrepareTransaction = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
        event.preventDefault();
        try {
            const params = await algodClient.getTransactionParams().do();
            if (!params || accounts.length === 0 || receiver.length === 0) return;

            const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
                suggestedParams: {
                    ...params,
                    fee: 1000,
                    flatFee: true,
                },
                from: accounts,
                to: receiver, note,
                amount: algosdk.algosToMicroalgos(amount),
            });

            const rTeal = statelessTeal.replace("$REPLACE_FOR_TXID", `${txn.txID()}`);
            const compiledTeal = await algodClient.compile(rTeal).do();

            setTxn(txn);
            setTeal(compiledTeal.result);
        }
        catch (err) {
            setResponse(JSON.stringify(err, null, 4));
        }
    }

    const onSubmitSignTeal = async (event: MouseEvent) => {
        event.preventDefault();

        try {
            if (preparedTxn === null || teal.length === 0) return;

            const lsig = algosdk.makeLogicSig(new Uint8Array(Buffer.from(teal, "base64")));

            lsig.sig = await connection.signLogicSig(lsig.logic, accounts);

            const signedTxn = algosdk.signLogicSigTransaction(preparedTxn, lsig);

            const response = await algodClient.sendRawTransaction(signedTxn.blob).do();

            setResponse(response);
        }
        catch (err) {
            setResponse(JSON.stringify(err, null, 4));
        }
        setTxn(null);
        setTeal("");
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
                            <Form id="payment-tx" onSubmit={onPrepareTransaction}>
                                <SenderDropdown onSelectSender={setAccounts} disabled={!!preparedTxn} accounts={accounts} />
                                <Address label="To" onChangeAddress={setReceiver} disabled={!!preparedTxn} />
                                <Amount amount={amount} onChangeAmount={setAmount} disabled={!!preparedTxn} />
                                <Note onChangeNote={setNote} disabled={!!preparedTxn} />
                                {
                                    preparedTxn === null || teal.length === 0 ?
                                        <Button color="primary" block type="submit" className="mt-2">
                                            Prepare Teal
                                        </Button>
                                        : <Button color="primary" block className="mt-2" onClick={() => onSubmitSignTeal}>
                                            Submit
                                        </Button>
                                }
                            </Form>
                        </Col>
                        <Col xs="12" lg="6" className="mt-2 mt-xs-2">
                            <Label className="tx-label">
                                Response
                        </Label>
                            <div className="response-base txn-payment-response">
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
                                Clear Response
                        </Button>
                        </Col>
                    </Row>
                </TabPane>
                <TabPane tabId="2">
                    <Row className="mt-3">
                        <Col>
                            <Label className="tx-label">
                                Sign stateless teal
                            </Label>
                            <PrismCode
                                code={codeV2}
                                language="js"
                            />
                        </Col>
                        <Col className="mt-2">
                            <Label className="tx-label">
                                Teal to sign
                            </Label>
                            <PrismCode
                                code={statelessTeal}
                                language="js"
                            />
                        </Col>
                    </Row>
                </TabPane>
            </TabContent>
        </div>
    )
}