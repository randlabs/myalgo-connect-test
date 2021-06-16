import algosdk from "algosdk";
import React, { PropsWithChildren, createContext } from "react";

export const ParamsContext = createContext<algosdk.SuggestedParams|undefined>(undefined);


export default function ParamsContextComponent(props: PropsWithChildren<{ params: algosdk.SuggestedParams }>): JSX.Element {
    return <ParamsContext.Provider value = {props.params}>{props.children}</ParamsContext.Provider>;
}