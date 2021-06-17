import { Fragment, useState } from "react";
import NumberFormat, { NumberFormatValues } from "react-number-format";
import { FormGroup, Label } from "reactstrap";

interface AssetIndexProps {
    onChangeAssetIndex(id: number): void;
}

export default function AssetIndex(props: AssetIndexProps): JSX.Element {
    const [assetId, setAssetId] = useState("");

    const onChangeAssetIndex = (values: NumberFormatValues): void => {
        if (typeof values.value) {
            setAssetId(values.value);
            return props.onChangeAssetIndex(parseInt(values.value));
        }
        setAssetId("0");
    }

    return <Fragment>
        <FormGroup className="align-items-center">
            <Label className="tx-label">
                Asset Index
            </Label>
            <NumberFormat
                value={assetId}
                onValueChange={onChangeAssetIndex}
                className="form-control tx-input"
                placeholder="0"
                allowNegative={false}
                isNumericString={true}
            />
        </FormGroup>
    </Fragment>
}