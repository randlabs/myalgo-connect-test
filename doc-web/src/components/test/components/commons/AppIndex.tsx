import React, { Fragment, useState } from "react";
import NumberFormat, { NumberFormatValues } from "react-number-format";
import { FormFeedback, FormGroup, Label } from "reactstrap";

interface AppIndexProps {
    value?: string;
    disabled?: boolean;
    onChangeAppIndex(appIndex: string): void;
}

export default function AppIndex(props: AppIndexProps): JSX.Element {
    const [appIndex, setAppIndex] = useState(props.value || "14241387");

    const onChangeAppIndex = (values: NumberFormatValues): void => {
        if (!values.value)  return;
        setAppIndex(values.value);
        props.onChangeAppIndex(values.value);
    }

    return <Fragment>
        <FormGroup className="align-items-center">
            <Label className="tx-label">
                App Index
            </Label>
            <NumberFormat
                value={appIndex}
                onValueChange={onChangeAppIndex}
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