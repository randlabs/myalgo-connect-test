import React, { useState, FormEvent, useContext } from "react";
import { Button, Col, Container, Form, Label, Nav, NavItem, NavLink, Row, TabContent, TabPane } from "reactstrap";
import Note from "../commons/Note";
import Address from "../commons/Address";
import Amount from "../commons/Amount";
import SenderDropdown from "../commons/FromDropdown";
import PrismCode from '../commons/Code';
import algosdk from "algosdk";
import { ParamsContext } from "../../context/paramsContext";
import { fromDecimal } from "../../utils/algorand";
import { connection, algodClient } from '../../utils/connections';
import { AccountsContext } from "../../context/accountsContext";
import "./all.scss";

const codeV1 = `
const txn1: any = {
    ...params,
    fee: 1000,
    flatFee: true,
    type: "pay",
    from: sender,
    to: receiver1,
    amount: amount
};

const txn2: any = {
    ...params,
    fee: 1000,
    flatFee: true,
    type: "pay",
    from: sender,
    to: receiver2,
    amount: amount
};

const txnsArray = [ txn1, txn2 ];
const groupID = algosdk.computeGroupID(txnsArray)
for (let i = 0; i < 2; i++) txnsArray[i].group = groupID;
const signedTxns = await connection.signTransaction(txnsArray);
`;

const codeV2 = `
const txn1 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    suggestedParams: {
        ...params,
        fee: 1000,
        flatFee: true,
    },
    from: sender,
    to: receiver1, 
    amount: amount1
});

const txn2 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    suggestedParams: {
        ...params,
        fee: 1000,
        flatFee: true,
    },
    from: sender,
    to: receiver2, 
    amount: amount2
});

const txnsArray = [ txn1, txn2 ];
const groupID = algosdk.computeGroupID(txnsArray)
for (let i = 0; i < 2; i++) txnsArray[i].group = groupID;
const signedTxns = await connection.signTransaction(txnsArray.map(txn => txn.toByte()));
`;

export default function GroupTransaction(): JSX.Element {
    const params = useContext(ParamsContext);
    const accounts = useContext(AccountsContext);

    const [sender, setSender] = useState(accounts[0].address);
    const [receiver1, setReceiver1] = useState("");
    const [receiver2, setReceiver2] = useState("");
    const [amount1, setAmount1] = useState(0);
    const [amount2, setAmount2] = useState(0);
    const [response, setResponse] = useState("");
    const [activeTab, setActiveTab] = useState('1');

    const toggle = (tab: React.SetStateAction<string>) => {
        if (activeTab !== tab) setActiveTab(tab);
    }

    const onSubmitGroupTxns = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
        event.preventDefault();

        try {
            if (!params || sender.length === 0 || receiver1.length === 0 || receiver2.length === 0) return;

            const txn1 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
                suggestedParams: {
                    ...params,
                    fee: 1000,
                    flatFee: true,
                },
                from: sender,
                to: receiver1,
                amount: fromDecimal(amount1 ? amount1 : "0", 6),
            });

            const txn2 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
                suggestedParams: {
                    ...params,
                    fee: 1000,
                    flatFee: true,
                },
                from: sender,
                to: receiver2,
                amount: fromDecimal(amount2 ? amount2 : "0", 6),
            });

            const txArr = [ txn1, txn2 ];
            const groupID = algosdk.computeGroupID(txArr);

            for (let i = 0; i < 2; i++) {
              txArr[i].group = groupID;
            }

            const signedTxns = await connection.signTransaction(txArr.map(txn => txn.toByte()));
            const response = await algodClient.sendRawTransaction(signedTxns.map(tx => tx.blob)).do();

            setResponse(response);
        }
        catch (err) {
            console.error(err);
            setResponse(err.message);
        }
    }

    return <Container className="mt-5">
        <Row className="mt-4">
            <Col>
                <h1>Group transaction</h1>
                <p>Make a group transaction (e.g. same 2 Payment transactions)</p>
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
                            <Form id="payment-tx" onSubmit={onSubmitGroupTxns}>
                                <SenderDropdown onSelectSender={setSender} />
                                <Address label="To for Transaction 1" onChangeAddress={setReceiver1} />
                                <Amount label="Amount for Transaction 1" onChangeAmount={setAmount1} />
                                <Address label="To for Transaction 2" onChangeAddress={setReceiver2} />
                                <Amount label="Amount for Transaction 2"  onChangeAmount={setAmount2} />
                                <Button color="primary" block type="submit">
                                    Submit
                                </Button>
                            </Form>
                        </Col>
                        <Col xs="12" lg="6" className="mt-2 mt-xs-2">
                            <Label className="tx-label">
                                Response
                            </Label>
                            <div className="response-base txn-group-response">
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