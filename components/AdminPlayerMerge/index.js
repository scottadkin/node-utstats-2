import {useEffect, useReducer} from "react";
import Loading from "../Loading";
import ErrorMessage from "../ErrorMessage";
import InteractivePlayerSearchBox from "../InteractivePlayerSearchBox";
import { getPlayer } from "../../api/generic.mjs";
import CountryFlag from "../CountryFlag";
import styles from "./AdminPlayerMerge.module.css";
import NotificationSmall from "../NotificationSmall";
import NotificationsCluster from "../NotificationsCluster";
import useNotificationCluster from "../useNotificationCluster";


const reducer = (state, action) =>{

    switch(action.type){

        case "loaded": {
            return {
                ...state,
                "bLoading": false
            }
        }
        case "error": {
            return {
                ...state,
                "bLoading": false,
                "error": action.errorMessage,
                "notificationType": "error",
                "notificationTitle": "Error",
                "notificationText": action.errorMessage
            }
        }
        case "loadedPlayerList": {

            return {
                ...state,
                "error": null,
                "bLoading": false,
                "playerList": action.playerList
            }
        }
        case "togglePlayer": {

            let newPlayers = [];


            const index = state.selectedPlayers.indexOf(action.targetPlayer);

            if(index !== -1){

                for(let i = 0; i < state.selectedPlayers.length; i++){

                    const id = state.selectedPlayers[i];

                    if(id === action.targetPlayer){
                        continue;
                    }

                    newPlayers.push(id);
                }
            }else{

                newPlayers = [...state.selectedPlayers, action.targetPlayer];
            }

            //if playerId is not in array add it otherwise remove
            return {
                ...state,
                "selectedPlayers": newPlayers
            }
        }
        case "setMasterPlayer": {

            let newArray = [];

            if(state.masterPlayer.length > 0){

                const current = state.masterPlayer[0];

                if(current !== action.value){
                    newArray.push(action.value);
                }

            }else{
                newArray.push(action.value);
            }
            return {
                ...state,
                "masterPlayer": newArray
            }
        }
        case "updateTargetSearch": {
            return {
                ...state,
                "targetSearch": action.value
            }
        }
        case "updateMasterSearch": {
            return {
                ...state,
                "masterSearch": action.value
            }
        }
        case "mergePlayers": {
            return {
                ...state,
                "bMergeInProgress": true,
                "notificationType": "warning",
                "notificationTitle": "Merging In Progress",
                "notificationText": "Please wait...",
                "currentMergedList": []

            }
        }
        case "updateCurrentMergedList": {

            return {
                ...state,
                "currentMergedList": [...state.currentMergedList, {
                    "type": action.messageType, 
                    "targetPlayer": action.targetPlayer, 
                    "masterPlayer": action.masterPlayer, 
                    "message": action.message
                }]
            }
        }

        case "currentMergeFinished": {
            return {
                ...state,
                "bMergeInProgress": false,
                "notificationType": "pass",
                "notificationTitle": "Finished",
                "notificationText": "Merging players completed.",

            }
        }

        case "updatePlayerList": {
            return {
                ...state,
                "playerList": action.playerList,
                "selectedPlayers": [],
                "masterPlayer": [],
                "targetSearch": "",
                "masterSearch": ""
            }
        }

        case "setNotifications": {
            return {
                ...state,
                "notifications": action.notifications
            }
        }
    }

    return state;
}

const loadPlayerList = async (dispatch, controller) =>{

    try{

        const req = await fetch("/api/adminplayers", {
            "signal": controller.signal,
            "headers": {
                "Content-type": "application/json"
            },
            "method": "POST",
            "body": JSON.stringify({"mode": "player-list"})
        });

        const res = await req.json();

        if(res.error !== undefined){
            dispatch({"type": "error", "errorMessage": res.error});
            return;
        }

        dispatch({"type": "loadedPlayerList", "error": null, "playerList": res.players});

    }catch(err){

        if(err.name === "AbortError") return;
        dispatch({"type": "error", "errorMessage": err.toString()});
    }
}

