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
    const txn: any = {
        fee: 1000,
        flatFee: true,
        type: "pay",
        from: sender,
        to: receiver,
        amount: fromDecimal(amount ? amount : "0", 6),
        note: note ? Buffer.from(note).toString("base64") : "",
        firstRound: params.firstRound,
        lastRound: params.lastRound,
        genesisHash: params.genesisHash,
        genesisID: params.genesisID,
    };

    if (!txn.note || txn.note.length === 0)
    delete txn.note;
    const signedTxn = await connection.signTransaction(txn);
`;

const codeV2 = `
(async () => {
  try {
    const algodClient = new algosdk.Algodv2('', 'https://api.testnet.algoexplorer.io', '');
    const params = await algodClient.getTransactionParams().do();
      
    const txn = {
        ...params,
        type: 'pay',
        from: accounts[0].address,
        to:  '...',
        amount: 1000000, // 1 algo
        note: new Uint8Array(Buffer.from('...')),
    };
  
    const signedTxn = await myAlgoWallet.signTransaction(txn);
    console.log(signedTxn);

    await algodClient.sendRawTransaction(signedTxn.blob).do();
  }
  catch(err) {
    console.error(err); 
  }
})();
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
            console.log(sender);
            if (!params || sender.length === 0 || receiver.length === 0) return;

            /* JSON-LIKE */
            // const txn: any = {
            //     fee: 1000,
            //     flatFee: true,
            //     type: "pay",
            //     from: sender,
            //     to: receiver,
            //     amount: fromDecimal(amount ? amount : "0", 6),
            //     note: note ? Buffer.from(note).toString("base64") : "",
            //     firstRound: params.firstRound,
            //     lastRound: params.lastRound,
            //     genesisHash: params.genesisHash,
            //     genesisID: params.genesisID,
            // };
            // if (!txn.note || txn.note.length === 0)
            //     delete txn.note;
            // const signedTxn = await connection.signTransaction(txn);

            /* Algosdk encoded */
            const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
                suggestedParams: {
                    ...params,
                    fee: 1000,
                    flatFee: true,
                },
                from: sender,
                to: receiver, note,
                amount: fromDecimal(amount ? amount : "0", 6),
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
            <Col xs="12" sm="6">
                <h1>Payment transaction</h1>
                <p>Make a payment transaction (with note)</p>
            </Col>
        </Row>
        <div>
            <Nav tabs>
                <NavItem>
                    <NavLink
                        className={activeTab === '1' ? "active active-tab" : ""}
                        onClick={() => { toggle('1'); }}>
                        Payment Form
                    </NavLink>
                </NavItem>
                <NavItem>
                    <NavLink
                        className={activeTab === '2' ? "active active-tab" : ""}
                        onClick={() => { toggle('2'); }}>
                        Payment Code
                </NavLink>
                </NavItem>
            </Nav>
            <TabContent activeTab={activeTab}>
                <TabPane tabId="1">
                    <Row className="mt-3">
                        <Col xs="6" lg="6">
                            <Form id="payment-tx" onSubmit={onSubmitPaymentTx}>
                                <SenderDropdown onSelectSender={setSender} />
                                <Address label="To" onChangeAddress={setReceiver} />
                                <Amount onChangeAmount={setAmount} />
                                <Note onChangeNote={setNote} />
                                <Button color="primary" block type="submit">
                                    Submit
                                </Button>
                            </Form>

                        </Col>
                        <Col xs="6" lg="6">
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
                        <Col xs="6" lg="6">
                            <Label className="tx-label">
                                New way
                            </Label>
                            <PrismCode
                                code={codeV1}
                                language="js"
                            />
                        </Col>
                        <Col xs="6" lg="6">
                            <Label className="tx-label">
                                Old way
                            </Label>
                            <PrismCode
                                code={codeV2}
                                language="js"
                            />
                        </Col>
                    </Row>
                </TabPane>
            </TabContent>
        </div>
    </Container>
}