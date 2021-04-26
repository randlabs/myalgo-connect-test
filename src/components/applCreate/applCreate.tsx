import React, { Component, ReactNode, ChangeEvent, FormEvent, ReactElement } from 'react';
import { Container, Row, Col, Form, FormGroup, Label, Input,
    Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Button } from 'reactstrap';
import MyAlgo, { Accounts, CreateApplTxn } from '@randlabs/myalgo-connect';
import algosdk from 'algosdk';
import PrismCode from '../code/Code';
import NumberFormat, { NumberFormatValues } from 'react-number-format';


interface IApplCreateProps {
    connection: MyAlgo;
    accounts: Accounts[];
}

interface IApplCreateState {
    accounts: Accounts[];
    from: Accounts;
    isOpenDropdownFrom: boolean;

	noteb64: Uint8Array;
    response: any;

    // appl create params
    appLocalByteSlices: number,
    appLocalInts: number,
    appGlobalByteSlices: number,
    appGlobalInts: number,
}

const code = `
(async () => {
    const algodClient = new algosdk.Algodv2('', 'https://api.testnet.algoexplorer.io','');
    const params = await algodClient.getTransactionParams().do();

    const txn = {
        ...params,
        fee: 1000,
        type: "appl",
        from: accounts[0].address,
        note: new Uint8Array(Buffer.from('...')),

        appLocalByteSlices: 2,
        appLocalInts: 2,
        appGlobalByteSlices: 4,
        appGlobalInts: 4,
        appApprovalProgram: new Uint8Array(0),
        appClearProgram: new Uint8Array(0),
    };
  
    const signedTxn = await myAlgoWallet.signTransaction(txn);

    await algodClient.sendRawTransaction(signedTxn.blob).do();
})();
`;


class ApplCreate extends Component<IApplCreateProps, IApplCreateState> {

    constructor(props: IApplCreateProps) {
		super(props);

        const { accounts } = this.props;

		this.state = {
            accounts,
            from: accounts[0],
            isOpenDropdownFrom: false,

            noteb64: new Uint8Array(),
			response: null,

            appLocalByteSlices: 0,
            appLocalInts: 0,
            appGlobalByteSlices: 0,
            appGlobalInts: 0,
		};

        this.onClearResponse = this.onClearResponse.bind(this);
        this.onToggleFrom = this.onToggleFrom.bind(this);
        this.onFromSelected = this.onFromSelected.bind(this);
        this.onSubmitCreateAppl = this.onSubmitCreateAppl.bind(this);
        this.onChangeLocalInt = this.onChangeLocalInt.bind(this);
        this.onChangeGlobalInt = this.onChangeGlobalInt.bind(this);
        this.onChangeLocalBytes = this.onChangeLocalBytes.bind(this);
        this.onChangeGlobalBytes = this.onChangeGlobalBytes.bind(this);
	}

    componentDidUpdate(prevProps: IApplCreateProps): void {
		if (this.props.accounts !== prevProps.accounts) {
			const accounts = this.props.accounts;
			this.setState({
                accounts,
                from: accounts[0]
			});
		}
	}

    onChangeLocalInt(values: NumberFormatValues): void {
		this.setState({
			appLocalInts: parseInt(values.value),
		});
	}

    onChangeGlobalInt(values: NumberFormatValues): void {
		this.setState({
			appGlobalInts: parseInt(values.value),
		});
	}

    onChangeLocalBytes(values: NumberFormatValues): void {
		this.setState({
			appLocalByteSlices: parseInt(values.value),
		});
	}

