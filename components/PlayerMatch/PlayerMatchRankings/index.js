import {useEffect, useReducer} from "react";
import Loading from "../../Loading";
import ErrorMessage from "../../ErrorMessage";
import InteractiveTable from "../../InteractiveTable";
import Functions from "../../../api/functions";
import RankingIcon from "../../RankingIcon";

const reducer = (state, action) =>{

    switch(action.type){
        case "loaded": {
            return {
                "bLoading": false,
                "error": null,
                "position": action.position,
                "matchChange": action.matchChange,
                "currentRanking": action.currentRanking
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

const renderData = (position, matchChange, currentRanking) =>{

    const headers = {
        "pos": "Current Position",
        "current": "Current Ranking",
        "previous": "Ranking Before Match",
        "after": "Ranking After Match",
        "match": "Match Ranking Score"
    };

    const previous = matchChange.ranking - matchChange.ranking_change;

    const data = {
        "pos": {"value": position, "displayValue": `${position}${Functions.getOrdinal(position)}`},
        "current": {
            "value": currentRanking.ranking, 
            "displayValue": <>
                {currentRanking.ranking.toFixed(2)}
                <RankingIcon change={currentRanking.ranking_change}/>
            </>
        },
        "previous": {
            "value": previous, 
            "displayValue": previous.toFixed(2)
        },
        "after": {
            "value": matchChange.ranking,
            "displayValue": <>
                {matchChange.ranking.toFixed(2)}
                <RankingIcon change={matchChange.ranking_change}/>
            </>
        },
        "match": {"value": matchChange.match_ranking, "displayValue": matchChange.match_ranking.toFixed(2)}
    };

    return <InteractiveTable width={1} headers={headers} data={[data]}/>
}

const PlayerMatchRanking = ({matchId, playerId, gametypeId}) =>{

    const [state, dispatch] = useReducer(reducer, {
        "bLoading": true,
        "error": null,
        "position": -1,
        "matchChange": null,
        "currentRanking": null
    });


    useEffect(() =>{

        const controller = new AbortController();
        
        const loadData = async () =>{

            const req = await fetch("/api/match",{
                "signal": controller.signal,
                "headers": {"Content-type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({
                    "mode": "player-ranking", 
                    "playerId": playerId, 
                    "matchId": matchId, 
                    "gametypeId": gametypeId
                })
            });

            const res = await req.json();

            if(res.error !== undefined){
                dispatch({"type": "error", "errorMessage": res.error});
            }else{

                dispatch({
                    "type": "loaded", 
                    "position": res.position, 
                    "currentRanking": res.currentRanking, 
                    "matchChange": res.matchChange
                });
            }
        }

        loadData();

        return () =>{
            controller.abort();
        }
    }, [matchId, playerId, gametypeId]);


    if(state.bLoading) return <Loading />
    if(state.error !== null) return <ErrorMessage title="Rankings Summary" text={state.error}/>;

    return <div>
        <div className="default-header">Rankings Summary</div>
        {renderData(state.position, state.matchChange, state.currentRanking)}
    </div>
}

export default PlayerMatchRanking;