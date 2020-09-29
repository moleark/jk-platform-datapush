
export class StringUtils {
    /**
     * 判断字符串是否为空或undefined,不判断为0,不判断为false
     * @param str
     * @returns {boolean}
     */
    public static isEmpty = (str: any): boolean => {
        if (
            str === null ||
            str === '' ||
            str === undefined ||
            str.length === 0
        ) {
            return true
        } else {
            return false
        }
    };

    public static isNotEmpty = (str: any): boolean => {
        if (
            str === null ||
            str === '' ||
            str === undefined ||
            str.length === 0
        ) {
            return false
        } else {
            return true
        }
    };
}

