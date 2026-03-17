const jobStore=new Map();

export const saveJob=(job)=>{
    if(!job){throw new Error("Job is required for save")};
    const id=job.id;
    if(!id){throw new Error("Job id is required for save")}
    jobStore.set(id,job);
    };

export const getJobById=(id)=>{
    if(!id){throw new Error("Id is required")};
    const job=jobStore.get(id);
    if(!job){throw new Error(`Job not found:${id}`)};
    return job;
}


export const updateJob=(id,updateFn)=>{
    if(!id){throw new Error("Job id is required for update job")}; 
    if(typeof(updateFn)!=="function"){
        throw new Error("updateFn is required as a function")
    } 
    const job=getJobById(id);
    const nextJob=updateFn(job);
    if(!nextJob||!nextJob.id){throw new Error("Update job must keep same id")};
    jobStore.set(id,nextJob);
    return nextJob;
}