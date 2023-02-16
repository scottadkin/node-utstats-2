import {useEffect, useState, useReducer} from "react";
import Loading from "../Loading";
import ErrorMessage from "../ErrorMessage";
import Tabs from "../Tabs";
import InteractiveTable from "../InteractiveTable";
import Functions from "../../api/functions";
import CountryFlag from "../CountryFlag";
import Link from "next/link";

const reducer = (state, action) =>{

    switch(action.type){
        case "loaded": {
            return {
                "bLoading": false,
                "error": null,
                "soloCaps": action.payload.soloCaps,
                "assistCaps": action.payload.assistCaps,
                "gametypeNames": action.payload.gametypeNames,
                "mapNames": action.payload.mapNames,
                "detailedCaps": action.payload.detailedCaps,
                "playerNames": action.payload.playerNames,
                "assistData": action.payload.assistData
            }
        }
        case "error": {
            return {
                "bLoading": false,
                "error": action.errorMessage
            }
        }
    }

    return state;
}

const renderTabs = (selectedTab, setSelectedTab) =>{

    const options = [
        {"name": "Solo Caps", "value": 0},
        {"name": "Assisted Caps", "value": 1}
    ];

    return <Tabs selectedValue={selectedTab} changeSelected={setSelectedTab} options={options} />
}


const getCapDetails = (state, capId) =>{

    if(state.detailedCaps[capId] !== undefined) return state.detailedCaps[capId];

    return {"capPlayer": -1, "grabPlayer": -1};
}


const renderData = (state, selectedTab) =>{

    const headers = {
        "map": "Map",
        "drop": "Time Dropped",
        "carry": "Carry Time",
        "capPlayer": "Capped By",
        "cap": "Travel Time",
    };


    let data = (selectedTab === 0) ? state.soloCaps : state.assistCaps;

    data = data.filter((cap) =>{
        if(cap.gametype_id === 0 && cap.cap_type === selectedTab) return true;
    });

    data.sort((a, b) =>{

        a = a.travel_time;
        b = b.travel_time;

        if(a < b) return -1;
        if(a > b) return 1;
        return 0;
    });

    console.log(state.playerNames);

    const rows = data.map((cap) =>{

        const mapName = (state.mapNames[cap.map_id] !== undefined) ?  state.mapNames[cap.map_id] : "NOT Found";

        //const test = getCapDetails(state, cap.cap_id);

        const capDetails = getCapDetails(state, cap.cap_id);
        console.log(capDetails);

        const capPlayer = Functions.getPlayer(state.playerNames, capDetails.cap_player, true);

        return {
            "map": {"value": mapName.toLowerCase(), "displayValue": mapName, "className": "text-left"},
            "drop": {"value": cap.drop_time, "displayValue": Functions.toPlaytime(cap.drop_time, true), "className": "playtime"},
            "carry": {"value": cap.carry_time, "displayValue": Functions.toPlaytime(cap.carry_time, true), "className": "playtime"},
            "cap": {"value": cap.travel_time, "displayValue": Functions.toPlaytime(cap.travel_time, true), "className": "playtime"},
            "capPlayer": {
                "value": capPlayer.name.toLowerCase(), 
                "displayValue": <Link href={`/player/${capPlayer.id}`}>
                    <a>
                        <CountryFlag country={capPlayer.country}/>{capPlayer.name}
                    </a>
                </Link>
            }
        }
    });
    

    return <InteractiveTable width={1} headers={headers} data={rows} />
}

const CTFCapRecords = ({}) =>{


    const [state, dispatch] = useReducer(reducer, {
        "bLoading": true,
        "error": null,
        "soloCaps": [],
        "assistCaps": [],
        "gametypeNames": {},
        "mapNames": {},
        "detailedCaps": {},
        "playerNames": {},
        "assistData": {}
    });

    const [selectedMode, setSelectedMode] = useState(0);
    const [selectedGametype, setSelectedGametype] = useState(0);

    useEffect(() =>{
     
        const controller = new AbortController();

        const loadData = async () =>{

            const req = await fetch("/api/ctf", {
                "signal": controller.signal,
                "headers": {"Content-type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({"mode": "map-cap-records"})
            });

            const res = await req.json();

            if(res.error !== undefined){
                dispatch({"type": "error", "errorMessage": res.error});
            }else{
                dispatch({"type": "loaded", "payload": res});
            }

            console.log(res);
        }

        loadData();

        return () =>{

            return controller.abort();
        }
    }, []);


    if(state.bLoading) return <Loading/>;
    if(state.error !== null) return <ErrorMessage title="Capture The Flag Cap Records" text={state.error}/>

    return <div>
        <div className="default-header">CTF Map Cap Records</div>
        {renderTabs(selectedMode, setSelectedMode)}
        {renderData(state, selectedMode)}
    </div>
}

export default CTFCapRecords;