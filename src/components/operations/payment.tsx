import React, { useState, FormEvent, useContext } from "react";
import { Button, Col, Container, Form, Row } from "reactstrap";
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

const code = `
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

    const [ note, setNote ] = useState<Uint8Array|undefined>();
    const [ sender, setSender ] = useState(accounts[0].address);
    const [ receiver, setReceiver ] = useState("");
    const [ amount, setAmount ] = useState(0);
    const [ response, setResponse ] = useState("");

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
            })
            const signedTxn = await connection.signTransaction(txn.toByte());
            const response = await algodClient.sendRawTransaction(signedTxn.blob).do();
    
            setResponse(response);
        }
        catch (err) {
            console.error(err);
            setResponse(err.message);
        }
    }


    return  <Container className="mt-5 pb-5">
        <Row className="mt-4">
            <Col xs="12" sm="6">
                <h1>Payment transaction</h1>
                <p>Make a payment transaction (with note)</p>
            </Col>
        </Row>
        <Col xs="12" lg="6">
                <Form id="payment-tx" onSubmit={onSubmitPaymentTx}>
                <SenderDropdown onSelectSender = { setSender } />
                <Address label = "To" onChangeAddress = { setReceiver } />
                <Amount onChangeAmount = { setAmount } />
                <Note onChangeNote = { setNote } />
                <Button color="primary" block type="submit">
                    Submit
                </Button>
            </Form>
            <PrismCode
                code={response ? JSON.stringify(response, null, 1) : "response"}
                language="js"
                plugins={["response"]}
            />
        </Col>
        <Col xs="12" lg="6">
            <PrismCode
                code={code}
                language="js"
            />
            <Button
                color="primary"
                disabled={!response}
                onClick={() => setResponse("")}
            >
                Clear Response
            </Button>
        </Col>
    </Container>
}