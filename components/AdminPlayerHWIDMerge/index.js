import { useEffect, useReducer } from "react";
import Loading from "../Loading";
import ErrorMessage from "../ErrorMessage";
import InteractiveTable from "../InteractiveTable";
import CountryFlag from "../CountryFlag";
import Functions from "../../api/functions";
import DropDown from "../DropDown";
import styles from "./AdminPlayerHWIDMerge.module.css";

const reducer = (state, action) =>{

    switch(action.type){
        case "loaded": {
            return {
                ...state,
                "bLoading": false,
                "loadError": null,
                "playersList": action.players,
                "hwidList": action.hwids
            }
        }
        case "loadError": {
            return {
                ...state,
                "bLoading": false,
                "loadError": action.errorMessage
            }
        }
        case "changeSelectedHWID": {
            return {
                ...state,
                "selectedHWID": action.hwid
            }
        }
        case "setSelectedPlayerIds": {
            return {
                ...state,
                "selectedPlayerIds": action.selectedPlayerIds
            }
        }
    }

    return state;
}

const addPlayer = (state, dispatch, playerId) =>{

    playerId = parseInt(playerId);
    const previous = new Set([...state.selectedPlayerIds]);

    previous.add(playerId);

    dispatch({"type": "setSelectedPlayerIds", "selectedPlayerIds": [...previous]});
}

const removePlayer = (state, dispatch, playerId) =>{

    playerId = parseInt(playerId);

    const players = [];

    for(let i = 0; i < state.selectedPlayerIds.length; i++){

        const p = state.selectedPlayerIds[i];

        if(p !== playerId) players.push(p);
    }

    dispatch({"type": "setSelectedPlayerIds", "selectedPlayerIds": [...players]});
}

const renderPlayers = (state, dispatch) =>{

    const headers = {
        "name": "Player",
        "hwid": "HWID",
        "matches": "Matches",
        "last": "Last Seen"
    };

    const data = state.playersList.map((player) =>{

        return {
            "name": {
                "value": player.name.toLowerCase(),
                "displayValue": <div onClick={() => addPlayer(state, dispatch, player.id)}><CountryFlag country={player.country}/>{player.name}</div>,
                "className": "text-left hover"
            },
            "hwid": {
                "value": player.hwid
            },
            "matches": {
                "value": player.matches
            },
            "last": {
                "value": player.last,
                "displayValue": Functions.convertTimestamp(player.last, true)
            },
            
        }
    });


    return <InteractiveTable width={1} headers={headers} data={data}/>
}

const createPlayerDropDown = (state) =>{

    return state.hwidList.map((player) =>{
        return {"value": player.hwid, "displayValue": <><CountryFlag country={player.country}/>{player.name} - <b>{player.hwid}</b></>};
    });
}

const getPlayer = (state, playerId) =>{

    playerId = parseInt(playerId);

    for(let i = 0; i < state.playersList.length; i++){

        const p = state.playersList[i];

        if(p.id === playerId) return {"id": p.id, "name": p.name, "country": p.country};

    }

    return {"id": -1, "name": "Not Found", "country": "xx"};
}

const renderSelectedPlayers = (state, dispatch) =>{

    const elems = [];


    for(let i = 0; i < state.selectedPlayerIds.length; i++){

        const s = state.selectedPlayerIds[i];

        const player = getPlayer(state, s);

        elems.push(<div className={styles.tag} key={player.id}>
            <img className={`${styles.x} hover`} src={"/images/controlpoint.png"} alt="image" onClick={() => removePlayer(state, dispatch, player.id)}/>
            <CountryFlag country={player.country}/>{player.name}
        </div>);
    }


    if(elems.length === 0) return null;

    return <div>
        <div className="default-sub-header">Selected Players</div>
        {elems}
    </div>
}

const renderForm = (state, dispatch) =>{

    return <div className="form m-bottom-10">
        <div className="default-sub-header">Set Player HWIDs</div>
        <DropDown 
            dName="HWID" 
            fName="selectedHWID" 
            originalValue={-1} 
            data={createPlayerDropDown(state)} 
            changeSelected={(name, value) =>{
                dispatch({"type": "changeSelectedHWID", "hwid": value});
            }}
        />
        <div className="form-info">
            Click on a player&apos;s name below, to add to a list of players you would like to use the HWID specified above.
        </div>
        {renderSelectedPlayers(state, dispatch)}
    </div>
}

const AdminPlayerHWIDMerge = ({}) =>{


    const [state, dispatch] = useReducer(reducer, {
        "bLoading": true,
        "loadError": null,
        "playersList": [],
        "hwidsList": [],
        "selectedHWID": -1,
        "selectedPlayerIds": []
    });


    useEffect(() =>{

        const controller = new AbortController();

        const loadData = async () =>{

            const req = await fetch("/api/adminplayers",{
                "signal": controller.signal,
                "headers": {"Content-type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({"mode": "players-hwid-list"})
            });

            const res = await req.json();

            if(res.error !== undefined){
                dispatch({"type": "loadError", "errorMessage": res.error});
                return;
            }

            dispatch({"type": "loaded", "players": res.players, "hwids": res.hwidList});
        }

        loadData();

        return () => controller.abort();
    }, []);

    if(state.bLoading) return <Loading />;
    if(state.loadError !== null) return <ErrorMessage title={"Merge Player By HWID"} text={state.loadError}/>
    
    return <div>
        <div className="default-header">Merge Player By HWID</div>
        {renderForm(state, dispatch)}
        {renderPlayers(state, dispatch)}
    </div>
}

export default AdminPlayerHWIDMerge;