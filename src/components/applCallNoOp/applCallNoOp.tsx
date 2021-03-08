import React, { Component, ReactNode, ChangeEvent, FormEvent, ReactElement } from 'react';
import { Container, Row, Col, Form, FormGroup, Label, Input,
    Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Button } from 'reactstrap';
import MyAlgo, { SignedTx, Accounts, ApplTxn, PaymentTxn } from '@randlabs/myalgo-connect';
import MaskedInput from 'react-text-mask';
import NumberFormat, { NumberFormatValues } from 'react-number-format';
import algosdk from 'algosdk';
import PrismCode from '../code/Code';
import { fromDecimal } from '../../utils/algorand';


interface IApplCallNoOpProps {
    connection: MyAlgo;
    accounts: Accounts[];
}

interface IApplCallNoOpState {
    accounts: Accounts[];
    from: Accounts;
    isOpenDropdownFrom: boolean;

    amount: string;
    validAmount: boolean;

    response: any;
}

const code = `
(async () => {
    const algodClient = new algosdk.Algodv2('', 'https://api.testnet.algoexplorer.io', '');
    const params = await algodClient.getTransactionParams().do();

    const applTx: ApplTxn = {
        ...params,
        type: "appl",
        appIndex: this.appIndex,
        appOnComplete: 0, // OnApplicationComplete.NoOpOC
        from: accounts[0].address,
    };

    const payTx: PaymentTxn = {
        ...params,
        type: "pay",
        to: "SXCVUTCSODUAAP5QIXWWRHV4JV6YHQI5WKWNAISG3AFNVUIVBCKK7RG2SU, // Escrow address
        amount: 1000,
        from: accounts[0].address,
    }

    // Assign group ID
    const txArr = [ applTx, payTx ];
    const groupID = algosdk.computeGroupID(txArr)
    for (let i = 0; i < 2; i++) {
      txArr[i].group = groupID;
    }
  
    // Sign and send transactions
    const signedTxn = await connection.signTransaction(txArr);
    await algodClient.sendRawTransaction(signedTxn.map(tx => tx.blob)).do();
})();
`;


class Payment extends Component<IApplCallNoOpProps, IApplCallNoOpState> {
    private addressMask: Array<RegExp>;
    private appIndex = 14241387;
    private escrowAddress = "SXCVUTCSODUAAP5QIXWWRHV4JV6YHQI5WKWNAISG3AFNVUIVBCKK7RG2SU";

    constructor(props: IApplCallNoOpProps) {
		super(props);

        const { accounts } = this.props;

		this.state = {
            accounts,
            from: accounts[0],
            isOpenDropdownFrom: false,

            amount: "",
            validAmount: false,

			response: null
		};

        this.addressMask = [];
		for (let i = 58; i > 0; i--) {
			this.addressMask.push(/[A-Z0-9]/iu);
		}

        this.onClearResponse = this.onClearResponse.bind(this);
        this.onToggleFrom = this.onToggleFrom.bind(this);
        this.onFromSelected = this.onFromSelected.bind(this);
        this.onChangeAmount = this.onChangeAmount.bind(this);
        this.onSubmitPaymentTx = this.onSubmitPaymentTx.bind(this);
	}

    componentDidUpdate(prevProps: IApplCallNoOpProps): void {
		if (this.props.accounts !== prevProps.accounts) {
			const accounts = this.props.accounts;
			this.setState({
                accounts,
                from: accounts[0]
			});
		}
	}

    onChangeAmount(values: NumberFormatValues): void {
		this.setState({
			amount: values.value,
            validAmount: typeof values.floatValue !== "undefined" && values.floatValue > 0
		});
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


    async onSubmitPaymentTx(event: FormEvent<HTMLFormElement>): Promise<void> {
		event.preventDefault();
        const { connection } = this.props;
        const { from, amount } = this.state;
        try {
            const algodClient = new algosdk.Algodv2('', 'https://api.testnet.algoexplorer.io', '');
            const params = await algodClient.getTransactionParams().do();

            const applTx: ApplTxn = {
                fee: 1000,
                flatFee: true,
                type: "appl",
                appIndex: this.appIndex,
                appOnComplete: 0,
                from: from.address,
                firstRound: params.firstRound,
                lastRound: params.lastRound,
                genesisHash: params.genesisHash,
                genesisID: params.genesisID,
            };

            const payTx: PaymentTxn = {
                fee: 1000,
                flatFee: true,
                type: "pay",
                to: this.escrowAddress,
                amount: fromDecimal(amount ? amount : "0", 6),
                from: from.address,
                firstRound: params.firstRound,
                lastRound: params.lastRound,
                genesisHash: params.genesisHash,
                genesisID: params.genesisID,  
            }

            const txArr = [ applTx, payTx ];

            const groupID = algosdk.computeGroupID(txArr)

            for (let i = 0; i < 2; i++) {
              txArr[i].group = groupID;
            }
          
            // @ts-ignore
            const signedTxn: SignedTx[] = await connection.signTransaction(txArr);
            
            const response = await algodClient.sendRawTransaction(signedTxn.map(tx => tx.blob)).do();

            this.setState({ response });
        }
        catch(err) {
            this.setState({ response: err.message, });
        }
    }

    render(): ReactNode {
        const { isOpenDropdownFrom, accounts, from, response, amount, validAmount } = this.state;

        return (
            <Container className="mt-5 pb-5">
                <Row className="mt-4">
                    <Col xs="12" sm="6">
                        <h1>Application Call transaction</h1>
                        <p>Make an appl NoOp transaction</p>
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
                                    App Index
                                </Label>
                                <MaskedInput
                                    className="form-control tx-input"
                                    mask={this.addressMask}
                                    value={this.appIndex}
                                    placeholder=""
                                    placeholderChar=" "
                                    guide={false}
                                    disabled={true}
                                />
						    </FormGroup>
                            <FormGroup className="align-items-center">
                                <Label className="tx-label">
                                    Escrow Address
                                </Label>
                                <MaskedInput
                                    className="form-control tx-input"
                                    mask={this.addressMask}
                                    value={this.escrowAddress}
                                    placeholder=""
                                    placeholderChar=" "
                                    guide={false}
                                    disabled={true}
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
                            <Button
                                color="primary"
                                block
                                type="submit"
                                disabled={!validAmount}
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
