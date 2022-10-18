import algosdk from "algosdk";
import React, { FormEvent, useContext, useState } from "react";
import { Button, Col, Container, Form, Label, Nav, NavItem, NavLink, Row, TabContent, TabPane } from "reactstrap";
import nacl from "tweetnacl";
import { AppContext, IAppContext } from "../../context/appContext";
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
    const context: IAppContext = useContext(AppContext);

    const [signer, setSigner] = useState(context.accounts[0].address);
    const [data, setData] = useState<Uint8Array>(new Uint8Array([]));
    const [contractAddress, setContractAddress] = useState("");
    const [response, setResponse] = useState("");
    const [activeTab, setActiveTab] = useState('1');
    const [verificationResult, setVerificationResult] = useState<boolean | undefined>();

    const toggle = (tab: React.SetStateAction<string>) => {
        if (activeTab !== tab) setActiveTab(tab);
    }

    const onSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
        event.preventDefault();

        try {
            if (signer.length === 0 || contractAddress.length === 0 || (data.length === 0)) return;

            const signature = await context.connection.tealSign(data, contractAddress, signer)

            setResponse(Buffer.from(signature).toString('base64'));
        }
        catch (err: any) {
            console.error(err);
            setResponse(err.message);
        }
    }

    const clearResponse = (): void => {
        setResponse("");
        setVerificationResult(undefined);
    }

    const verifyResponse = async (): Promise<void> => {
        const contractPk = algosdk.decodeAddress(contractAddress).publicKey;
        const signerPk = algosdk.decodeAddress(signer).publicKey;

        const expected = Buffer.concat([
            Buffer.from('ProgData', 'ascii'),
            Buffer.from(contractPk),
            Buffer.from(data)
        ]);

        const verified = nacl.sign.detached.verify(expected, Buffer.from(response, 'base64'), signerPk);
        setVerificationResult(verified);
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
                                <AddressDropdown label="Signer" onSelectSender={setSigner} />
                                <Address label="Contract Address" onChangeAddress={setContractAddress} />
                                <Note label="Data to sign" onChangeNote={setData} />
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
                                onClick={() => clearResponse()}>
                                Clear Response
                            </Button>

                            <Button
                                className="button-margin"
                                color="primary"
                                block
                                disabled={!response}
                                onClick={() => verifyResponse()}>
                                Verify response
                            </Button>

                            {response && (verificationResult===true) && (
                                <Label className="tx-label">Verification: Ok!</Label>
                            )}

                            {response && (verificationResult===false) && (
                                <Label className="tx-label">Verification: Not Ok!</Label>
                            )}
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