import DropDown from "../DropDown";
import { useState } from "react";
import Loading from "../Loading";

const renameGametype = async (targetGametypeId, newName, dispatch, nDispatch, setNewName) =>{

    try{

        const req = await fetch("/api/gametypeadmin", {
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "rename", "id": targetGametypeId, "newName": newName})
        });

        const res = await req.json();

        if(res.error !== undefined){
            nDispatch({"type": "add", "notification": {"type": "error", "content": res.error}});
            return;
        }

        dispatch({"type": "rename", "targetId": targetGametypeId, "newName": newName});
        setNewName("");

        nDispatch({"type": "add", "notification": {
            "type": "pass", 
            "content": `Gametype successfully renamed to ${newName}`
        }});

    }catch(err){

    }
}

const AdminGametypeRename = ({gametypes, dispatch, nDispatch, bGametypeAlreadyExists}) =>{

    const [selectedGametype, setSelectedGametype] = useState(null);
    const [newName, setNewName] = useState("");
    const [bLoading, setBLoading] = useState(false);

    const bExists = bGametypeAlreadyExists(gametypes, newName);

    let elems = [];

    if(newName !== ""){

        if(!bExists && selectedGametype !== null){

            if(!bLoading){
                elems.push(<div className="search-button" key="button" onClick={async () => {

                    setBLoading(true);
                    await renameGametype(selectedGametype, newName, dispatch, nDispatch, setNewName);
                    setBLoading(false);
                    
                }}>Rename Gametype</div>);
            }

        }else if(selectedGametype !== null){

            elems.push(<div key="warning" className="grey p-10">
                There is already a gametype called <b>{newName}</b>, you can not use the same gametype name(gametype names are case insensitive)
            </div>);
        }
    }

    const gametypesDropDown = gametypes.map((g) =>{
        return {"value": g.id, "displayValue": g.name};
    });

    return <>
        <div className="default-header">Rename Gametype</div>
        <div className="form">
            <div className="form-info">Rename an existing gametype</div>
            <DropDown bForceSmall={true} dName="Target Gametype" data={gametypesDropDown} changeSelected={(name, value) =>{
                setSelectedGametype(value);
            }} />
            <div className="form-row">
                <div className="form-label">New Name</div>
                <input type="text" className="default-textbox" value={newName} onChange={(e) => setNewName(e.target.value)}/>
            </div>
            <Loading value={!bLoading}/>
            {elems}
        </div>
    </>
}

export default AdminGametypeRename;