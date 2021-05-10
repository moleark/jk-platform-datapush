import fetch from "node-fetch";
import { logger } from "../tools/logger";

/**
 * HTTP Fetch请求
 * @param fetchOptions 
 * @returns 
 */
export async function fetchRequest(fetchOptions: any) {

    let { url, options } = fetchOptions;

    try {
        let rep = await fetch(url, options);
        if (rep.ok) {
            return await rep.json();
        }
        else {
            throw `Fetch error: status: ${rep.status}  statusText :${rep.statusText}`;
        }
    } catch (error) {
        logger.error(error);
        throw error;
    }
}