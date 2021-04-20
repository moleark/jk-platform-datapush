export async function matching(str: string, type: string) {

    let result: any;
    switch (type) {

        //匹配数字
        case 'number':
            let n: RegExp = new RegExp('(\\d+(\\.\\d+)?)');
            result = n.exec(str)[0];
            break;

        //匹配字母
        case 'letter':
            let l: RegExp = new RegExp('[/^[a-z|A-Z]+$');
            result = l.exec(str)[0];
            break;
    };

    return result;
}