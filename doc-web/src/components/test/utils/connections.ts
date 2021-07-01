import algosdk from "algosdk";
import MyAlgoConnect from '@randlabs/myalgo-connect';


const connection = new MyAlgoConnect({ bridgeUrl: "https://dev.myalgo.com/bridge" });
const algodClient = new algosdk.Algodv2('', 'https://api.testnet.algoexplorer.io', '');

export {
    connection,
    algodClient
}