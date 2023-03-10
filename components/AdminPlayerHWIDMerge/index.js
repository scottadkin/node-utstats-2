import { useEffect, useReducer } from "react";
import Loading from "../Loading";
import ErrorMessage from "../ErrorMessage";
import InteractiveTable from "../InteractiveTable";
import CountryFlag from "../CountryFlag";
import Functions from "../../api/functions";
import DropDown from "../DropDown";
import styles from "./AdminPlayerHWIDMerge.module.css";
import NotificationSmall from "../NotificationSmall";

const reducer = (state, action) =>{

    switch(action.type){
        case "loaded": {
            return {
                ...state,
                "bLoading": false,
                "loadError": null,
                "playersList": action.players,
                "hwidList": action.hwids,
                "bMergeInProgress": false,
                "mergeError": null
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
        case "start-merge": {
            return {
                ...state,
                "bMergeInProgress": true,
                "mergeError": null
            }
        }
        case "merge-pass": {
            return {
                ...state,
                "bMergeInProgress": false,
                "mergeError": null,
                "selectedPlayerIds": [],
                "selectedHWID": -1,
                "playersList": action.playersList
            }
        }
        case "merge-fail": {
            return {
                ...state,
                "bMergeInProgress": false,
                "mergeError": action.errorMessage
            }
        }
    }

    return state;
}

const addPlayer = (state, dispatch, playerId) =>{

    playerId = parseInt(playerId);

    if(state.selectedPlayerIds.indexOf(playerId) !== -1){
        removePlayer(state, dispatch, playerId);
        return;
    }

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

        const selectedIndex = state.selectedPlayerIds.indexOf(player.id);

        const className = (selectedIndex === -1) ? "" : styles.selected;

        return {
            "name": {
                "value": player.name.toLowerCase(),
                "displayValue": <div onClick={() => addPlayer(state, dispatch, player.id)}><CountryFlag country={player.country}/>{player.name}</div>,
                "className": `text-left hover no-select ${className}`
            },
            "hwid": {
                "value": player.hwid,
                "className": className
            },
            "matches": {
                "value": player.matches,
                "className": className
            },
            "last": {
                "value": player.last,
                "displayValue": Functions.convertTimestamp(player.last, true),
                "className": className
            }
            
        }
    });


    return <InteractiveTable width={1} headers={headers} data={data}/>
}

const createPlayerDropDown = (state) =>{

    const players = state.hwidList.map((player) =>{
        return {"value": player.hwid, "displayValue": <><CountryFlag country={player.country}/>{player.name} - <b>{player.hwid}</b></>};
    });

    players.unshift({"value": -1, "displayValue": "Please select a HWID"});

    return players;
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
    const players = [];

    for(let i = 0; i < state.selectedPlayerIds.length; i++){

        const s = state.selectedPlayerIds[i];
        players.push(getPlayer(state, s));
    }

    players.sort((a, b) =>{

        a = a.name.toLowerCase();
        b = b.name.toLowerCase();

        if(a < b) return -1;
        if(a > b) return 1;
        return 0;
    });

    for(let i = 0; i < players.length; i++){

        const p = players[i];

        elems.push(<div className={styles.tag} key={p.id}>
            <img className={`${styles.x} hover`} src={"/images/controlpoint.png"} alt="image" onClick={() => removePlayer(state, dispatch, p.id)}/>
            <CountryFlag country={p.country}/>{p.name}
        </div>);
    }


    if(elems.length === 0) return null;

    return <div>
        <div className="default-sub-header">Selected Players</div>
        {elems}
    </div>
}

const setPlayersHWID = async (state, dispatch) =>{

    dispatch({"type": "start-merge"});

    const req = await fetch("/api/adminplayers",{
        "headers": {"Content-type": "application/json"},
        "method": "POST",
        "body": JSON.stringify({"mode": "assign-hwid", "hwid": state.selectedHWID, "playerIds": state.selectedPlayerIds})
    });

    const res = await req.json();

    if(res.error !== undefined){
        dispatch({"type": "merge-fail", "errorMessage": res.error});
        return;
    }

    const removedPlayers = res.removedPlayerIds;

    const remainingPlayers = [];

    for(let i = 0; i < state.playersList.length; i++){

        const p = state.playersList[i];

        if(removedPlayers.indexOf(p.id) === -1){
            remainingPlayers.push(p);
        }
    }

    dispatch({"type": "merge-pass", "playersList": remainingPlayers});
    
}   

const renderForm = (state, dispatch) =>{


    const button = <div className="search-button m-top-10" onClick={() => setPlayersHWID(state, dispatch)}>Set Players HWID</div>;
    const formInfo2 = <div className="form-info">
        The players above will all be assigned the HWID of <b>{state.selectedHWID}</b>, and then merged into a single player using the last know name.
    </div>;

    if(state.bMergeInProgress){

        return <div className="form m-bottom-10">
            <div className="default-sub-header">Set Player HWIDs</div>
            <Loading>
                Merging players, please wait.
            </Loading>
        </div>
    }

    return <div className="form m-bottom-10">
        <div className="default-sub-header">Set Player HWIDs</div>
        <DropDown 
            dName="Target HWID" 
            fName="changeSelectedHWID" 
            originalValue={-1} 
            data={createPlayerDropDown(state)} 
            changeSelected={(name, value) =>{
                dispatch({"type": name, "hwid": value});
            }}
        />
        <div className="form-info">
            Click on a player&apos;s name below to add it to a list of players you would like to assign the HWID selected above.
        </div>
        {renderSelectedPlayers(state, dispatch)}
        {(state.selectedPlayerIds.length > 0 && state.selectedHWID !== -1) ? formInfo2 : null}
        {(state.mergeError !== null) ? <NotificationSmall type="error">{state.mergeError}</NotificationSmall> : null }
        {(state.selectedPlayerIds.length > 0 && state.selectedHWID !== -1) ? button : null}
    </div>
}

const AdminPlayerHWIDMerge = ({}) =>{


    const [state, dispatch] = useReducer(reducer, {
        "bLoading": true,
        "loadError": null,
        "playersList": [],
        "hwidsList": [],
        "selectedHWID": -1,
        "selectedPlayerIds": [],
        "bMergeInProgress": false,
        "mergeError": null
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