import { useEffect, useReducer } from "react";
import { notificationsInitial, notificationsReducer } from "../../reducers/notificationsReducer";
import NotificationsCluster from "../NotificationsCluster";
import InteractiveTable from "../InteractiveTable";
import { toPlaytime, getPlayer } from "../../api/generic.mjs";
import CountryFlag from "../CountryFlag";
import Tabs from "../Tabs";
import Loading from "../Loading";


const reducer = (state, action) =>{

    switch(action.type){

        case "setLoading": {
            return {
                ...state,
                "bLoading": action.value
            }
        }
        case "loaded-list": {
            return {
                ...state,
                "currentList": action.forceList,
                "usage": action.usage,
                "playerNames": action.playerNames,
                "loadedList": true
            }
        }
        case "change-mode": {
            return {
                ...state,
                "mode": action.value
            }
        }
        case "set-hwid": {
            return {
                ...state,
                "selectedHWID": action.value
            }
        }
        case "set-name": {
            return {
                ...state,
                "selectedName": action.value
            }
        }
        case "reset-selected":{
            return {
                ...state,
                "selectedHWID": "",
                "selectedName": ""
            }
        }
        case "add-to-force-list": {

            return {
                ...state,
                "currentList": [
                    ...state.currentList, 
                    {
                        "id": -1, 
                        "hwid": action.hwid, 
                        "player_name": action.name
                    }
                ]
            }
        }
        case "remove-from-force-list":{

            const rem = [];

            for(let i = 0; i < state.currentList.length; i++){

                const c = state.currentList[i];

                if(c.hwid !== action.hwid){
                    rem.push(c);
                }
            }
            return {
                ...state,
                "currentList": rem
            }
        }
    }

    return state;
}

const loadList = async (controller, dispatch, nDispatch) =>{

    try{

        const req = await fetch("/api/adminplayers", {
            "signal": controller.signal,
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "force-hwid-to-name-list"})
        });

        const res = await req.json();

        if(res.error !== undefined) throw new Error(res.error);

        dispatch({"type": "loaded-list", ...res});

        console.log(res);

    }catch(err){
        if(err.name === "AbortError") return;
        console.trace(err);
        nDispatch({"type": "add", "notification": {"type": "error", "content": err.toString()}});
    }
}

const deleteEntry = async (dispatch, nDispatch, hwid) =>{

    try{

        const req = await fetch("/api/adminplayers", {
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "remove-force-hwid-to-name", "hwid": hwid})
        });

        const res = await req.json();

        if(res.error) throw new Error(res.error);

        dispatch({"type": "remove-from-force-list", "hwid": hwid});
        nDispatch({"type": "add", "notification": {"type": "pass", "content": <>Removed force name use for HWID = {hwid}</>}});

    }catch(err){
        nDispatch({"type": "add", "notification": {"type": "error", "content": err.toString()}});
    }
}

const renderCurrentList = (state, dispatch, nDispatch) =>{

    if(state.mode !== 0) return null;

    if(!state.loadedList) return <Loading />;

    const headers = {
        "hwid": "HWID",
        "name": "Import as",
        "remove": "Remove Force Name Change"
    };

    const data = state.currentList.map((d) =>{
        return {
            "hwid": {"value": d.hwid.toLowerCase(), "displayValue": d.hwid, "className": "text-left"},
            "name": {"value": d.player_name.toLowerCase(), "displayValue": d.player_name},
            "remove": {"displayValue": <>
                <input type="button" className="button" value="Remove Name Override" onClick={async () =>{

                    await deleteEntry(dispatch, nDispatch, d.hwid);
                   
                }}/>
            </>}
        }
    });

    return <>
        <div className="default-sub-header m-top-25">Current Settings</div>
        <InteractiveTable width={1} headers={headers} data={data}/>
    </>
}

const renderUsageList = (state, dispatch) =>{

    if(state.mode !== 1) return null;

    if(!state.loadedList) return <Loading />;

    const headers = {
        "hwid": "HWID",
        "used": "Used By",
        "playtime": "Total Playtime"
    };

    const totals = {};

    for(let i = 0; i < state.usage.length; i++){

        const u = state.usage[i];

        if(totals[u.hwid] === undefined){
            totals[u.hwid] = [];
        }

        totals[u.hwid].push(u);
    }

    const rows = [];

    for(const [hwid, data] of Object.entries(totals)){

        const playerElems = [];
        let playtime = 0;

        data.sort((a, b) =>{
            a = a.total_playtime;
            b = b.total_playtime;

            if(a < b) return 1;
            if(a > b) return -1;
            return 0;
        });

        for(let i = 0; i < data.length; i++){

            const d = data[i];
            //console.log(d);

            const player = getPlayer(state.playerNames, d.player_id, true);

            playtime += d.total_playtime;

            playerElems.push(<div key={`${i}-${d.player_id}`}>
                <CountryFlag country={player.country}/><span className="hover" onClick={() =>{
                    dispatch({"type": "set-name", "value": player.name});
                }}>{player.name}</span>&nbsp;
                <span className="playtime">({toPlaytime(d.total_playtime)})</span>
            </div>);
        }

        rows.push({
            "hwid": {"value": hwid, "className": "text-left hover", "displayValue": <span onClick={() =>{
                dispatch({"type": "set-hwid", "value": hwid});
                dispatch({"type": "change-mode", "value": 2});
            }}>{hwid}</span>},
            "used": {"value": playerElems.length, "displayValue": <>{playerElems}</>, "className": "text-left"},
            "playtime": {"value": playtime, "displayValue": toPlaytime(playtime), "className": "playtime"}
        });
    }


    return <>
        <div className="default-sub-header m-top-25">HWID Usage</div>
        <InteractiveTable width="1" headers={headers} data={rows}/>
    </>
}

