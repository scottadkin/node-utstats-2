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
                "aliasesByHWID": action.aliasesByHWID,
                "hwids": action.hwids
            }
        }
    }

    return state;
}

const renderIpHistory = (state, setIpSearch) =>{

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
            "ip": {"value": d.ip, "displayValue": <b onClick={() => setIpSearch(d.ip)}>{d.ip}</b>},
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


const renderAliasesByIp = (state) =>{

    const headers = {
        "name": "Name",
        "ip": "IP",
        "first": "First",
        "last": "Last",
        "matches": "Matches",
        "playtime": "Playtime"
    };

    const data = state.aliasesByIp.map((d) =>{
        console.log(d);
        return {
            "name": {
                "value": d.name.toLowerCase(), 
                "displayValue": <><CountryFlag country={d.country}/>{d.name}</>,
                "className": "text-left"
            },
            "ip": {"value": d.ip},
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

const renderAliasesByHWID = (state) =>{

    const headers = {
        "name": "Name",
        "hwid": "HWID",
        "first": "First",
        "last": "Last",
        "matches": "Matches",
        "playtime": "Playtime"
    };

    const data = state.aliasesByHWID.map((d) =>{
        return {
            "name": {
                "value": d.playerInfo.name.toLowerCase(), 
                "displayValue": <><CountryFlag country={d.playerInfo.country}/>{d.playerInfo.name}</>,
                "className": "text-left"
            },
            "hwid": {"value": d.hwid.toUpperCase()},
            "first": {"value": d.first_match, "displayValue": convertTimestamp(d.first_match, true)},
            "last": {"value": d.last_match, "displayValue": convertTimestamp(d.last_match, true)},
            "matches": {"value": d.total_matches},
            "playtime": {"value": d.total_playtime, "displayValue": toPlaytime(d.total_playtime)},
        }
    });

    return <>
        <div className="default-header">Possible aliases by HWID</div>
        <InteractiveTable width={1} headers={headers} data={data}/>
    </>
}

const loadData = async (playerId, dispatch, controller) =>{



    //playerhistory
    try{

        if(playerId === -1){
            dispatch({"type": "loaded", "ips": [], "aliasesByIp": [], "hwids": [], "aliasesByHWID": []});
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
                "aliasesByHWID": res.aliasesByHWID,
                "hwids": res.usedHWIDs
            });

        }

    }catch(err){

        if(err.name === "AbortError") return null;
        console.trace(err);
    }

}

const AdminPlayerHistory = ({playerNames, selectedPlayerProfile, setIpSearch}) =>{

    const [state, dispatch] = useReducer(reducer, {
        "bLoading": true,
        "ipUsage":  [],
        "aliasesByIp": [],
        "aliasesByHWID": [],
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

        return <div>
            <div className="default-header">Player History</div>
            <div className="form">
                <div className="form-info">You have to select a player first.</div>
            </div>
        </div>;
    }

    const player = getPlayer(playerNames, selectedPlayerProfile);

    elems.push(<div key="pinfo" className="p-5">
        Selected player is <CountryFlag country={player.country}/><b>{player.name}</b>
    </div>);

    

    return <div>
        <div className="default-header">Player History</div>
        <div className="default-box">
            {elems}
        </div>
        <Loading value={!state.bLoading}/>
        {renderIpHistory(state, setIpSearch)}
        {renderHWIDs(state)}
        {renderAliasesByHWID(state)}
        {renderAliasesByIp(state)}   
    </div>
}


export default AdminPlayerHistory;