import React, { Fragment } from "react";
import NumberFormat, { NumberFormatValues } from "react-number-format";
import { FormGroup, Label } from "reactstrap";

interface AmountProps {
    amount: number;
    label?: string,
    decimals?: number;
    disabled?: boolean;
    onChangeAmount(amount: number): void;
}

export default function Amount(props: AmountProps): JSX.Element {
    const onChangeAmount = (values: NumberFormatValues): void => {
        if (typeof values.floatValue !== "undefined" && values.floatValue > 0)
            return props.onChangeAmount(parseFloat(values.value));
        props.onChangeAmount(0);
    }

    return <Fragment>
        <FormGroup className="align-items-center">
            <Label className="tx-label">
                {props.label ? props.label : "Amount"}
            </Label>
            <NumberFormat
                value={props.amount}
                onValueChange={onChangeAmount}
                className="form-control tx-input"
                placeholder="0.0"
                thousandSeparator={","}
                decimalSeparator={"."}
                decimalScale={props.decimals ? props.decimals : 6}
                allowNegative={false}
                isNumericString={true}
                disabled={props.disabled}
            />
        </FormGroup>
    </Fragment>
}