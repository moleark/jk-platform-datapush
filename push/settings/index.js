"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.settings = void 0;
const config_1 = __importDefault(require("config"));
//import { Settings } from "../uq-joint";
const in_1 = __importDefault(require("./in"));
const uqOutRead_1 = require("../first/converter/uqOutRead");
//const uqBusSettings = config.get<string[]>("uqBus");
const uqInEntities = config_1.default.get("afterFirstEntities");
const interval = config_1.default.get("interval");
exports.settings = {
    name: 'jk-platform-dataPush',
    unit: 24,
    allowedIP: [
        '127.0.0.1',
        '101.201.209.115',
        '47.92.87.6',
        '211.5.9.240',
        '211.5.7.250'
    ],
    uqIns: in_1.default,
    uqOuts: undefined,
    uqInEntities: uqInEntities,
    uqBusSettings: undefined,
    scanInterval: interval,
    bus: undefined,
    pullReadFromSql: uqOutRead_1.uqOutRead
};
//# sourceMappingURL=index.js.map