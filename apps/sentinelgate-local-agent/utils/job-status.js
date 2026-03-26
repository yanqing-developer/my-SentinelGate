export const JOBSTATUS={
    PENDING:"PENDING",
    RUNNING:"RUNNING",
    DONE:"DONE",
    FAILED:"FAILED"
};
const ALLOWTRANSITIONS={
    PENDING:["RUNNING"],
    RUNNING:["DONE","FAILED"],
    DONE:[],
    FAILED:[]
};


export const controlStatus=(status)=>{
    if(!status){throw new Error("Status is required");}
    if(!Object.values(JOBSTATUS).includes(status)){
        throw new Error("Status is invalid")
    }
    return status;
}

export const controlTransitions=(status,nextStatus)=>{
    controlStatus(status);
    controlStatus(nextStatus);
    if(!ALLOWTRANSITIONS[status].includes(nextStatus)){
        throw new Error(`Transition is invalid:${status}->${nextStatus}`);
    }
    return nextStatus;
}
