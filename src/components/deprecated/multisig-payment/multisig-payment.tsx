import React, { Component, ReactNode, ChangeEvent, FormEvent, ReactElement } from 'react';
import { Container, Row, Col, Form, FormGroup, Label, Input,
    Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Button } from 'reactstrap';
import MyAlgo, { Accounts, Address, SignedTx, PaymentTxn } from '@randlabs/myalgo-connect';
import MaskedInput from 'react-text-mask';
import NumberFormat, { NumberFormatValues } from 'react-number-format';
import algosdk from "algosdk";


import { fromDecimal, validateAddress } from '../../../utils/algorand';
import PrismCode from '../../commons/Code';


const secretKey = algosdk.mnemonicToSecretKey("adapt cart soul such autumn post achieve polar sugar start hour avocado race believe toward goose juice crucial walk wisdom carry lamp recycle ability enough");

const msigParams: any = {
    version: 1,
    threshold: 2,
    addrs: [],
};

interface IMSigPaymentProps {
    connection: MyAlgo;
    accounts: Accounts[];
}

interface IMSigPaymentState {
    accounts: Accounts[];
    from: Accounts;
    isOpenDropdownFrom: boolean;

    msigAddr: Address;

    to: Address;
    validTo: boolean;

    amount: string;
    validAmount: boolean;

    note: string;
    validNote: boolean;

	noteb64: Uint8Array;
    response: any;
}

const code = `
(async () => {
    const txn = {
        ...params,
        type: 'pay',
        signer: accounts[0].address,
        from: multisigAccount,
        to:  '...',
        amount: 1000000, // 1 algo
        note: new Uint8Array(Buffer.from('...')),
    };
  
    // MyAlgo Signature
    const decodedObj = algosdk.decodeObj(signedTxn.blob);
    const decodedTxn = decodedObj.txn;

    const pks = msigParams.addrs.map((addr: string) => {
        return algosdk.decodeAddress(addr).publicKey;
    });

    const msigTxn = multisig.MultisigTransaction.from_obj_for_encoding(decodedTxn);

    const blob = multisig.createMultisigTransaction(
        msigTxn.get_obj_for_encoding(),
        { rawSig: decodedObj.sig, myPk: algosdk.decodeAddress(txn.signer).publicKey },
        { version: msigParams.version, threshold: msigParams.threshold, pks }
    );

    // Another signature
    const multisigTransaction = algosdk.appendSignMultisigTransaction(
        blob,
        msigParams,
        secretKey.sk
    );

    await algodClient.sendRawTransaction(multisigTransaction.blob).do();
})();
`;


class MultisigPayment extends Component<IMSigPaymentProps, IMSigPaymentState> {
    private addressMask: Array<RegExp>;

    constructor(props: IMSigPaymentProps) {
		super(props);

        const { accounts } = this.props;

        msigParams.addrs = [
            secretKey.addr,
            accounts[0].address
        ];

		this.state = {
            accounts,
            from: accounts[0],
            isOpenDropdownFrom: false,

            msigAddr: algosdk.multisigAddress(msigParams),

            to: "",
            validTo: false,

            amount: "",
            validAmount: false,

            note: "",
            validNote: false,

            noteb64: new Uint8Array(),
			response: null
		};

        this.addressMask = [];
		for (let i = 58; i > 0; i--) {
			this.addressMask.push(/[A-Z0-9]/iu);
		}

        this.onClearResponse = this.onClearResponse.bind(this);
        this.onToggleFrom = this.onToggleFrom.bind(this);
        this.onFromSelected = this.onFromSelected.bind(this);
        this.onChangeTo = this.onChangeTo.bind(this);
        this.onChangeAmount = this.onChangeAmount.bind(this);
        this.onChangeNote = this.onChangeNote.bind(this);
        this.onSubmitPaymentTx = this.onSubmitPaymentTx.bind(this);
	}

    componentDidUpdate(prevProps: IMSigPaymentProps): void {
		if (this.props.accounts !== prevProps.accounts) {
			const accounts = this.props.accounts;
            msigParams.addrs = [
                secretKey.addr,
                accounts[0].address
            ];
			this.setState({
                accounts,
                from: accounts[0],
                msigAddr: algosdk.multisigAddress(msigParams),
			});
		}
	}

    onClearResponse(): void {
        this.setState({
			response: null
		});
    }

    onToggleFrom(): void {
		this.setState({
			isOpenDropdownFrom: !this.state.isOpenDropdownFrom
		});
	}

    onFromSelected(account: Accounts): void {
        msigParams.addrs = [
            secretKey.addr,
            account.address
        ];
		this.setState({
			from: account,
            msigAddr: algosdk.multisigAddress(msigParams),
		});
	}

    async onChangeTo(event: ChangeEvent<HTMLInputElement>): Promise<void> {
		event.persist();

        const to = event.target.value;
        let validTo = true;

        if (!validateAddress(to)) {
			validTo = false;
		}
    
		this.setState({
			to,
            validTo
		});
	}

    onChangeAmount(values: NumberFormatValues): void {
		this.setState({
			amount: values.value,
            validAmount: typeof values.floatValue !== "undefined" && values.floatValue > 0
		});
	}

    onChangeNote(event: ChangeEvent<HTMLInputElement>): void {
        const note = event.target.value;
        let noteb64;

		if (note) {
			noteb64 = new Uint8Array(Buffer.from(note, "ascii"));
		}

		this.setState({
			note,
            validNote: note.length > 0,
			noteb64: typeof noteb64 !== "undefined" ? noteb64 : new Uint8Array()
		});
	}

