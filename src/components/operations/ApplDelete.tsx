import algosdk from "algosdk";
import React, { FormEvent, useContext, useState } from "react";
import { Button, Col, Container, Form, Label, Nav, NavItem, NavLink, Row, TabContent, TabPane } from "reactstrap";
import { AppContext, IAppContext } from "../../context/appContext";
import AddressDropdown from "../commons/AddressDropdown";
import AppIndex from "../commons/AppIndex";
import PrismCode from '../commons/Code';
import "./all.scss";

const codeV1 = `
const txn : any = {
    ...params,
    type: "appl",
    appOnComplete: 5, // OnApplicationComplete.DeleteApplicationOC
    from: sender,
    appIndex: 17140470,
};

const signedTxn = await connection.signTransaction(txn);
`;

const codeV2 = `
const txn = algosdk.makeApplicationDeleteTxnFromObject({
    suggestedParams: {
        ...params,
        fee: 1000,
        flatFee: true,
    },
    from: sender,
    appIndex: 17140470,
});

const signedTxn = await connection.signTransaction(txn.toByte());
`;

export default function AppDelete(): JSX.Element {
    const context: IAppContext = useContext(AppContext);

    const [appIndex, setAppIndex] = useState("17140470");
    const [sender, setSender] = useState(context.accounts[0].address);
    const [response, setResponse] = useState("");
    const [activeTab, setActiveTab] = useState('1');

    const toggle = (tab: React.SetStateAction<string>) => {
        if (activeTab !== tab) setActiveTab(tab);
    }

    const onSubmitDeleteApplTx = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
        event.preventDefault();

        try {
            if (sender.length === 0 || !appIndex) return;

            const params = await context.algodClient.getTransactionParams().do();

            const txn = algosdk.makeApplicationDeleteTxnFromObject({
                suggestedParams: {
                    ...params,
                    fee: 1000,
                    flatFee: true,
                },
                from: sender,
                appIndex: parseInt(appIndex),
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
                <h1>Application Delete transaction</h1>
                <p>Make an appl delete transaction</p>
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
                            <Form id="payment-tx" onSubmit={onSubmitDeleteApplTx}>
                                <AddressDropdown onSelectSender={setSender} />
                                <AppIndex onChangeAppIndex={setAppIndex} />
                                <Button color="primary" block type="submit">
                                    Submit
                                </Button>
                            </Form>
                        </Col>
                        <Col xs="12" lg="6" className="mt-2 mt-xs-2">
                            <Label className="tx-label">
                                Response
                            </Label>
                            <div className="txn-appl-delete-response">
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