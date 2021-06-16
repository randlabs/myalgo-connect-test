import React, { Fragment, useState } from "react";
import NumberFormat, { NumberFormatValues } from "react-number-format";
import { FormGroup, Label } from "reactstrap";

interface AmountProps {
    onChangeAmount(amount: number): void;
}

export default function Note(props: AmountProps): JSX.Element {
    const [ amount, setAmount ] = useState("");
    
    const onChangeAmount = (values: NumberFormatValues): void => {
        if (typeof values.floatValue !== "undefined" && values.floatValue > 0) {
            setAmount(values.value);
            return props.onChangeAmount(parseInt(values.value, 10));     
        }
        setAmount("0");
	}

    return <Fragment>
        <FormGroup className="align-items-center">
            <Label className="tx-label">
                Amount
            </Label>
            <NumberFormat
                value={amount}
                onValueChange={onChangeAmount}
                className="form-control tx-input"
                placeholder="0.0"
                thousandSeparator={","}
                decimalSeparator={"."}
                decimalScale={6}
                allowNegative={false}
                isNumericString={true}
            />
        </FormGroup>
    </Fragment>
}