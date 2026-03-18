import { createJob,getJob,startJob,completeJob,failJob } from "../services/job-service.js";



export const createJobController=(req,res)=>{
    const input=req.body?.input;
    if(!input){
        return res.status(400).json({error:"Input is required."})
    }
    try {
        const job=createJob(input);
        return res.status(201).json({job});
    } catch (error) {
        return res.status(400).json({error:error.message||"Job created failed"})
    }
};


export const getJobByIdController=(req,res)=>{
    const jobId=req.params.id;
    if(!jobId){
        return res.status(400).json({error:"Id is required."});
    }
    try {
        const job=getJob(jobId);
        if(!job){
            return res.status(404).json({error:"Job not found."});
        }
        return res.status(200).json({job})
    } catch (error) {
        return res.status(404).json({error:error.message || "Job not found."})
    }
};

export const startJobController=(req,res)=>{
    const jobId=req.params.id;
    if(!jobId){
        return res.status(400).json({error:"Id is required."});
    }
    try {
        const job=startJob(jobId);
        return res.status(200).json({job});
    } catch (error) {
        return res.status(400).json({error:error.message||"Job start failed."});
    }
}

export const completeJobController=(req,res)=>{
    const jobId=req.params.id;
    if(!jobId){
        return res.status(400).json({error:"Id is required."})
    }
    try {
        const job=completeJob(jobId);
        return res.status(200).json({job});
    } catch (error) {
        return res.status(400).json({error:error.message||"Job complete failed."});
    }
}

export const failJobController=(req,res)=>{
    const jobId=req.params.id;
    const errorInfor=req.body?.error;
    if(!jobId){
        return res.status(400).json({error:"Id is required."})
    }
    try {
        const job=failJob(jobId,errorInfor);
        return res.status(200).json({job});
    } catch (error) {
        res.status(400).json({error:error.message||"Job failed"})
    }
}