    onChangeGlobalBytes(values: NumberFormatValues): void {
		this.setState({
			appGlobalByteSlices: parseInt(values.value),
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

    async onSubmitCreateAppl(event: FormEvent<HTMLFormElement>): Promise<void> {
		event.preventDefault();
        const { connection } = this.props;
        const { from, noteb64, appGlobalByteSlices, appGlobalInts, appLocalByteSlices, appLocalInts } = this.state;
        try {
            const algodClient = new algosdk.Algodv2('', 'https://api.testnet.algoexplorer.io', '');
            const params = await algodClient.getTransactionParams().do();

            const approvalProgram = Buffer.from("AiAGAAEFBAIDJgIHQ3JlYXRvcgZFc2Nyb3ciMRgSQAAtIzEZEkAAQyIxGRJAACskMRkSQAA4JTEZEkAAPCEEMRkSIQUxGRIRQABAQgA7KDEAZyk2GgBnQgAxMRsiEkAALDEbIxJAAD5CAB5CAB0oZDEAEkEAE0IAEihkMQASQQAIKTYaAGdCAAIiQyNDMgQhBBIzARAjEhAzAQgjDzMBBylkEhAQQzIEIQQSMwEQIxIQMwEAKWQSMwAAKGQSEBBD", "base64");
            const clearProgram = Buffer.from("AiABASJD", "base64");

            const txn: CreateApplTxn = {
                fee: 1000,
                flatFee: true,
                type: "appl",
                from: from.address,
                note: noteb64,
                firstRound: params.firstRound,
                lastRound: params.lastRound,
                genesisHash: params.genesisHash,
                genesisID: params.genesisID,
                appLocalByteSlices: appLocalByteSlices,
                appLocalInts: appLocalInts,
                appGlobalByteSlices: appGlobalByteSlices,
                appGlobalInts: appGlobalInts,
                appApprovalProgram: new Uint8Array(approvalProgram),
                appClearProgram: new Uint8Array(clearProgram),
                appArgs: [ new Uint8Array(Buffer.from(from.address)) ]
            };

            if (!txn.note || txn.note.length === 0)
                delete txn.note;
          
            const signedTxn = await connection.signTransaction(txn);

            let response;
            if (!Array.isArray(signedTxn))
                response = await algodClient.sendRawTransaction(signedTxn.blob).do();

            this.setState({
                response,
                appLocalByteSlices: 0,
                appLocalInts: 0,
                appGlobalByteSlices: 0,
                appGlobalInts: 0,
            });
        }
        catch(err) {
            this.setState({ response: err.message, });
        }
    }

    render(): ReactNode {
        const { isOpenDropdownFrom, accounts, from, response,
         appLocalInts, appGlobalInts, appLocalByteSlices, appGlobalByteSlices} = this.state;

        return (
            <Container className="mt-5 pb-5">
                <Row className="mt-4">
                    <Col xs="12" sm="6">
                        <h1>Application Create transaction</h1>
                        <p>Make an appl create transaction</p>
                    </Col>
                </Row>
                <Row>
                    <Col xs="12" lg="6">
                        <Form
                            id="payment-tx"
                            onSubmit={this.onSubmitCreateAppl}
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
                                    Local Ints
                                </Label>
                                <NumberFormat
                                    value={appLocalInts}
                                    onValueChange={this.onChangeLocalInt}
                                    className="form-control tx-input"
                                    placeholder="0"
                                    decimalScale={0}
                                    allowNegative={false}
                                    isNumericString={true}
                                />
						    </FormGroup>
                            <FormGroup className="align-items-center">
                               <Label className="tx-label">
                                    Local Bytes Slices
                                </Label>
                                <NumberFormat
                                    value={appLocalByteSlices}
                                    onValueChange={this.onChangeLocalBytes}
                                    className="form-control tx-input"
                                    placeholder="0"
                                    decimalScale={0}
                                    allowNegative={false}
                                    isNumericString={true}
                                />
						    </FormGroup>
                            <FormGroup className="align-items-center">
                               <Label className="tx-label">
                                    Global Ints
                                </Label>
                                <NumberFormat
                                    value={appGlobalInts}
                                    onValueChange={this.onChangeGlobalInt}
                                    className="form-control tx-input"
                                    placeholder="0"
                                    decimalScale={0}
                                    allowNegative={false}
                                    isNumericString={true}
                                />
						    </FormGroup>
                            <FormGroup className="align-items-center">
                               <Label className="tx-label">
                                    Global Byte Slices
                                </Label>
                                <NumberFormat
                                    value={appGlobalByteSlices}
                                    onValueChange={this.onChangeGlobalBytes}
                                    className="form-control tx-input"
                                    placeholder="0"
                                    decimalScale={0}
                                    allowNegative={false}
                                    isNumericString={true}
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

export default ApplCreate;
