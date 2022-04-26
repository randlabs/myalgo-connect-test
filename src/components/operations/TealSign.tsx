import React, { FormEvent, useContext, useState } from "react";
import { Button, Col, Container, Form, Label, Nav, NavItem, NavLink, Row, TabContent, TabPane } from "reactstrap";
import { AccountsContext } from "../../context/accountsContext";
import { connection } from '../../utils/connections';
import Address from "../commons/Address";
import AddressDropdown from "../commons/AddressDropdown";
import PrismCode from '../commons/Code';
import Note from "../commons/Note";
import "./all.scss";

const codeV1 = `
const signer = '...'
const data = Buffer.from(...)
const contractAddress = '...'

const signature = await connection.tealSign(data, contractAddress, signer);
`;


export default function TealSign(): JSX.Element {
    const accounts = useContext(AccountsContext);

    const [signer, setSigner] = useState(accounts[0].address);
    const [data, setData] = useState<Uint8Array>(new Uint8Array([]));
    const [contractAddress, setContractAddress] = useState("");
    const [response, setResponse] = useState("");
    const [activeTab, setActiveTab] = useState('1');

    const toggle = (tab: React.SetStateAction<string>) => {
        if (activeTab !== tab) setActiveTab(tab);
    }

    const onSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
        event.preventDefault();

        try {
            if (signer.length === 0 || contractAddress.length === 0 || (data.length === 0)) return;

            const signature = await connection.tealSign(data, contractAddress, signer)

            setResponse(Buffer.from(signature).toString('base64'));
        }
        catch (err: any) {
            console.error(err);
            setResponse(err.message);
        }
    }

    return <Container className="mt-5 pb-5">
        <Row className="mt-4">
            <Col>
                <h1>Teal Signature</h1>
                <p>Sign data to verify in a TEAL program</p>
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
                            <Form id="payment-tx" onSubmit={onSubmit}>
                                <AddressDropdown onSelectSender={setSigner} />
                                <Address label="To" onChangeAddress={setContractAddress} />
                                <Note onChangeNote={setData} />
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
                        <Col xs="12" lg="6" className="mt-xs-4">
                            <Label className="tx-label">
                                Code
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