    async onSubmitPaymentTx(event: FormEvent<HTMLFormElement>): Promise<void> {
		event.preventDefault();
        const { connection } = this.props;
        const { from, to, amount, noteb64 } = this.state;
    
        try {
            // const algodClient = new algosdk.Algodv2('', 'https://api.testnet.algoexplorer.io', '');
            // const params = await algodClient.getTransactionParams().do();

            // const txn: PaymentTxn = {
            //     fee: 1000,
            //     flatFee: true,
            //     type: "pay",
            //     signer: from.address,
            //     from: algosdk.multisigAddress(msigParams),
            //     to,
            //     amount: fromDecimal(amount ? amount : "0", 6),
            //     note: noteb64,
            //     firstRound: params.firstRound,
            //     lastRound: params.lastRound,
            //     genesisHash: params.genesisHash,
            //     genesisID: params.genesisID,
            // };

            // if (!txn.note || txn.note.length === 0)
            //     delete txn.note;
          
            // const signedTxn = await connection.signTransaction(txn);

            // // MyAlgo Signature
            // // @ts-ignore
            // const decodedObj: algosdk.EncodedSignedTransaction = algosdk.decodeObj(signedTxn.blob);
            // const decodedTxn = decodedObj.txn;

            // const pks = msigParams.addrs.map((addr: string) => {
            //     return algosdk.decodeAddress(addr).publicKey;
            // });
        
            // const msigTxn = multisig.MultisigTransaction.from_obj_for_encoding(decodedTxn);

            // const blob = multisig.createMultisigTransaction(
            //     msigTxn.get_obj_for_encoding(),
            //     { rawSig: decodedObj.sig, myPk: algosdk.decodeAddress(txn.signer).publicKey },
            //     { version: msigParams.version, threshold: msigParams.threshold, pks }
            // );

            // // Test signature
            // const multisigTransaction = algosdk.appendSignMultisigTransaction(
            //     blob,
            //     msigParams,
            //     secretKey.sk
            // );

            // let response;
            // if (!Array.isArray(signedTxn))
            //     response = await algodClient.sendRawTransaction(multisigTransaction.blob).do();

            // this.setState({
            //     response,
            //     to: "",
            //     validTo: false,
            //     amount: "",
            //     validAmount: false,
            //     note: "",
            //     validNote: false
            // });
        }
        catch(err) {
            this.setState({ response: err.message, });
        }
    }

    render(): ReactNode {
        const { isOpenDropdownFrom, accounts, from, to, validTo,
            amount, validAmount, note, msigAddr, response } = this.state;

        return (
            <Container className="mt-5 pb-5">
                <Row className="mt-4">
                    <Col xs="12" sm="6">
                        <h1>Multisig payment transaction</h1>
                        <p>Make a payment transaction with a multisig account</p>
                    </Col>
                </Row>
                <Row>
                    <Col xs="12" lg="6">
                        <Form
                            id="payment-tx"
                            onSubmit={this.onSubmitPaymentTx}
                        >
                            <FormGroup className="align-items-center">
                                <Label className="tx-label">
                                    From
                                </Label>
                                <Dropdown
                                    className="from-dropdown"
                                    isOpen={isOpenDropdownFrom}
                                    toggle={this.onToggleFrom}
                                >
                                    <DropdownToggle caret>
                                        <span className="text-ellipsis">
                                            {from.address}
                                        </span>
                                    </DropdownToggle>
                                    <DropdownMenu>
                                        {accounts.map((account): ReactElement => {
                                            return (
                                                <DropdownItem
                                                    onClick={() => this.onFromSelected(account)}
                                                    key={`account-${account.address}`}
                                                >
                                                    <span className="text-ellipsis">
                                                        {account.address}
                                                    </span>
                                                </DropdownItem>
                                            );
                                        })
                                        }
                                    </DropdownMenu>
                                </Dropdown>
                            </FormGroup>
                            <FormGroup className="align-items-center">
                                <Label className="tx-label">
                                    Multisig Address
                                </Label>
                                <MaskedInput
                                    className="form-control tx-input"
                                    mask={this.addressMask}
                                    value={msigAddr}
                                    placeholder=""
                                    placeholderChar=" "
                                    guide={false}
                                    disabled={true}
                                    required
                                />
                            </FormGroup>
                            <FormGroup className="align-items-center">
                                <Label className="tx-label">
                                    To
                                </Label>
                                <MaskedInput
                                    className="form-control tx-input"
                                    mask={this.addressMask}
                                    value={to}
                                    placeholder=""
                                    placeholderChar=" "
                                    guide={false}
                                    onChange={this.onChangeTo}
                                    required
                                />
						    </FormGroup>
                            <FormGroup className="align-items-center">
                               <Label className="tx-label">
                                    Amount
                                </Label>
                                <NumberFormat
                                    value={amount}
                                    onValueChange={this.onChangeAmount}
                                    className="form-control tx-input"
                                    placeholder="0.0"
                                    thousandSeparator={","}
                                    decimalSeparator={"."}
                                    decimalScale={6}
                                    allowNegative={false}
                                    isNumericString={true}
                                />
						</FormGroup>
                            <FormGroup>
                                <Label className="tx-label">
                                    Note
                                </Label>
                                <Input
                                    className="tx-input note"
                                    type="textarea"
                                    placeholder="Note"
                                    value={note}
                                    onChange={this.onChangeNote}
                                />
                            </FormGroup>
                            <Button
                                color="primary"
                                block
                                type="submit"
                                disabled={!validTo || !validAmount}
                            >
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
                            onClick={this.onClearResponse}
                        >
                            Clear Response
                        </Button>
                    </Col>
                </Row>
            </Container>
        );
    }
}

export default MultisigPayment;
