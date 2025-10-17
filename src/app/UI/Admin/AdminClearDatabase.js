import { useState } from "react";
import Loading from "../Loading";
import ErrorMessage from "../ErrorMessage";
import PassedMessage from "../PassedMessage";

async function clearTables(bInProgress, setBInProgress, setError, setBPassed){

    try{


        if(bInProgress) return;
        setBInProgress(() => true);
        setBPassed(() => null);
        

        const req = await fetch("/api/admin", {
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "clear-tables"})
        });

      
        const res = await req.json();
        setBInProgress(false);

        if(res.error !== undefined){
            setError(() => res.error);
        }else{
            setBPassed(() => true);
        }

        console.log(res);
    }catch(err){
        console.trace(err);
    }
}

export default function AdminClearDatabase(){

    const [bInProgress, setBInProgress] = useState(false);
    const [error, setError] = useState(null);
    const [bPassed, setBPassed] = useState(null);

    let elems = null;

    if(!bInProgress){
        elems = <button className="button delete-button" onClick={async () =>{
            if(confirm(`Are you sure you want to empty all database tables for the log imports?`)){
                
                await clearTables(bInProgress, setBInProgress, setError, setBPassed);
                console.log("FART");
            }
        }}>Clear Database Tables</button>
    }else{
        elems = <Loading value={!bInProgress}>Processing...</Loading>
    }

    return <>
        <div className="default-header">Admin Clear Database</div>
        <div className="form">
            <div className="form-info">
                Delete all data collected from match log imports.<br/>
                This will not delete settings related to the site itself or site users.
            </div>
            <ErrorMessage title="Failed To Clear Database Tables" text={error}/>
            {(bPassed) ? <PassedMessage text={"Clear Database Tables Completed"}/> : null}
            
            {elems}
        </div>
    </>
}