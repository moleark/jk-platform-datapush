"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class StringUtils {
}
exports.StringUtils = StringUtils;
/**
 * 判断字符串是否为空或undefined,不判断为0,不判断为false
 * @param str
 * @returns {boolean}
 */
StringUtils.isEmpty = (str) => {
    if (str === null ||
        str === '' ||
        str === undefined ||
        str.length === 0) {
        return true;
    }
    else {
        return false;
    }
};
StringUtils.isNotEmpty = (str) => {
    if (str === null ||
        str === '' ||
        str === undefined ||
        str.length === 0) {
        return false;
    }
    else {
        return true;
    }
};
//# sourceMappingURL=stringUtils.js.map