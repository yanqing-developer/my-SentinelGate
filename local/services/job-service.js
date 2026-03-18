import { createScanJob } from "../models/scan-job.js";
import { saveJob } from "../store/job-store.js";
import { getJobById } from "../store/job-store.js";
import { JOBSTATUS } from "../utils/job-status.js";
import { controlTransitions } from "../utils/job-status.js";
// import { controlStatus } from "../utils/job-status";
import { updateJob } from "../store/job-store.js";


export const createJob=(input)=>{
    const job=createScanJob(input);
    saveJob(job);
    return job;
}

export const getJob=(id)=>{
    const job=getJobById(id);
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
    if(!currentJob){
        throw new Error("Job not found")
    }
    const status=currentJob.status;
    const nextStatus=controlTransitions(status,JOBSTATUS.RUNNING);
    const job=updateJob(id,updateFn(nextStatus));
    return job;   
}

export const completeJob=(id)=>{
    const currentJob=getJobById(id);
    if(!currentJob){
        throw new Error("Job not found");
    }
    const status=currentJob.status;
    const nextStatus=controlTransitions(status,JOBSTATUS.DONE);
    const job=updateJob(id,updateFn(nextStatus));
    return job; 
}

const failUpdateJob=(nextStatus,error)=>{
    return (currentJob)=>{
        if(!currentJob){
            throw new Error("Current job is required");
        }
        return {
            ...currentJob,
            status:nextStatus,
            error,
            updatedAt:new Date().toISOString()
        }
    }
}
export const failJob=(id,error)=>{
    const currentJob=getJobById(id);
    if(!currentJob){
        throw new Error("Job not found");
   }
    const status=currentJob.status;
    const nextStatus=controlTransitions(status,JOBSTATUS.FAILED);
    
    const job=updateJob(id,failUpdateJob(nextStatus,error));
    return job;
}