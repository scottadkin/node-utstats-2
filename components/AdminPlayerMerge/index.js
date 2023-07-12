import {useEffect, useReducer} from "react";
import Loading from "../Loading";
import ErrorMessage from "../ErrorMessage";
import InteractivePlayerSearchBox from "../InteractivePlayerSearchBox";


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
                "error": action.errorMessage
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

            console.log(action.targetPlayer);

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

            console.log(newPlayers);

            //if playerId is not in array add it otherwise remove
            return {
                ...state,
                "selectedPlayers": newPlayers
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

        console.log(res);

        dispatch({"type": "loadedPlayerList", "error": null, "playerList": res.players});

    }catch(err){

        if(err.name === "AbortError") return;
        dispatch({"type": "error", "errorMessage": err.toString()});
    }
}

const AdminPlayerMerge = ({}) =>{


    const [state, dispatch] = useReducer(reducer, {
        "bLoading": true,
        "error": null,
        "playerList": [],
        "selectedPlayers": []
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
            <div className="select-row">
                <div className="select-label">Target Player</div>
                <InteractivePlayerSearchBox data={state.playerList} maxDisplay={25} togglePlayer={(value) =>{
                    dispatch({"type": "togglePlayer", "targetPlayer": value});
                }} selectedPlayers={state.selectedPlayers}/>
            </div>
            <div className="select-row">
                <div className="select-label">Master Player</div>
                <div>f</div>
            </div>
            
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