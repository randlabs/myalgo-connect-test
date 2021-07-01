import algosdk from "algosdk";

export function validateAddress(address: string): boolean {
	if (typeof address !== "string") {
		return false;
	}

	return algosdk.isValidAddress(address);
}