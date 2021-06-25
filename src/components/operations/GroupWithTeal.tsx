import React, { useState, useContext, FormEvent } from "react";
import { Button, Col, Container, Form, Label, Nav, NavItem, NavLink, Row, TabContent, TabPane } from "reactstrap";
import algosdk from "algosdk";
import { ParamsContext } from "../../context/paramsContext";
import { AccountsContext } from "../../context/accountsContext";
import SenderDropdown from "../commons/FromDropdown";
import Note from "../commons/Note";
import { algodClient, connection } from "../../utils/connections";
import PrismCode from '../commons/Code';

const program = new Uint8Array(Buffer.from("AiACAgAyBCISMwEIIxIQMwAIIxIQMwAHMwEAEhAzAQczAAASEDMBIDIDEhAzASAyAxIQMwEJMgMSEDMAIDIDEhAzACAyAxIQMwAJMgMSEA==", "base64"));


const codeV2 =
`
const lsig = algosdk.makeLogicSig(program);
    
const tx1 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    suggestedParams: params,
    from: sender,
    to: lsig.address(),
    amount: 0,
    note,
});

const tx2 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    suggestedParams: params,
    from: lsig.address(),
    to: sender,
    amount: 0,
    note,
});

const txs = algosdk.assignGroupID([ tx1, tx2 ]);
const signedTx1 = await connection.signTransaction(txs[0].toByte());
const signedTx2 = algosdk.signLogicSigTransaction(txs[1], lsig);
`;

const codeV1 =
`
const lsig = algosdk.makeLogicSig(program);
    
const tx1 = {
    ...params,
    flatFee: true,
    fee: 1000,
    type: "pay",
    from: sender,
    to: lsig.address(),
    amount: 0,
};

const tx2 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    suggestedParams: params,
    from: lsig.address(),
    to: sender,
    amount: 0,
    note,
});

const groupID = algosdk.computeGroupID([ tx1, tx2 ]);
const txs = [ tx1, tx2 ];
txs[0].group = groupID;
txs[1].group = groupID;

const signedTx1 = await connection.signTransaction(txs[0]);
const signedTx2 = algosdk.signLogicSigTransaction(txs[1], lsig);
`;


export default function GroupWithTeal(): JSX.Element {
    const params = useContext(ParamsContext);
    const accounts = useContext(AccountsContext);

    const [note, setNote] = useState<Uint8Array | undefined>();
    const [sender, setSender] = useState(accounts[0].address);
    const [response, setResponse] = useState("");
    const [activeTab, setActiveTab] = useState('1');

    const toggle = (tab: React.SetStateAction<string>) => {
        if (activeTab !== tab) setActiveTab(tab);
    }

    const onClickSubmit = async (e: FormEvent) => {
        e.preventDefault();

        try {
            if (!params || sender.length === 0) return;

            const lsig = algosdk.makeLogicSig(program);
    
            const tx1 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
                suggestedParams: params,
                from: sender,
                to: lsig.address(),
                amount: 0,
                note,
            });
        
            const tx2 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
                suggestedParams: params,
                from: lsig.address(),
                to: sender,
                amount: 0,
                note,
            });
        
            const txs = algosdk.assignGroupID([ tx1, tx2 ]);
            const signedTx1 = await connection.signTransaction(txs[0].toByte());
            const signedTx2 = algosdk.signLogicSigTransaction(txs[1], lsig);

            // TODO: Remove Later
            console.log("Signed by MyAlgo Connect")
            console.log("signedTx1", signedTx1);
            console.log("signedTx1Decoded", algosdk.decodeObj(signedTx1.blob));
            console.log("signedTx1Base64", Buffer.from(signedTx1.blob).toString("base64"));

            console.log("Signed by Stateless Teal")
            console.log("signedTx2", signedTx2);
            console.log("signedTx2Decoded", algosdk.decodeObj(signedTx2.blob));
            console.log("signedTx2Base64", Buffer.from(signedTx2.blob).toString("base64"));

            const response = await algodClient.sendRawTransaction([ signedTx1.blob, signedTx2.blob ]).do();

            setResponse(response);
        }
        catch (err) {
            console.error(err);
            setResponse(err.message);
        }
    }

    return <Container className="mt-5 pb-5">
        <Row className="mt-4">
            <Col>
                <h1>Group payment transaction</h1>
                <p>Make a group payment transaction</p>
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
                            <Form id="payment-tx" onSubmit={onClickSubmit}>
                                <SenderDropdown onSelectSender={setSender} />
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
                            <div className="txn-group-payment-response">
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