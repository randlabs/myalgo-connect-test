import React, { Fragment, useState } from "react";
import NumberFormat, { NumberFormatValues } from "react-number-format";
import { FormFeedback, FormGroup, Label } from "reactstrap";

interface AppIndexProps {
    label: string;
    disabled?: boolean;
    onChangeNumber(int: number): void;
}

export default function Address(props: AppIndexProps): JSX.Element {
    const [int, setInteger] = useState(0);

    const onChangeNumber = (values: NumberFormatValues): void => {
        let value = 0;
        if (values.value) value = parseInt(values.value)
        setInteger(value);
        props.onChangeNumber(value);
    }

    return <Fragment>
        <FormGroup className="align-items-center">
            <Label className="tx-label">
                {props.label}
            </Label>
            <NumberFormat
                value={int}
                onValueChange={onChangeNumber}
                className="form-control tx-input"
                placeholder="0"
                allowNegative={false}
                isNumericString={true}
                disabled={props.disabled}
            />
            <FormFeedback>Invalid number</FormFeedback>
        </FormGroup>
    </Fragment>
}