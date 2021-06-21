import { Accounts } from "@randlabs/myalgo-connect";
import React, { useState, useContext, Fragment, ReactElement, MouseEvent, useEffect } from "react";
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle, FormGroup, Label } from "reactstrap";
import { AccountsContext } from "../../context/accountsContext";

interface SenderDropdownProps {
    onSelectSender(sender: string): void;
}

export default function SenderDropdown(props: SenderDropdownProps): JSX.Element {
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
                From
            </Label>
            <Dropdown
                className="from-dropdown"
                isOpen={isOpen}
                toggle={onToggleSender}
            >
                <DropdownToggle caret>
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