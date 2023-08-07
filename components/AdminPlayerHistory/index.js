import { getPlayer } from "../../api/generic.mjs";
import CountryFlag from "../CountryFlag";
import InteractiveTable from "../InteractiveTable";
import { useEffect, useReducer } from "react";
import Loading from "../Loading";
import { convertTimestamp, toPlaytime } from "../../api/generic.mjs";

const reducer = (state, action) =>{

    switch(action.type){

        case "start": {
            return {
                ...state,
                "bLoading": true,
                "ipUsage": [],
                "aliasesByIp": [],
                "hwids": []
            }
        }
        case "loaded": {
            return {
                ...state,
                "bLoading": false,
                "ipUsage": action.ips,
                "aliasesByIp": action.aliasesByIp,
                "hwids": action.hwids
            }
        }
    }

    return state;
}

const renderIpHistory = (state) =>{

    if(state.bLoading) return null;

    const headers = {
        "ip": "IP",
        "first": "First Used",
        "last": "Last Used",
        "matches": "Matches",
        "playtime": "Playtime"
        
    };

    console.log(state);
    const data = state.ipUsage.map((d) =>{

        return {
            "first": {"value": d.first_match, "displayValue": convertTimestamp(d.first_match, true)},
            "last": {"value": d.last_match, "displayValue": convertTimestamp(d.last_match, true)},
            "ip": {"value": d.ip},
            "matches": {"value": d.total_matches},
            "playtime": {"value": d.playtime, "displayValue": toPlaytime(d.total_playtime), "className": "playtime"}
        }
    });

    return <>
        <div className="default-header">IP Usage</div>
        <InteractiveTable width={1} headers={headers} data={data} />
    </>
}

const renderHWIDs = (state) =>{

    const headers = {
        "hwid": "HWID",
        "first": "First Used",
        "last": "Last Used",
        "total": "Total Uses"
    };

    const data = state.hwids.map((d) =>{

        return {
            "hwid": {"value": (d.hwid === "") ? "None" : d.hwid},
            "first": {"value": d.first_match, "displayValue": convertTimestamp(d.first_match, true)},
            "last": {"value": d.last_match, "displayValue": convertTimestamp(d.last_match, true)},
            "total": {"value": d.total_uses},
        }
    });

    return <>
        <div className="default-header">HWID Usage</div>
        <InteractiveTable width={1} headers={headers} data={data}/>
    </>;
}


const renderAliases = (state) =>{

    const headers = {
        "name": "Name",
        "first": "First",
        "last": "Last",
        "matches": "Matches",
        "playtime": "Playtime"
    };

    const data = state.aliasesByIp.map((d) =>{
        return {
            "name": {
                "value": d.name.toLowerCase(), 
                "displayValue": <><CountryFlag country={d.country}/>{d.name}</>,
                "className": "text-left"
            },
            "first": {"value": d.first_match, "displayValue": convertTimestamp(d.first_match, true)},
            "last": {"value": d.last_match, "displayValue": convertTimestamp(d.last_match, true)},
            "matches": {"value": d.total_matches},
            "playtime": {"value": d.total_playtime, "displayValue": toPlaytime(d.total_playtime)},
        }
    });

    return <>
        <div className="default-header">Possible aliases by IP</div>
        <InteractiveTable width={1} headers={headers} data={data}/>
    </>
}

const loadData = async (playerId, dispatch, controller) =>{



    //playerhistory
    try{

        if(playerId === -1){
            dispatch({"type": "loaded", "ips": [], "aliases": [], "hwids": []});
            return;
        }

        const req = await fetch("/api/adminplayers", {
            "signal": controller.signal,
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "playerhistory", "playerId": playerId})
        });

        const res = await req.json();

        console.log(res);

        if(res.error === undefined){

            dispatch({
                "type": "loaded", 
                "ips": res.usedIps.data,
                "aliasesByIp": res.aliasesByIp,
                "hwids": res.usedHWIDs
            });

        }

    }catch(err){

        if(err.name === "AbortError") return null;
        console.trace(err);
    }

}

const AdminPlayerHistory = ({playerNames, selectedPlayerProfile}) =>{

    const [state, dispatch] = useReducer(reducer, {
        "bLoading": true,
        "ipUsage":  [],
        "aliasesByIp": [],
        "hwids": []
    });

    useEffect(() =>{

        const controller = new AbortController();

        dispatch({"type": "start"})

        loadData(selectedPlayerProfile, dispatch, controller);

        return () =>{
            controller.abort();
        }

    }, [selectedPlayerProfile]);

    const elems = [];

    if(selectedPlayerProfile === -1){
        elems.push(<div key="none">No Player Selected</div>);
    }else{

        const player = getPlayer(playerNames, selectedPlayerProfile);

        elems.push(<div key="pinfo">
            Selected player is <CountryFlag country={player.country}/><b>{player.name}</b>
        </div>);
    }

    

    return <div>
        <div className="default-header">Player History</div>
        <div className="default-box">
            {elems} {selectedPlayerProfile}
        </div>
        <Loading value={!state.bLoading}/>
        {renderIpHistory(state)}
        {renderHWIDs(state)}
        {renderAliases(state)}
    </div>
}


export default AdminPlayerHistory;