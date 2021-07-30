import { Accounts } from "@randlabs/myalgo-connect";
import React, { PropsWithChildren, createContext } from "react";

export const AccountsContext = createContext<Accounts[]>([]);


export default function AccountsContextComponent(props: PropsWithChildren<{ accounts: Accounts[] }>): JSX.Element {
    return <AccountsContext.Provider value = {props.accounts}>{props.children}</AccountsContext.Provider>;
}