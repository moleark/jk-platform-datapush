//import { Joint, UqInTuid, centerApi, MapFromUq, MapUserToUq, map, decrypt } from "./uq-joint/index";
import { Joint, UqInTuid, centerApi, MapFromUq, MapUserToUq, map, decrypt } from "uq-joint";

export class UqJointPlatform extends Joint {

    /**
     * 从Tonva系统根据序列获取注册账号数据
     * @param face
     * @param queue
    protected async userOut(face: string, queue: number) {
        let ret = await centerApi.queueOut(queue, 1);
        if (ret !== undefined && ret.length === 1) {
            let user = ret[0];
            if (user === null) return user;
            return this.decryptUser(user);
        }
    }
    */

    /**
     * 从Tonva系统中根据注册账号id获取账号信息
     * @param id
    public async userOutOne(id: number) {
        let user = await centerApi.queueOutOne(id);
        if (user) {
            user = this.decryptUser(user);
            let mapFromUq = new MapFromUq(this);
            let outBody = await mapFromUq.map(user, faceUser.mapper);
            return outBody;
        }
    }
    */

    /**
     *
     * @param user
    protected decryptUser(user: { pwd: string }) {
        let pwd = user.pwd;
        if (!pwd)
            user.pwd = '123456';
        else
            user.pwd = decrypt(pwd);
        if (!user.pwd) user.pwd = '123456';
        return user;
    }
    */

    /**
     * 将官网中注册账户发送到Tonva系统
     * @param uqIn
     * @param data
    public async userIn(uqIn: UqInTuid, data: any): Promise<number> {
        let { key, mapper, uq: uqFullName, entity: tuid } = uqIn;
        if (key === undefined) throw 'key is not defined';
        if (uqFullName === undefined) throw 'tuid ' + tuid + ' not defined';
        let keyVal = data[key];
        let mapToUq = new MapUserToUq(this);
        try {
            let body = await mapToUq.map(data, mapper);
            if (body.id <= 0) {
                delete body.id;
            }
            let ret = await centerApi.queueIn(body);
            if (!body.id && (ret === undefined || typeof ret !== 'number')) {
                console.error(body);
                let { id: code, message } = ret as any;
                switch (code) {
                    case -2:
                        data.Email += '\t';
                        ret = await this.userIn(uqIn, data);
                        break;
                    case -3:
                        data.Mobile += '\t';
                        ret = await this.userIn(uqIn, data);
                        break;
                    default:
                        console.error(ret);
                        ret = -5;
                        break;
                }
            }
            if (ret > 0) {
                await map(tuid, ret, keyVal);
            }
            return body.id || ret;
        } catch (error) {
            throw error;
        }
    }
    */
}