const renderSelectedPlayers = (state, dispatch, bMaster) =>{

    const players = (bMaster) ? state.masterPlayer  : state.selectedPlayers;
    const title = (bMaster) ? "Will be merged into"  : `Selected Players (${state.selectedPlayers.length})`;

    const elems = players.map((id) =>{

        const player = getPlayer(state.playerList, id, false);

        return <div key={id} className={styles.selected} onClick={() =>{

            if(!bMaster){
                dispatch({"type": "togglePlayer", "targetPlayer": id});
            }else{
                dispatch({"type": "setMasterPlayer", "value": id});
            }

        }}><CountryFlag country={player.country}/>{player.name}</div>

    });

    if(elems.length === 0 && bMaster){
        return null;
    }else if(elems.length === 0 && !bMaster){
        elems.push(<div key="none" className="small-font grey">None Selected</div>);
    }

    return <div className="m-bottom-25">
        <div className="default-sub-header">{title}</div>
        {elems}
    </div>
}

const mergePlayer = async (state, dispatch, playerId, masterPlayerId) =>{

    try{

        const req = await fetch("/api/adminplayers", {
            "headers": {
                "Content-type": "application/json"
            },
            "method": "POST",
            "body": JSON.stringify({"mode": "merge", "player1": playerId, "player2": masterPlayerId})
        });

        const res = await req.json();

        const targetPlayer = getPlayer(state.playerList, playerId, false);
        const masterPlayer = getPlayer(state.playerList, masterPlayerId, false);

        if(res.error === undefined){

            dispatch({
                "type": "updateCurrentMergedList",
                "messageType": "pass", 
                "targetPlayer": targetPlayer,
                "masterPlayer": masterPlayer,
                "message": ""
            });

            return;

        }else{

            dispatch({
                "type": "updateCurrentMergedList",
                "messageType": "fail",       
                "targetPlayer": targetPlayer,
                "masterPlayer": masterPlayer,
                "message": res.error
                
            });

            return;
        }

    }catch(err){
        console.trace(err);
    }
}

const removeMergedPlayers = (state) =>{

    const remainingPlayers = [];

    for(let i = 0; i < state.playerList.length; i++){

        const p = state.playerList[i];

        if(state.selectedPlayers.indexOf(p.id) === -1){
            remainingPlayers.push(p);
        }
    }

    return remainingPlayers
}

const mergePlayers = async (state, dispatch) =>{


    if(state.masterPlayer.length === 0){
        return;
    }

    dispatch({"type": "mergePlayers"});
    
    for(let i = 0; i < state.selectedPlayers.length; i++){

        const targetPlayer = state.selectedPlayers[i];

        await mergePlayer(state, dispatch, targetPlayer, state.masterPlayer[0]);
    }

    dispatch({"type": "currentMergeFinished"});

    dispatch({"type": "updatePlayerList", "playerList": removeMergedPlayers(state)});

}

const renderButton = (state, dispatch) =>{

    if(state.selectedPlayers.length === 0 || state.masterPlayer.length === 0) return null;
    if(state.bMergeInProgress) return null;

    return <div className="search-button m-top-25" onClick={() =>{
        mergePlayers(state, dispatch);
    }}>Merge Players</div>;
}

const renderNotification = (state) =>{

    if(state.notificationType === null) return null;

    return <NotificationSmall type={state.notificationType} title={state.notificationTitle}>
        {state.notificationText}
        
    </NotificationSmall>;
}

