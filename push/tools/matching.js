"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.matching = void 0;
async function matching(str, type) {
    let result;
    switch (type) {
        //匹配数字
        case 'number':
            let n = new RegExp('(\\d+(\\.\\d+)?)');
            result = n.exec(str)[0];
            break;
        //匹配字母
        case 'letter':
            let l = new RegExp('[/^[a-z|A-Z]+$');
            result = l.exec(str)[0];
            break;
    }
    ;
    return result;
}
exports.matching = matching;
//# sourceMappingURL=matching.js.map