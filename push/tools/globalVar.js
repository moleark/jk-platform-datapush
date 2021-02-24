"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalVar = void 0;
class globalVar {
    constructor() {
        // 方元平台存储数据用，存储够100条数据统一推送一次；
        this.addOrEditList_chem = [];
        this.addOrEditList_bio = [];
        this.addOrEditList_cl = [];
        //政采云数据推送
        this.list1 = []; //存放数据
        this.list2 = []; //存放id
        this.count = 1;
    }
}
exports.GlobalVar = new globalVar();
//# sourceMappingURL=globalVar.js.map