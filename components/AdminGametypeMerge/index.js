import { useState } from "react";
import DropDown from "../DropDown";
import Loading from "../Loading";
import Checkbox from "../Checkbox";

const mergeGametypes = async (dispatch, nDispatch, oldId, newId, oldName, newName, bAutoMerge) =>{

    try{

        const req = await fetch("/api/gametypeadmin", {
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({
                "mode": "merge", 
                "oldGametypeId": oldId, 
                "newGametypeId": newId,
                "bAutoMergeAfter": bAutoMerge
            })
        });

        const res = await req.json();

        if(res.error !== undefined){
            nDispatch({"type": "add", "notification": {"type": "error", "content": res.error}});
            return;
        }

        if(!bAutoMerge){
            dispatch({"type": "delete", "targetId": oldId});
        }
        nDispatch({"type": "add", "notification": {"type": "pass", "content": 
            <>Merged gametype id <b>{oldName}</b> into <b>{newName}</b> successfully.</>
        }});

    }catch(err){
        console.trace(err);
        nDispatch({"type": "add", "notification": {"type": "error", "content": err.toString()}});
    }
}

const AdminGametypeMerge = ({idsToNames, gametypes, dispatch, nDispatch}) =>{

    const [bLoading, setBLoading] = useState(false);
    const [gametype1, setGametype1] = useState(null);
    const [gametype2, setGametype2] = useState(null);
    const [bAutoMergeAfter, setBAutoMergeAfter] = useState(true);

    const dropDownOptions = gametypes.map((g) =>{
        return {"value": g.id, "displayValue": g.name};
    });

    const elems = [];

    const gametype1Name = idsToNames[gametype1] ?? "Gametype 1";
    const gametype2Name = idsToNames[gametype2] ?? "Gametype 2";

    
    if(bLoading){
        elems.push(
            <Loading 
                key="loading" 
                value={!bLoading}>Merging gametype <b>{gametype1Name}</b> into <b>{gametype2Name}</b> please wait.
            </Loading>);
    }else{
        elems.push(
            <DropDown key="g1" dName="Gametype 1" data={dropDownOptions} selectedValue={gametype1} changeSelected={(name, value) => setGametype1(value)}/>,
            <DropDown key="g2" dName="Gametype 2" data={dropDownOptions} selectedValue={gametype2} changeSelected={(name, value) => setGametype2(value)}/>,
            <div className="form-row" key="cb">
                <div className="form-label">Auto merge new imports</div>
                <Checkbox name="test" checked={bAutoMergeAfter} setChecked={() => setBAutoMergeAfter(prev => !prev)}/>
            </div>
        );
    }

    if(!bLoading){

        if(gametype1 === gametype2 && gametype1 !== null){

            elems.push(<div key="warn" className="grey p-10">You can not merge a gametype into itself.</div>);

        }else if(gametype1 !== null && gametype2 !== null){

            elems.push(

            <div key="button" className="search-button" onClick={async () => {
                        setBLoading(true);
                        await mergeGametypes(
                            dispatch, 
                            nDispatch, 
                            gametype1, 
                            gametype2, 
                            gametype1Name,
                            gametype2Name,
                            bAutoMergeAfter
                        );
                        setBLoading(false);
                    }
                }>Merge Gametypes</div>
            );
        }
    }

    return <>
        <div className="default-header">Merge Gametypes</div>
        <div className="form">
            <div className="form-info">Merge one gametype into another.<br/> 
                <b>{gametype1Name}</b> will be merged into <b>{gametype2Name}</b>, taking <b>{gametype2Name}</b>&apos;s name.
            <br/>
            If auto merge new imports is enabled any log that has <b>{gametype1Name}</b>&apos;s name will automatically be set to <b>{gametype2Name}</b>.
            </div>    
            {elems}
        </div>
    </>
}

export default AdminGametypeMerge;