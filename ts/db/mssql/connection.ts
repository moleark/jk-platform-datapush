import config from 'config';

export const conn = Object.assign({}, config.get<any>("mssqlJkConn"));