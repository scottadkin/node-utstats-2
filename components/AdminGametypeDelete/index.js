import DropDown from "../DropDown";
import { useState } from "react";
import Loading from "../Loading";

const deleteGametype = async (nDispatch, gametypeId, setSelectedGametype, dispatch) =>{

    try{

        const req = await fetch("/api/gametypeadmin",{
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "delete", "gametypeId": gametypeId})
        });

        const res = await req.json();

        if(res.error !== undefined){
            nDispatch({"type": "add", "notification": {"type": "error", "content": res.error}});
            return;
        }
        setSelectedGametype(null);
        dispatch({"type": "delete", "targetId": gametypeId});
        nDispatch({"type": "add", "notification": {"type": "pass", "content": <>Deleted gametype with id <b>{gametypeId}</b></>}});
        

    }catch(err){
        console.trace(err);
    }
}

const AdminGametypeDelete = ({gametypes, dispatch, nDispatch}) =>{

    const [selectedGametype, setSelectedGametype] = useState(null);
    const [bLoading, setBLoading] = useState(false);

    return <>
        <div className="default-header">Delete Gametype</div>
        <div className="form">
            <div className="form-info">Delete a selected gametype and all of their match data, rankings, ect.</div>
            <DropDown 
                dName="Gametype"
                selectedValue={selectedGametype}
                changeSelected={(name, value) => setSelectedGametype(value)}
                data={gametypes.map((g) =>{
                return {"displayValue": g.name, "value": g.id}
            })}/>
            <Loading value={!bLoading}/>
            {
            (selectedGametype === null) ? null :
                <div className="search-button" onClick={async () =>{

                    setBLoading(true);
                    await deleteGametype(nDispatch, selectedGametype, setSelectedGametype, dispatch);
                    setBLoading(false);

                }}>Delete Gametype</div>          
            }
        </div>
    </>
}


export default AdminGametypeDelete;