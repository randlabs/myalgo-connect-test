import { Accounts } from "@randlabs/myalgo-connect";
import { Fragment, useContext, useState } from "react";
import { FormGroup, Label } from "reactstrap";
import { AppContext } from "../../context/appContext";
import GenericDropDown from "./Dropdown";

interface AddressDropdownProps {
    disabled?: boolean;
    onSelectSender(sender: string): void;
    label?: string;
}

export default function AddressDropdown(props: AddressDropdownProps): JSX.Element {
    const { accounts } = useContext(AppContext);

    const [ sender, setSender ] = useState(accounts[0]);

    const onSelectSender = (account: Accounts) => {
        setSender(account);
        props.onSelectSender(account.address);
    }

    return <Fragment>
        <FormGroup className="align-items-center">
            <Label className="tx-label">
                <span>{ props.label || 'From' }</span>
            </Label>
            <GenericDropDown
                disabled={props.disabled}
                values={accounts}
                valueKey={a => a.address}
                valueLabel={a => a.name}
                selectedValue={sender}
                onChange={onSelectSender}
            />
        </FormGroup>
    </Fragment>
}