import { Accounts } from "@randlabs/myalgo-connect";
import React, { Fragment, MouseEvent, ReactElement, useContext, useState } from "react";
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle, FormGroup, Label } from "reactstrap";
import { AccountsContext } from "../../context/accountsContext";

interface AddressDropdownProps {
    disabled?: boolean;
    onSelectSender(sender: string): void;
    label?: string;
}

export default function AddressDropdown(props: AddressDropdownProps): JSX.Element {
    const accounts = useContext(AccountsContext);
    const [ sender, setSender ] = useState(accounts[0]);
    const [ isOpen, openDropdown ] = useState(false);

    const onToggleSender = (event: MouseEvent) => {
        event.preventDefault();
        openDropdown(!isOpen);
    }

    const onSelectSender = (account: Accounts) => {
        setSender(account);
        props.onSelectSender(account.address);
    }

    return <Fragment>
        <FormGroup className="align-items-center">
            <Label className="tx-label">
                <span>{ props.label || 'From' }</span>
            </Label>
            <Dropdown
                disabled={props.disabled}
                className="from-dropdown"
                isOpen={isOpen}
                toggle={onToggleSender}
            >
                <DropdownToggle caret disabled={props.disabled}>
                    <span className="text-ellipsis">
                        {sender.name}
                    </span>
                </DropdownToggle>
                <DropdownMenu>
                    {accounts.map((account): ReactElement => {
                        return (
                            <DropdownItem
                                onClick={() => onSelectSender(account)}
                                key={`account-${account.address}`}
                            >
                                <span className="text-ellipsis">
                                    {account.name}
                                </span>
                            </DropdownItem>
                        );
                    })
                    }
                </DropdownMenu>
            </Dropdown>
        </FormGroup>
    </Fragment>
}