import DropDown from "../DropDown";
import { useState } from "react";
import Loading from "../Loading";

const renameGametype = async (targetGametypeId, newName) =>{

    try{

        console.log(arguments);
        const req = await fetch("/api/gametypeadmin", {
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "rename", "id": targetGametypeId, "newName": newName})
        });

        const res = await req.json();

        console.log(res);

    }catch(err){

    }
}

const AdminGametypeRename = ({gametypes, nDispatch, bGametypeAlreadyExists}) =>{

    const [selectedGametype, setSelectedGametype] = useState(null);
    const [newName, setNewName] = useState("");
    const [bLoading, setBLoading] = useState(false);

    const bExists = bGametypeAlreadyExists(gametypes, newName);

    let elems = null;

    if(newName !== ""){

        if(!bExists && selectedGametype !== null){

            if(!bLoading){
                console.log(selectedGametype, newName);
                elems = <div className="search-button" onClick={async () => {

                    setBLoading(true);
                    await renameGametype(selectedGametype, newName);
                    setBLoading(false);
                    
                }}>Rename Gametype</div>;
            }

        }else if(selectedGametype !== null){

            elems = <div className="grey p-10">
                There is already a gametype called <b>{newName}</b>, you can not use the same gametype name(gametype names are case insensitive)
            </div>
        }
    }

    const gametypesDropDown = gametypes.map((g) =>{
        return {"value": g.id, "displayValue": g.name};
    });

    return <>
        <div className="default-header">Rename Gametype</div>
        <div className="form">
            <div className="form-info">Rename an existing gametype</div>
            <DropDown dName="Target Gametype" data={gametypesDropDown} changeSelected={(name, value) =>{

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