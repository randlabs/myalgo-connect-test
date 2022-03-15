import algosdk from "algosdk";
import MyAlgoConnect from '@randlabs/myalgo-connect';


const connection = new MyAlgoConnect();
const algodClient = new algosdk.Algodv2('', 'https://node.testnet.algoexplorerapi.io', '');

export {
    connection,
    algodClient
}