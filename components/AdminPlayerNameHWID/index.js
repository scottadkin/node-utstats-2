import { useEffect, useReducer } from "react";
import { notificationsInitial, notificationsReducer } from "../../reducers/notificationsReducer";
import NotificationsCluster from "../NotificationsCluster";
import InteractiveTable from "../InteractiveTable";
import { toPlaytime, getPlayer } from "../../api/generic.mjs";
import CountryFlag from "../CountryFlag";
import Tabs from "../Tabs";


const reducer = (state, action) =>{

    switch(action.type){

        case "loaded-list": {
            return {
                ...state,
                "currentList": action.forceList,
                "usage": action.usage,
                "playerNames": action.playerNames
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

const renderCurrentList = (state) =>{

    if(state.mode !== 0) return null;

    const headers = {
        "hwid": "HWID",
        "name": "Import as"
    };

    const data = state.currentList.map((d) =>{
        return {
            "hwid": {"value": d.hwid.toLowerCase(), "displayValue": d.hwid, "className": "text-left"},
            "name": {"value": d.player_name.toLowerCase(), "displayValue": d.player_name}
        }
    });

    return <>
        <div className="default-sub-header m-top-25">Current Settings</div>
        <InteractiveTable width={1} headers={headers} data={data}/>
    </>
}

const renderUsageList = (state, dispatch) =>{

    if(state.mode !== 1) return null;

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

        console.log(res);

        

    }catch(err){
        console.trace(err);
        nDispatch({"type": "add", "notification": {"type": "error", "content": err.toString()}});
    }
}

const renderAssignHWIDToName = (state, dispatch, nDispatch) =>{

    if(state.mode !== 2) return null;

    let submit = "";

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
        {submit}
    </div>
}

const AdminPlayerNameHWID = () =>{

    const [state, dispatch] = useReducer(reducer, {
        "mode": 2,
        "currentList": [],
        "usage": [],
        "playerNames": {},
        "selectedHWID": "",
        "selectedName": ""
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
        {renderCurrentList(state)}
        {renderUsageList(state, dispatch)}   
        {renderAssignHWIDToName(state, dispatch, nDispatch)}
    </>
}

export default AdminPlayerNameHWID;