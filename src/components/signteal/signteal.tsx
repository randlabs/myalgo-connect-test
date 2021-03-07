import React, { Component, ReactNode, ChangeEvent, FormEvent, ReactElement, Fragment } from 'react';
import { Container, Row, Col, Form, FormGroup, Label, Input,
    Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Button } from 'reactstrap';
import MyAlgo, { Accounts, Address, SignedTx, PaymentTxn } from '@randlabs/myalgo-connect';
import MaskedInput from 'react-text-mask';
import NumberFormat, { NumberFormatValues } from 'react-number-format';
import algosdk from 'algosdk';

import { fromDecimal, validateAddress } from '../../utils/algorand';
import PrismCode from '../code/Code';


interface ISignTealProps {
    connection: MyAlgo;
    accounts: Accounts[];
}

interface ISignTealState {
    accounts: Accounts[];
    from: Accounts;
    isOpenDropdownFrom: boolean;

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
  try {
    const algodClient = new algosdk.Algodv2(
        '',
        'https://api.testnet.algoexplorer.io',
        ''
    );
    const params = await algodClient.getTransactionParams().do();
      
    const txn = {
        ...params,
        type: 'pay',
        from: accounts[0].address,
        to:  '...',
        amount: 1000000, // 1 algo
        note: new Uint8Array(Buffer.from('...')),
    };
  
    const logic = algosdk.makeLogicSig(new Uint8Array(Buffer.from("ASABACYBA3BheTEIIg8xDygSEA==", "base64")));

    const signedTeal = await connection.signLogicSig(logic.program, from.address);

    logic.sig = signedTeal;

    const signedTxn = algosdk.signLogicSigTransaction(txn, logic)

    await algodClient.sendRawTransaction(signedTxn.blob).do();
  }
  catch(err) {
    console.error(err); 
  }
})();
`;


class Payment extends Component<ISignTealProps, ISignTealState> {
    private addressMask: Array<RegExp>;

    constructor(props: ISignTealProps) {
		super(props);

        const { accounts } = this.props;

		this.state = {
            accounts,
            from: accounts[0],
            isOpenDropdownFrom: false,

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

    componentDidUpdate(prevProps: ISignTealProps): void {
		if (this.props.accounts !== prevProps.accounts) {
			const accounts = this.props.accounts;
			this.setState({
                accounts,
                from: accounts[0]
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
		this.setState({
			from: account
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
            const algodClient = new algosdk.Algodv2('', 'https://api.testnet.algoexplorer.io', '');
            const params = await algodClient.getTransactionParams().do();

            const txn: PaymentTxn = {
                fee: 1000,
                flatFee: true,
                type: "pay",
                from: from.address,
                to,
                amount: fromDecimal(amount ? amount : "0", 6),
                note: noteb64,
                firstRound: params.firstRound,
                lastRound: params.lastRound,
                genesisHash: params.genesisHash,
                genesisID: params.genesisID,
            };

            if (!txn.note || txn.note.length === 0)
                delete txn.note;

            const lsig = algosdk.makeLogicSig(new Uint8Array(Buffer.from("ASABACYBA3BheTEIIg8xDygSEA==", "base64")));

            const signedTeal = await connection.signLogicSig(lsig.logic, from.address);

            lsig.sig = signedTeal;

            const signedTxn = algosdk.signLogicSigTransaction(txn, lsig)

            const response = await algodClient.sendRawTransaction(signedTxn.blob).do();

            this.setState({
                response,
                to: "",
                validTo: false,
                amount: "",
                validAmount: false,
                note: "",
                validNote: false
            });

            for (let i = 0; i < lsig.sig.length; i++) {
                lsig.sig[i] = 0;
            }
          }
          catch(err) {
            console.error(err); 
          }
    }

    render(): ReactNode {
        const { isOpenDropdownFrom, accounts, from, to, validTo,
            amount, validAmount, note, validNote, response } = this.state;

        return (
            <Container className="mt-5 pb-5">
                <Row className="mt-4">
                    <Col xs="12" sm="6">
                        <h1>Payment transaction with teal</h1>
                        <p>Make a payment transaction and send it by a signed stateless teal</p>
                    </Col>
                </Row>
                <Row>
                    <Col xs="12" lg="6">
                        <Form
                            id="payment-tx"
                            onSubmit={this.onSubmitPaymentTx}
                        >
                            <Fragment>
                                <text>
                                   {
                                       `
                                       //version 1
                                       txn Amount
                                       int 0
                                       >=
                                       txn Type
                                       byte "pay"
                                       ==
                                       &&
                                       `
                                   }
                                </text>
                            </Fragment>
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

export default Payment;