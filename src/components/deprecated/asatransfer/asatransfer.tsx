import React, { Component, ReactNode, ChangeEvent, FormEvent, ReactElement } from 'react';
import { Container, Row, Col, Form, FormGroup, Label, Input,
    Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Button } from 'reactstrap';
import MyAlgo, { Accounts, Address, SignedTx, AssetTxn } from '@randlabs/myalgo-connect';
import MaskedInput from 'react-text-mask';
import NumberFormat, { NumberFormatValues } from 'react-number-format';
import algosdk from "algosdk";

import { fromDecimal, validateAddress } from '../../../utils/algorand';
import PrismCode from '../../commons/code/Code';


interface IASATransferProps {
    connection: MyAlgo;
    accounts: Accounts[];
}

interface IASATransferState {
    accounts: Accounts[];
    from: Accounts;
    isOpenDropdownFrom: boolean;

    to: Address;
    validTo: boolean;

    assetIndex: number;
    validAssetIndex: boolean;

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
        type: 'axfer',
        from: accounts[0].address,
        to:  '...',
        assetIndex: assetIndex,
        amount: 1000000,
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


class ASATransfer extends Component<IASATransferProps, IASATransferState> {
    private addressMask: Array<RegExp>;

    constructor(props: IASATransferProps) {
		super(props);

        const { accounts } = this.props;

		this.state = {
            accounts,
            from: accounts[0],
            isOpenDropdownFrom: false,

            assetIndex: 0,
            validAssetIndex: false,

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
        this.onChangeAssetIndex = this.onChangeAssetIndex.bind(this);
        this.onChangeNote = this.onChangeNote.bind(this);
        this.onSubmitPaymentTx = this.onSubmitPaymentTx.bind(this);
	}

    componentDidUpdate(prevProps: IASATransferProps): void {
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

    onChangeAssetIndex(values: NumberFormatValues): void {
		this.setState({
			assetIndex: Number.parseInt(values.value),
            validAssetIndex: typeof values !== "undefined" && Number.isInteger(Number.parseInt(values.value))
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
        const { from, to, amount, noteb64, assetIndex } = this.state;

        try {
            const algodClient = new algosdk.Algodv2('', 'https://api.testnet.algoexplorer.io', '');
            const params = await algodClient.getTransactionParams().do();
            const asset = await algodClient.getAssetByID(assetIndex).do();

            const txn: AssetTxn = {
                fee: 1000,
                flatFee: true,
                type: "axfer",
                assetIndex: assetIndex,
                from: from.address,
                to,
                amount: fromDecimal(amount ? amount : "0", asset.params.decimals),
                note: noteb64,
                firstRound: params.firstRound,
                lastRound: params.lastRound,
                genesisHash: params.genesisHash,
                genesisID: params.genesisID,
            };

            if (!txn.note || txn.note.length === 0)
                delete txn.note;
          
            const signedTxn = await connection.signTransaction(txn);

            let response;
            if (!Array.isArray(signedTxn))
                response = await algodClient.sendRawTransaction(signedTxn.blob).do();

            this.setState({
                response,
                to: "",
                validTo: false,
                amount: "",
                validAmount: false,
                note: "",
                validNote: false
            });

          }
          catch(err) {
            this.setState({
                response: err.message,
            });
        }

    }

    render(): ReactNode {
        const { isOpenDropdownFrom, accounts, from, to, validTo, assetIndex,
            amount, validAmount, note, validAssetIndex, response } = this.state;

        return (
            <Container className="mt-5 pb-5">
                <Row className="mt-4">
                    <Col xs="12" sm="6">
                        <h1>ASA transfer transaction</h1>
                        <p>Make an Algorand ASA transfer transaction (with note)</p>
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
                            <FormGroup className="align-items-center">
                               <Label className="tx-label">
                                    Asset Index
                                </Label>
                                <NumberFormat
                                    value={assetIndex}
                                    onValueChange={this.onChangeAssetIndex}
                                    className="form-control tx-input"
                                    placeholder="0"
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
                                disabled={!validTo || !validAmount || !validAssetIndex}
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

export default ASATransfer;
