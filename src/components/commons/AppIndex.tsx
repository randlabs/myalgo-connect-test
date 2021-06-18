import { Fragment, useState } from "react";
import NumberFormat from "react-number-format";
import { FormFeedback, FormGroup, Label } from "reactstrap";

interface AppIndexProps {
    onChangeAppIndex(appIndex: string): void;
}

export default function Address(props: AppIndexProps): JSX.Element {
    const [appIndex, setAppIndex] = useState("14241387");

    const onChangeAppIndex = (values: Readonly<any>): void => {
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
            />
            <FormFeedback>Invalid Address</FormFeedback>
        </FormGroup>
    </Fragment>
}