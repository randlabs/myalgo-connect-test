import { isValidAddress } from "algosdk";
import React, { Fragment, useState, ChangeEvent } from "react";
import MaskedInput from "react-text-mask";
import { FormFeedback, FormGroup, Label } from "reactstrap";

interface AddressProps {
    label: string;
    disabled?: boolean;
    onChangeAddress(addr: string): void;
}

const addressMask: Array<RegExp> = [];
for (let i = 58; i > 0; i--) {
    addressMask.push(/[A-Z0-9]/iu);
}

export default function Address(props: AddressProps): JSX.Element {
    const [ isValid, setValid ] = useState(true);
    const [ address, setAddress ] = useState("");
    
    const onChangeAddress = (event: ChangeEvent<HTMLInputElement>): void => {
        setAddress(event.target.value);
    
        if (!isValidAddress(event.target.value))
            return setValid(false);

        setValid(true)
        props.onChangeAddress(event.target.value);
	}

    const className = "form-control tx-input" + (!isValid ? + " is-invalid" : "");

    return <Fragment>
         <FormGroup className="align-items-center">
            <Label className="tx-label">
                {props.label}
            </Label>
            <MaskedInput
                className={className}
                mask={addressMask}
                value={address}
                placeholder=""
                placeholderChar=" "
                guide={false}
                onChange={onChangeAddress}
                disabled={props.disabled}
                required
            />
            <FormFeedback>Invalid Address</FormFeedback>
        </FormGroup>
    </Fragment>
}