const renderInfo = (state) =>{

    let content = <></>
    
    if(state.mode === 0 || state.mode === 2){
        content = <>
            Force a player to be imported as a certain name by using a player&apos;s HWID.<br/>
            If the player doesn&apos;t exist the importrt will create the new player profile when it incounters the target HWID.
        </>;
    }

    if(state.mode === 1){
        content = <>HWID usage based on player match data.<br/>
            Click on a player name to set it as the target name.<br/>
            Click on a HWID to select the HWID and be taken to the force name tab.    
        </>;
    }

    return <div className="form">
        <div className="form-info">
            {content}
        </div>
    </div>;
}

const saveChanges = async (state, dispatch, nDispatch) =>{

    try{

        const req = await fetch("/api/adminplayers", {
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({
                "mode": "set-force-hwid-to-name", 
                "hwid": state.selectedHWID, 
                "name": state.selectedName
            })
        });

        const res = await req.json();

        if(res.error !== undefined) throw new Error(res.error);
        nDispatch({
            "type": "add", "notification": 
            {
                "type": "pass", 
                "content": <>The player with the HWID of <b>{state.selectedHWID}</b> is now forced to import as the player named <b>{state.selectedName}</b>.</>
            }
        });
        dispatch({"type": "add-to-force-list", "hwid": state.selectedHWID, "name": state.selectedName});
        dispatch({"type": "reset-selected"});
        

    }catch(err){
        console.trace(err);
        nDispatch({"type": "add", "notification": {"type": "error", "content": err.toString()}});
    }
}

const renderAssignHWIDToName = (state, dispatch, nDispatch) =>{

    if(state.mode !== 2) return null;

    let submit = "";
    let warnings = null;

    const isUsedBy = [];

    for(let i = 0; i < state.currentList.length; i++){

        const c = state.currentList[i];

        if(c.player_name.toLowerCase() === state.selectedName.toLowerCase()){
            isUsedBy.push(<div key={c.hwid}>HWID: <b>{c.hwid}</b>, is also set to import as player named <b>{c.player_name}</b>.</div>);
        }
    }

    if(isUsedBy.length > 0){

        warnings = <div className="team-yellow p-10 m-bottom-25">
            <div className="default-sub-header-alt">Note</div>
            {isUsedBy}
            <div className="default-sub-header-alt p-10">Warning</div>
            <div>If more than one players are in the same match they will be merged into one player on import.</div>
        </div>
    }

    if(state.selectedHWID !== "" && state.selectedName !== ""){
        submit = <input type="button" className="search-button" value="Apply Change" onClick={() =>{
            saveChanges(state, dispatch, nDispatch);
        }}/>;
    }

    

    
    

    return <div className="form">
        <div className="form-row">
            <div className="form-label">Target HWID</div>
            <input type="text" 
                className="default-textbox" 
                placeholder="Target hwid..."
                value={state.selectedHWID} 
                onChange={(e) =>{
                    dispatch({"type": "set-hwid", "value": e.target.value});
                }}
            />
        </div>
        <div className="form-row">
            <div className="form-label">Name To Use</div>
            <input type="text" 
                className="default-textbox" 
                placeholder="Name..."
                value={state.selectedName}
                onChange={(e) =>{
                    dispatch({"type": "set-name", "value": e.target.value});
                }}
            />
        </div>
        {warnings}
        {submit}
    </div>
}

const AdminPlayerNameHWID = () =>{

    const [state, dispatch] = useReducer(reducer, {
        "mode": 0,
        "currentList": [],
        "usage": [],
        "playerNames": {},
        "selectedHWID": "",
        "selectedName": "",
        "loadedList": false,
        "bLoading": true
    });
    
    const [nState, nDispatch] = useReducer(notificationsReducer, notificationsInitial);

    useEffect(() =>{

        const controller = new AbortController();

        loadList(controller, dispatch, nDispatch);

        return () =>{
            controller.abort();
        }

    },[]);

    return <>    
        <div className="default-header">HWID Tools</div>
        <Tabs options={[
                {"name": "Current Settings", "value": 0},
                {"name": "HWID Usage", "value": 1},
                {"name": "Force HWID To Use Name", "value": 2},
            ]} 
            selectedValue={state.mode}
            changeSelected={(id) =>{
                dispatch({"type": "change-mode", "value": id});
            }}
        />
        {renderInfo(state)}
        
        <NotificationsCluster 
            width={1} 
            notifications={nState.notifications} 
            clearAll={() => nDispatch({"type": "clearAll"})}
            hide={(id) => { nDispatch({"type": "delete", "id": id})}}
        />
        {renderCurrentList(state, dispatch, nDispatch)}
        {renderUsageList(state, dispatch)}   
        {renderAssignHWIDToName(state, dispatch, nDispatch)}
    </>
}

export default AdminPlayerNameHWID;