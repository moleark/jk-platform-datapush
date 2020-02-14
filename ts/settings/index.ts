import config from 'config';
import { Settings } from "uq-joint";
//import { Settings } from "../uq-joint";
import uqIns from "./in";
import { uqPullRead, readMany, uqOutRead } from "../first/converter/uqOutRead";

//const uqBusSettings = config.get<string[]>("uqBus");
const uqInEntities = config.get<{ name: string, intervalUnit: number }[]>("afterFirstEntities");
const interval = config.get<number>("interval");


export const settings: Settings = {
    name: 'jk-platform-dataPush',
    unit: 24,
    allowedIP: [
        '127.0.0.1',
        '101.201.209.115',
        '47.92.87.6',
        '211.5.9.240',
        '211.5.7.250'
    ],
    uqIns: uqIns,      //[],
    uqOuts: undefined,

    uqInEntities: uqInEntities,  //undefined,
    uqBusSettings: undefined, //uqBusSettings,
    scanInterval: interval,

    bus: undefined,
    pullReadFromSql: uqOutRead
}
