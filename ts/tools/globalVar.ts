
class globalVar {

    // 方元平台存储数据用，存储够500条数据统一推送一次；
    public addOrEditList_chem: any[] = [];
    public addOrEditList_bio: any[] = [];
    public addOrEditList_cl: any[] = [];

    // 库巴扎平台存储获取token的时间
    public getTokenTime: any;
}

export var GlobalVar = new globalVar();
