import {useEffect, useReducer} from "react";
import Loading from "../Loading";
import ErrorMessage from "../ErrorMessage";
import InteractivePlayerSearchBox from "../InteractivePlayerSearchBox";
import { getPlayer } from "../../api/generic.mjs";
import CountryFlag from "../CountryFlag";
import styles from "./AdminPlayerMerge.module.css";
import NotificationSmall from "../NotificationSmall";


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

    let index = 0;

    const elems = state.currentMergedList.map((a) =>{

        index++;

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


        return <div key={index} className={`${styles.notification} ${(a.type === "pass") ? "team-green" : "team-red" }`}>
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
        "currentMergedList": []
    });

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

/*
class AdminPlayerMerge extends React.Component{

    constructor(props){

        super(props);

        this.state = {
            "bLoading": true, 
            "players": [], 
            "bFailed": false, 
            "message": "", 
            "bMergeInProgress": false,
            "displayUntil": 0
        };

        this.merge = this.merge.bind(this);
    }

    async merge(e){

        try{

            e.preventDefault();

            this.setState({
                "bMergeInProgress": true, 
                "bFailed": false, 
                "message": "Merge in progress, please wait...",
                "displayUntil": Math.floor(Date.now() * 0.001) + 15
            });

            let player1 = parseInt(e.target[0].value);
            let player2 = parseInt(e.target[1].value);

            if(player1 === -1 || player2 === -1){

                this.setState({
                    "bFailed": true, 
                    "bMergeInProgress": false, 
                    "message": "You must select two players to merge.",
                    "displayUntil": Math.floor(Date.now() * 0.001) + 5
                });
                return;
            }

            if(player1 === player2){

                this.setState({
                    "bFailed": true, 
                    "bMergeInProgress": false, 
                    "message": "You can't merge a player into itself.",
                    "displayUntil": Math.floor(Date.now() * 0.001) + 5
                });
                return;
            }


            const req = await fetch("/api/adminplayers", {
                "headers": {"Content-type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({
                    "mode": "merge", 
                    "player1": player1, 
                    "player2": player2
                })
            });

            const res = await req.json();

            if(res.error === undefined){

                this.setState({
                    "bFailed": false, 
                    "bMergeInProgress": false, 
                    "message": res.message,
                    "displayUntil": Math.floor(Date.now() * 0.001) + 5
                });

                await this.loadPlayers();
                return;

            }else{

                this.setState({
                    "bFailed": true, 
                    "bMergeInProgress": false, 
                    "message": res.error,
                    "displayUntil": Math.floor(Date.now() * 0.001) + 5
                });
                return;
            }

        }catch(err){
            console.trace(err);
        }
    }

    async loadPlayers(){

        try{

            this.setState({"bLoading": true, "players": [], "bFailed": false});

            const req = await fetch("/api/adminplayers", {
                "headers": {"Content-type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({"mode": "allnames"})
            });

            const res = await req.json();

            if(res.error === undefined){

                this.setState({"bLoading": false, "players": res.names, "bFailed": false});

            }else{
                this.setState({"bLoading": false, "bFailed": true, "message": "There was a problem loading player list."});
            }

        }catch(err){
            console.trace(err);
        }
    }


    componentDidMount(){

        this.loadPlayers();
    }

    renderDropDown(){

        const options = [];

        for(let i = 0; i < this.state.players.length; i++){

            const p = this.state.players[i];

            options.push(<option key={i} value={p.id}>{p.name}</option>);
        }

        return <select className="default-select">
            <option value="-1">Select a player</option>
            {options}
        </select>
    }


    renderForm(){

        return <div className="form">
            <div className="form-info m-bottom-25">Merge Players.<br/>Merge two players into one, taking player 2&apos;s name.</div>
            <form action="/" method="POST" onSubmit={this.merge}>
                <div className="select-row">
                    <div className="select-label">Player 1</div>
                    <div>
                        {this.renderDropDown()}
                    </div>
                </div>
                <div className="select-row">
                    <div className="select-label">Player 2</div>
                    <div>
                    {this.renderDropDown()}
                    </div>
                </div>
                <input type="submit" className="search-button" value="Merge"/>
            </form>
        </div>
    }


    render(){

        let elems = null;
        let notification = null;

        if(this.state.bLoading){

            elems = <Loading />;

        }
        
        if(this.state.bFailed){

            notification = <Notification type="error" >{this.state.message}</Notification>

        }else if(this.state.bMergeInProgress){

            notification = <Notification type="warning" >{this.state.message}</Notification>

        }else{

            notification = <Notification type="pass">{this.state.message}</Notification>

        }

        if(elems === null){

            elems = this.renderForm();
        }

        return <div>
            <div className="default-header">Merge Players</div>
            {elems}
            {notification}
        </div>
    }
}

export default AdminPlayerMerge;*/