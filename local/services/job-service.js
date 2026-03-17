import { createScanJob } from "../models/scan-job";
import { saveJob } from "../store/job-store";
import { getJobById } from "../store/job-store";
import { JOBSTATUS } from "../utils/job-status";
import { controlTransitions } from "../utils/job-status";
// import { controlStatus } from "../utils/job-status";
import { updateJob } from "../store/job-store";


export const createJob=(input)=>{
    const job=createScanJob(input);
    saveJob(job);
    return job;
}


const updateFn=(nextStatus)=>{
    return (currentJob)=>{
        if(!currentJob){
            throw new Error("Current job is required");
        }
        return {
            ...currentJob,
            status:nextStatus,
            updatedAt:new Date().toISOString()
        }
    }
}

export const startJob=(id)=>{
    const currentJob=getJobById(id);
    const status=currentJob.status;
    const nextStatus=controlTransitions(status,JOBSTATUS.RUNNING);
    const job=updateJob(id,updateFn(nextStatus));
    return job;   
}

export const completeJob=(id)=>{
    const currentJob=getJobById(id);
    const status=currentJob.status;
    const nextStatus=controlTransitions(status,JOBSTATUS.DONE);
    const job=updateJob(id,updateFn(nextStatus));
    return job; 
}

const failUpdateJob=(error)=>{
    return (currentJob)=>{
        if(!currentJob){
            throw new Error("Current job is required");
        }
        return {
            ...currentJob,
            status:JOBSTATUS.FAILED,
            error,
            updatedAt:new Date().toISOString()
        }
    }
}
export const failJob=(id,error)=>{
    const currentJob=getJobById(id);
    const status=currentJob.status;
    const nextStatus=controlTransitions(status,JOBSTATUS.FAILED);
    const job=updateJob(id,failUpdateJob(error));
    return job;
}