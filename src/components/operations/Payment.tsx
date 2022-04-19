import React, { useState, FormEvent, useContext } from "react";
import { Button, Col, Container, Form, Label, Nav, NavItem, NavLink, Row, TabContent, TabPane } from "reactstrap";
import Note from "../commons/Note";
import Address from "../commons/Address";
import Amount from "../commons/Amount";
import AddressDropdown from "../commons/AddressDropdown";
import PrismCode from '../commons/Code';
import algosdk from "algosdk";
import { ParamsContext } from "../../context/paramsContext";
import { connection, algodClient } from '../../utils/connections';
import { AccountsContext } from "../../context/accountsContext";
import "./all.scss";

const codeV1 = `
const txn: any = {
    ...params,
    fee: 1000,
    flatFee: true,
    type: "pay",
    from: sender,
    to: receiver,
    amount: 1000000, // 1 Algo
    note: new Uint8Array(Buffer.from("...")),
};

const signedTxn = await connection.signTransaction(txn);
`;

const codeV2 = `
const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    suggestedParams: {
        ...params,
        fee: 1000,
        flatFee: true,
    },
    from: sender,
    to: receiver, 
    amount: 1000000, // 1 Algo
    note: note
});

const signedTxn = await connection.signTransaction(txn.toByte());
`;

export default function Payment(): JSX.Element {
    const params = useContext(ParamsContext);
    const accounts = useContext(AccountsContext);

    const [note, setNote] = useState<Uint8Array | undefined>();
    const [sender, setSender] = useState(accounts[0].address);
    const [receiver, setReceiver] = useState("");
    const [amount, setAmount] = useState(0);
    const [response, setResponse] = useState("");
    const [activeTab, setActiveTab] = useState('1');

    const toggle = (tab: React.SetStateAction<string>) => {
        if (activeTab !== tab) setActiveTab(tab);
    }

    const onSubmitPaymentTx = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
        event.preventDefault();

        try {
            if (!params || sender.length === 0 || receiver.length === 0) return;

            const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
                suggestedParams: {
                    ...params,
                    fee: 1000,
                    flatFee: true,
                },
                from: sender,
                to: receiver, note,
                amount: algosdk.algosToMicroalgos(amount),
            });

            const signedTxn = await connection.signTransaction(txn.toByte());
            const response = await algodClient.sendRawTransaction(signedTxn.blob).do();

            setResponse(response);
        }
        catch (err: any) {
            console.error(err);
            setResponse(err.message);
        }
    }

    return <Container className="mt-5 pb-5">
        <Row className="mt-4">
            <Col>
                <h1>Payment transaction</h1>
                <p>Make a payment transaction</p>
            </Col>
        </Row>
        <div>
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
                                <AddressDropdown onSelectSender={setSender} />
                                <Address label="To" onChangeAddress={setReceiver} />
                                <Amount amount={amount} onChangeAmount={setAmount} />
                                <Note onChangeNote={setNote} />
                                <Button color="primary" block type="submit">
                                    Submit
                                </Button>
                            </Form>
                        </Col>
                        <Col xs="12" lg="6" className="mt-2 mt-xs-2">
                            <Label className="tx-label">
                                Response
                            </Label>
                            <div className="txn-payment-response">
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
                        <Col xs="12" lg="6">
                            <Label className="tx-label">
                                Using Algosdk (Recommended)
                            </Label>
                            <PrismCode
                                code={codeV2}
                                language="js"
                            />
                        </Col>
                        <Col xs="12" lg="6" className="mt-xs-4">
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
    </Container>
}