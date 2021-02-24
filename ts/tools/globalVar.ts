
class globalVar {

    // 方元平台存储数据用，存储够100条数据统一推送一次；
    public addOrEditList_chem: any[] = [];
    public addOrEditList_bio: any[] = [];
    public addOrEditList_cl: any[] = [];

    // 库巴扎平台存储获取token的时间
    public token: any;
    public ucode: any;
    public timestamp: any;

    //政采云数据推送
    public list1: any[] = [];  //存放数据
    public list2: any[] = [];  //存放id
    public count: number = 1;

    //基理token存储
    public access_token: any;
    public expires_in: any;
    public createtimestamp: number;
}

export var GlobalVar = new globalVar();
