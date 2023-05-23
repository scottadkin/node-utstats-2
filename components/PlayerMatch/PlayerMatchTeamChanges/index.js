import {useEffect, useReducer} from "react";
import Loading from "../../Loading";
import ErrorMessage from "../../ErrorMessage";
import InteractiveTable from "../../InteractiveTable";
import Functions from "../../../api/functions";

const reducer = (state, action) =>{

    switch(action.type){
        case "loaded": {
            return {
                "bLoading": false,
                "error": null,
                "teamChanges": action.data
            }
        }
        case "error": {
            return {
                "bLoading": false,
                "error": action.errorMessage
            }
        }
        default: return state;
    }
}

const renderData = (teamChanges, matchStart, totalTeams) =>{

    const headers = {
        "time": "Timestamp",
        "info": "Info"
    };



    const data = teamChanges.map((change) =>{

        const team = change.team;
        const timestamp = change.timestamp - matchStart;

        let joinElem = null;

        if(totalTeams > 1){

            if(team < totalTeams){
                joinElem = <>Joined the {Functions.getTeamName(team)}.</>
            }else{
                joinElem = <>Joined the server as a spectator.</>
            }
        }

        return {
            "time": {
                "value": timestamp,
                "displayValue": Functions.MMSS(timestamp)
            },
            "info": {
                "value": team,
                "displayValue": joinElem,
                "className": Functions.getTeamColor(team)
            }
        }
    });

    return <InteractiveTable width={2} headers={headers} data={data} />
}

const PlayerMatchTeamChanges = ({playerId, matchId, matchStart, totalTeams}) =>{


    const [state, dispatch] = useReducer(reducer, {
        "bLoading": true,
        "error": null,
        "teamChanges": []
    })

    useEffect(() =>{

        const controller = new AbortController();

        const loadData = async () =>{

            try{

                const req = await fetch("/api/match", {
                    "signal": controller.signal,
                    "headers": {"Content-type": "application/json"},
                    "method": "POST",
                    "body": JSON.stringify({
                        "mode": "player-teams",
                        "matchId": matchId,
                        "playerId": playerId
                    })
                });

                const res = await req.json();

                if(res.error !== undefined){
                    dispatch({"type": "error", "errorMessage": res.error})
                }else{
                    dispatch({"type": "loaded", "data": res.data});
                }

            }catch(err){

                if(err.name !== "AbortError"){
                    console.trace(err);
                }
            }
        }

        loadData();


        return () =>{
            controller.abort();
        }
    },[matchId, playerId]);


    if(state.bLoading) return <Loading />;
    if(state.error !== null) return <ErrorMessage title="Team Change History" text={state.error}/>

    return <div>
        <div className="default-header">Team Change History</div>
        {renderData(state.teamChanges, matchStart, totalTeams)}
    </div>
}

export default PlayerMatchTeamChanges;