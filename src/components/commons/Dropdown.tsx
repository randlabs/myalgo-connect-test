import React, { useState } from "react";
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from "reactstrap";

export type Network = 'mainnet' | 'testnet';

interface GenericDropDownProps<T> {
    disabled?: boolean;
	selectedValue: T;
	values: T[];
	onChange: (val: T) => void;
	valueKey?: (val: T) => string;
	valueLabel?: (val: T) => string;
}

export default function GenericDropDown<T>(props: GenericDropDownProps<T>): JSX.Element {
	const [ isOpen, setIsOpen ] = useState(false);

	const { valueKey, valueLabel } = props;

	return (
		<Dropdown
            disabled={props.disabled || false}
            className="from-dropdown"
			isOpen={isOpen}
			toggle={() => setIsOpen(!isOpen) }>
			<DropdownToggle className={"custom-dropdown"} value={props.selectedValue} caret>
				{valueLabel ? valueLabel(props.selectedValue) : String(props.selectedValue)}
			</DropdownToggle>
			<DropdownMenu>
				{props.values.map(x => <DropdownItem
					key={valueKey ? valueKey(x) : String(x)}
					value={x}
					onClick={() => props.onChange(x)}>
					{valueLabel ? valueLabel(x) : String(x)}
				</DropdownItem>)}
			</DropdownMenu>
		</Dropdown>
	);
}