const renderMergeNotifications = (state) =>{

    const elems = state.currentMergedList.map((a, i) =>{

        let message = null;

        if(a.type === "pass"){

            message = <>
                <CountryFlag country={a.targetPlayer.country}/> {a.targetPlayer.name} merged into &nbsp;
                <CountryFlag country={a.masterPlayer.country}/> {a.masterPlayer.name}
            </>;
        }else{

            message = <>
                Failed to merge <CountryFlag country={a.targetPlayer.country}/>{a.targetPlayer.name} into&nbsp;
                <CountryFlag country={a.masterPlayer.country}/>{a.masterPlayer.name} <br/>
                {a.message}
            </>;
        }


        return <div key={i} className={`${styles.notification} ${(a.type === "pass") ? "team-green" : "team-red" }`}>
            <div className={styles["n-title"]}>{a.type.toUpperCase()}</div>
            <div className={styles["n-text"]}>
                {message}
            </div>
        </div>;
    });

    if(elems.length === 0) return null;

    return <div>{elems}</div>
}

const renderSearchBoxes = (state, dispatch) =>{

    if(state.bMergeInProgress) return null;

    return <>
        <div className="select-row">
        <div className="select-label">Search For A Target Player</div>
            <InteractivePlayerSearchBox searchValue={state.targetSearch} data={state.playerList} bAutoSet={false} setSearchValue={(value) =>{
                dispatch({"type": "updateTargetSearch", "value": value});
            }} togglePlayer={(value) =>{
                dispatch({"type": "togglePlayer", "targetPlayer": value});
            }} selectedPlayers={state.selectedPlayers}/>
        </div>
        
        <div className="select-row">
            <div className="select-label">Search For A Master Player</div>
            <InteractivePlayerSearchBox searchValue={state.masterSearch} 
                setSearchValue={(value) =>{
                    
                    dispatch({"type": "updateMasterSearch", "value": value});
                }}  
                data={state.playerList} togglePlayer={(value) =>{
                    dispatch({"type": "setMasterPlayer", "value": value});
                }} 
                bAutoSet={false}
                selectedPlayers={state.masterPlayer}
            />
        </div>
    </>
}

const AdminPlayerMerge = ({}) =>{


    const [state, dispatch] = useReducer(reducer, {
        "bLoading": true,
        "error": null,
        "playerList": [],
        "selectedPlayers": [],
        "masterPlayer": [],
        "targetSearch": "",
        "masterSearch": "",
        "notificationType": null,
        "notificationTitle": null,
        "notificationText": null,
        "bMergeInProgress": false,
        "currentMergedList": [],
        "notifications": [{"type": "pass",  "content": <>this is some content</>, "id": 0, "bDisplay": true},
        {"type": "error",  "content": <>this is some content</>, "id": 1, "bDisplay": true},
        {"type": "warning",  "content": <>this is some content</>, "id": 2, "bDisplay": true},
        {"type": "note", "content": <>this is some content</>, "id": 3, "bDisplay": true}]
    });


    const [addNotification, hideNotification] = useNotificationCluster();


    useEffect(() =>{

        const controller = new AbortController();
        loadPlayerList(dispatch, controller);

        return () =>{
            controller.abort();
        }

    }, []);

    return <div>
        <div className="default-header">Merge Players</div>
        <Loading value={!state.bLoading} />
        <div className="form">
            <div className="form-info">
                Select one or more players to be merged into another, the selected players will be merged into the master player&apos;s profile.
            </div>
            <b onClick={() =>{

                const newNotifications = addNotification(state.notifications, "pass", "action.content");
                dispatch({"type": "setNotifications", "notifications": newNotifications});

            }}>Add test</b>

            <NotificationsCluster notifications={state.notifications} hide={(id) =>{

                const newNotifications = hideNotification(state.notifications, id);
                dispatch({"type": "setNotifications", "notifications": newNotifications});
              
            }}/>
            {renderSelectedPlayers(state, dispatch, false)}
            {renderSelectedPlayers(state, dispatch, true)}
            {renderSearchBoxes(state, dispatch)}
            {renderButton(state, dispatch)}
            {renderNotification(state)}
            {renderMergeNotifications(state)}
        </div>
    </div>
}

export default AdminPlayerMerge;