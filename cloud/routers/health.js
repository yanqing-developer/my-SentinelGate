import { timeStamp } from "console";
import { uptime } from "process";

export function healthCheck(res,req){
    res.status(200).json(
        {
            status:"ok",
            service:"sentinelgate",
            uptime:process.uptime,
            timestamp:Date.now()
        }
    )

}