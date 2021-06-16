import React, { Component, ReactNode, ChangeEvent, FormEvent, ReactElement } from 'react';
import { Container, Row, Col, Form, FormGroup, Label, Input,
    Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Button } from 'reactstrap';
import MyAlgo, { Accounts, ApplTxn } from '@randlabs/myalgo-connect';
import MaskedInput from 'react-text-mask';
import algosdk from "algosdk";
import PrismCode from '../../commons/code/Code';


interface IApplCloseOutProps {
    connection: MyAlgo;
    accounts: Accounts[];
}

interface IApplCloseOutState {
    accounts: Accounts[];
    from: Accounts;
    isOpenDropdownFrom: boolean;

    note: string;
    validNote: boolean;

	noteb64: Uint8Array;
    response: any;
}

const code = `
(async () => {
    const algodClient = new algosdk.Algodv2('', 'https://api.testnet.algoexplorer.io','');
    const params = await algodClient.getTransactionParams().do();
      
    const txn = {
        ...params,
        type: "appl",
        appIndex: 14241387,
        appOnComplete: 2, // OnApplicationComplete.CloseOutOC
        from: accounts[0].address,
        note: new Uint8Array(Buffer.from('...')),
    };
  
    const signedTxn = await myAlgoWallet.signTransaction(txn);

    await algodClient.sendRawTransaction(signedTxn.blob).do();
})();
`;


class Payment extends Component<IApplCloseOutProps, IApplCloseOutState> {
    private addressMask: Array<RegExp>;
    private appIndex = 14241387;

    constructor(props: IApplCloseOutProps) {
		super(props);

        const { accounts } = this.props;

		this.state = {
            accounts,
            from: accounts[0],
            isOpenDropdownFrom: false,

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
        this.onChangeNote = this.onChangeNote.bind(this);
        this.onSubmitPaymentTx = this.onSubmitPaymentTx.bind(this);
	}

    componentDidUpdate(prevProps: IApplCloseOutProps): void {
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
        const { from, noteb64 } = this.state;
        try {
            const algodClient = new algosdk.Algodv2('', 'https://api.testnet.algoexplorer.io', '');
            const params = await algodClient.getTransactionParams().do();

            const txn: ApplTxn = {
                fee: 1000,
                flatFee: true,
                type: "appl",
                appIndex: this.appIndex,
                appOnComplete: 2,
                from: from.address,
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
                note: "",
                validNote: false
            });
        }
        catch(err) {
            this.setState({ response: err.message, });
        }
    }

    render(): ReactNode {
        const { isOpenDropdownFrom, accounts, from, note, response } = this.state;

        return (
            <Container className="mt-5 pb-5">
                <Row className="mt-4">
                    <Col xs="12" sm="6">
                        <h1>Application CloseOut transaction</h1>
                        <p>Make an appl close-out transaction (with note)</p>
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
