import algosdk from "algosdk";
import React, { FormEvent, useContext, useState } from "react";
import { Button, Col, Container, Form, Label, Nav, NavItem, NavLink, Row, TabContent, TabPane } from "reactstrap";
import { AccountsContext } from "../../context/accountsContext";
import { ParamsContext } from "../../context/paramsContext";
import { algodClient, connection } from '../../utils/connections';
import Integer from "../commons/Integer";
import PrismCode from '../commons/Code';
import SenderDropdown from "../commons/FromDropdown";
import "./all.scss";

const codeV1 = `
const txn = {
    ...params,
    fee: 1000,
    flatFee: true,
    type: "appl",
    from: sender,
    appLocalByteSlices: 4,
    appGlobalByteSlices: 2,
    appLocalInts: 0,
    appGlobalInts: 2,
    appApprovalProgram: new Uint8Array(Buffer.from("AiADAAEFIjEYEkEAAiNDMRkkEg==", "base64")),
    appClearProgram: new Uint8Array(Buffer.from("AiABASJD", "base64")),
    appOnComplete: 0,
}

const signedTxn = await connection.signTransaction(txn);
`;

const codeV2 = `
const txn = algosdk.makeApplicationCreateTxnFromObject({
    suggestedParams: {
        ...params,
        fee: 1000,
        flatFee: true,
    },
    from: sender,
    numLocalByteSlices: 4,
    numGlobalByteSlices: 2,
    numLocalInts: 0,
    numGlobalInts: 2,
    approvalProgram: new Uint8Array(Buffer.from("AiADAAEFIjEYEkEAAiNDMRkkEg==", "base64")),
    clearProgram: new Uint8Array(Buffer.from("AiABASJD", "base64")),
    onComplete: 0,
});

const signedTxn = await connection.signTransaction(txn.toByte());
`;

export default function AppCreate(): JSX.Element {
    const params = useContext(ParamsContext);
    const accounts = useContext(AccountsContext);
    const [localInt, setLocalInt] = useState(0);
    const [globalInt, setGlobalInt] = useState(0);
    const [localBytes, setLocalBytes] = useState(0);
    const [globalBytes, setGlobalBytes] = useState(0);
    const [sender, setSender] = useState(accounts[0].address);
    const [response, setResponse] = useState("");
    const [activeTab, setActiveTab] = useState('1');

    const toggle = (tab: React.SetStateAction<string>) => {
        if (activeTab !== tab) setActiveTab(tab);
    }

    const onSubmitCreateAppl = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
        event.preventDefault();

        try {
            if (!params || sender.length === 0) return;

            const txn = algosdk.makeApplicationCreateTxnFromObject({
                suggestedParams: {
                    ...params,
                    fee: 1000,
                    flatFee: true,
                },
                from: sender,
                numLocalByteSlices: localBytes || 0,
                numGlobalByteSlices: globalBytes || 0,
                numLocalInts: localInt || 0,
                numGlobalInts: globalInt || 0,
                approvalProgram: new Uint8Array(Buffer.from("AiADAAEFIjEYEkEAAiNDMRkkEg==", "base64")),
                clearProgram: new Uint8Array(Buffer.from("AiABASJD", "base64")),
                onComplete: 0,
            });

            const signedTxn = await connection.signTransaction(txn.toByte());
            const response = await algodClient.sendRawTransaction(signedTxn.blob).do();

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
                <h1>Application Create transaction</h1>
                <p>Make an appl create transaction</p>
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
                            <Form id="payment-tx" onSubmit={onSubmitCreateAppl}>
                                <SenderDropdown onSelectSender={setSender} />
                                <Integer label="Local Bytes" onChangeNumber={setLocalBytes} />
                                <Integer label="Global Bytes" onChangeNumber={setGlobalBytes} />
                                <Integer label="Local Int" onChangeNumber={setLocalInt} />
                                <Integer label="Global Int" onChangeNumber={setGlobalInt} />
                                <Button color="primary" block type="submit">
                                    Submit
                                </Button>
                            </Form>
                        </Col>
                        <Col xs="12" lg="6" className="mt-2 mt-xs-2">
                            <Label className="tx-label">
                                Response
                            </Label>
                            <div className="txn-optin-response">
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