import algosdk from "algosdk";
import React, { FormEvent, useContext, useState } from "react";
import { Button, Col, Container, Form, Label, Nav, NavItem, NavLink, Row, TabContent, TabPane } from "reactstrap";
import { AppContext, IAppContext } from "../../context/appContext";
import AddressDropdown from "../commons/AddressDropdown";
import AppIndex from "../commons/AppIndex";
import PrismCode from '../commons/Code';

const codeV1 = `
const txn = {
    ...params,
    fee: 1000,
    flatFee: true,
    type: "appl",
    from: sender,
    appApprovalProgram: new Uint8Array(Buffer.from("AiADAAEFIjEYEkEAAiNDMRkkEg==", "base64")),
    appClearProgram: new Uint8Array(Buffer.from("AiABASJD", "base64")),
    appOnComplete: 4,
}

const signedTxn = await connection.signTransaction(txn);
`;

const codeV2 = `
const txn = algosdk.makeApplicationUpdateTxnFromObject({
    suggestedParams: {
        ...params,
        fee: 1000,
        flatFee: true,
    },
    from: sender,
    approvalProgram: new Uint8Array(Buffer.from("AiADAAEFIjEYEkEAAiNDMRkkEg==", "base64")),
    clearProgram: new Uint8Array(Buffer.from("AiABASJD", "base64")),
});

const signedTxn = await connection.signTransaction(txn.toByte());
`;

export default function AppUpdate(): JSX.Element {
    const context: IAppContext = useContext(AppContext);

    const applProgram = "AiAEAAUEASYDB0NyZWF0b3IMTGFzdE1vZGlmaWVyBUNvdW50IjEYEkEADigxAGcpMQBnKiJnQgApMRkjEkAACjEZJBJAAA5CABgoZDEAEkEAEkIADSkxAGcqKmQlCGdCAAAlQyJDIgBD";

    const appIndex = 17155035;

    const [sender, setSender] = useState(context.accounts[0].address);
    const [response, setResponse] = useState("");
    const [activeTab, setActiveTab] = useState('1');

    const toggle = (tab: React.SetStateAction<string>) => {
        if (activeTab !== tab) setActiveTab(tab);
    }

    const onSubmitUpdateAppl = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
        event.preventDefault();

        try {
            if (sender.length === 0) return;

            const params = await context.algodClient.getTransactionParams().do();

            const txn = algosdk.makeApplicationUpdateTxnFromObject({
                suggestedParams: {
                    ...params,
                    fee: 1000,
                    flatFee: true,
                },
                from: sender,
                approvalProgram: new Uint8Array(Buffer.from(applProgram, "base64")),
                clearProgram: new Uint8Array(Buffer.from("AiABASJD", "base64")),
                appIndex: appIndex,
            });

            const signedTxn = await context.connection.signTransaction(txn);
            const response = await context.algodClient.sendRawTransaction(signedTxn).do();

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
                <h1>Application Update transaction</h1>
                <p>Make an appl update transaction</p>
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
                            <Form id="payment-tx" onSubmit={onSubmitUpdateAppl}>
                                <AddressDropdown onSelectSender={setSender} />
                                <AppIndex disabled={true} value={appIndex.toString()} onChangeAppIndex={() => {}}/>
                                <Button color="primary" block type="submit">
                                    Submit
                                </Button>
                            </Form>
                        </Col>
                        <Col xs="12" lg="6" className="mt-2 mt-xs-2">
                            <Label className="tx-label">
                                Response
                            </Label>
                            <div className="txn-appl-update-response">
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