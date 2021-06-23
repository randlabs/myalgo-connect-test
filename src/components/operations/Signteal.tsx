import React, { FormEvent, MouseEvent, useContext, useState } from "react";
import { Button, Col, Container, Form, Label, Nav, NavItem, NavLink, Row, TabContent, TabPane } from "reactstrap";
import { ParamsContext } from "../../context/paramsContext";
import { AccountsContext } from "../../context/accountsContext";
import Address from "../commons/Address";
import Amount from "../commons/Amount";
import SenderDropdown from "../commons/FromDropdown";
import Note from "../commons/Note";
import PrismCode from '../commons/Code';
import algosdk from "algosdk";
import { fromDecimal } from "../../utils/algorand";
import { algodClient, connection } from "../../utils/connections";


const codeV2 =
`
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

const lsig = algosdk.makeLogicSig(new Uint8Array(Buffer.from(compiledTeal, "base64")));
    
lsig.sig = await connection.signLogicSig(lsig.logic, sender);

const signedTxn = algosdk.signLogicSigTransaction(preparedTxn, lsig);
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

export default function SignTeal(): JSX.Element {
    const params = useContext(ParamsContext);
    const accounts = useContext(AccountsContext);

    const [note, setNote] = useState<Uint8Array | undefined>();
    const [sender, setSender] = useState(accounts[0].address);
    const [receiver, setReceiver] = useState("");
    const [amount, setAmount] = useState(0);
    const [response, setResponse] = useState("");
    const [activeTab, setActiveTab] = useState('1');
    const [teal, setTeal] = useState("");
    const [preparedTxn, setTxn] = useState<algosdk.Transaction|null>(null);

    const toggle = (tab: React.SetStateAction<string>) => {
        if (activeTab !== tab) setActiveTab(tab);
    }

    const onPrepareTransaction = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
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
                amount: fromDecimal(amount ? amount : "0", 6),
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
    
            lsig.sig = await connection.signLogicSig(lsig.logic, sender);
    
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

    return <Container className="mt-5">
    <Row className="mt-4">
        <Col xs="12" sm="6">
            <h1>Payment transaction with teal</h1>
            <p>Make a payment transaction and send it by a signed stateless teal</p>
        </Col>
    </Row>
    <div>
        <Nav tabs>
            <NavItem>
                <NavLink
                    className={activeTab === '1' ? "active active-tab" : ""}
                    onClick={() => { toggle('1'); }}>
                    Sign Teal Form
                </NavLink>
            </NavItem>
            <NavItem>
                <NavLink
                    className={activeTab === '2' ? "active active-tab" : ""}
                    onClick={() => { toggle('2'); }}>
                    Sign Teal Code
            </NavLink>
            </NavItem>
        </Nav>
        <TabContent activeTab={activeTab}>
            <TabPane tabId="1">
                <Row className="mt-3">
                    <Col xs="12" lg="6" className="mt-2">
                            <Form id="payment-tx" onSubmit={onPrepareTransaction}>
                                <SenderDropdown onSelectSender={setSender} disabled={!!preparedTxn}/>
                                <Address label="To" onChangeAddress={setReceiver} disabled={!!preparedTxn}/>
                                <Amount onChangeAmount={setAmount} disabled={!!preparedTxn}/>
                                <Note onChangeNote={setNote} disabled={!!preparedTxn}/>
                                {
                                    preparedTxn === null || teal.length === 0 ?
                                    <Button color="primary" block type="submit">
                                        Prepare Teal
                                    </Button>
                                    : <Button color="primary" block onClick = {onSubmitSignTeal}>
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
                    <Col xs="12" lg="6">
                        <Label className="tx-label">
                            Sign stateless teal
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