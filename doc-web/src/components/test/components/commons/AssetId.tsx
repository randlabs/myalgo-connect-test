import React, { Fragment } from "react";
import NumberFormat, { NumberFormatValues } from "react-number-format";
import { FormGroup, Label } from "reactstrap";

interface AssetIndexProps {
    assetIndex: number;
    disabled?: boolean;
    onChangeAssetIndex(id: number): void;
}

export default function AssetIndex(props: AssetIndexProps): JSX.Element {
    const onChangeAssetIndex = (values: NumberFormatValues): void => {
        if (typeof values.value) {
            return props.onChangeAssetIndex(parseInt(values.value));
        }
        props.onChangeAssetIndex(0);
    }

    return <Fragment>
        <FormGroup className="align-items-center">
            <Label className="tx-label">
                Asset Index
            </Label>
            <NumberFormat
                value={props.assetIndex}
                onValueChange={onChangeAssetIndex}
                className="form-control tx-input"
                placeholder="0"
                allowNegative={false}
                isNumericString={true}
                disabled={props.disabled}
            />
        </FormGroup>
    </Fragment>
}