import algosdk from "algosdk";
import React, { FormEvent, useContext, useState } from "react";
import { Button, Col, Container, Label, Row } from "reactstrap";
import { AccountsContext } from "../../context/accountsContext";
import { ParamsContext } from "../../context/paramsContext";
import { algodClient, connection } from '../../utils/connections';
import PrismCode from '../commons/Code';
import "../operations/all.scss";

const codeV2 = `
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

const signedTxn = await connection.signTransaction(txn.toByte());
`;

export default function SignTransaction(): JSX.Element {
    const params = useContext(ParamsContext);
    const accounts = useContext(AccountsContext);

    const [note, setNote] = useState<Uint8Array | undefined>();
    const account = accounts.length > 0 ? accounts[0].address : "";
    const [sender, setSender] = useState();
    const [receiver, setReceiver] = useState("");
    const [amount, setAmount] = useState(0);
    const [response, setResponse] = useState("");
    const [activeTab, setActiveTab] = useState('1');

    const toggle = (tab: React.SetStateAction<string>) => {
        if (activeTab !== tab) setActiveTab(tab);
    }

    const onClickPaymentTx = async (): Promise<void> => {

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
                amount: algosdk.algosToMicroalgos(amount),
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
        <Row>
            <Col xs="12" lg="4">
                <h1>Sign transaction</h1>
                <Button color="primary" block onClick={onClickPaymentTx} disabled={ accounts.length === 0 }>
                    Sign Transaction
                </Button>
            </Col>
            <Col xs="12" lg="8">
                <PrismCode
                    code={codeV2}
                    language="js"
                />
            </Col>
        </Row>
    </Container>
}