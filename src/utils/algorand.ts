import algosdk from 'algosdk';

export function fromDecimal(value: string|number, decimal: number = 0): number {
	if (typeof value === "string") {
		value = value.trim();
		value = parseFloat(value) || 0;
	}
	const precisionNumber = decimal > 6 ? Math.pow(10, decimal) : 10000;
	return Math.trunc(( ( (value * precisionNumber) * (Math.pow(10, decimal) ) ) / precisionNumber ));
}

export function validateAddress(address: string): boolean {
	if (typeof address !== "string") {
		return false;
	}

	return algosdk.isValidAddress(address);
}