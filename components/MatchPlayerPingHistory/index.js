import {React, useEffect, useReducer} from 'react';
import Graph from '../Graph';
import Loading from '../Loading';
import ErrorMessage from '../ErrorMessage';
import InteractiveTable from '../InteractiveTable';
import Functions from '../../api/functions';
import Link from 'next/link';
import CountryFlag from '../CountryFlag';

const MatchPlayerPingHistory = ({matchId, players, playerIds, playerData}) =>{

    const reducer = (state, action) =>{

        switch(action.type){
            case "error": {
                return {
                    "bLoading": false,
                    "error": action.errorMessage,
                    "graphData": []
                }
            }
            case "loaded": {
                return {
                    "bLoading": false,
                    "error": null,
                    "graphData": action.data
                }
            }
            default: return {...state}
        }
    }

    const [state, dispatch] = useReducer(reducer, {
        "bLoading": true,
        "error": null,
        "graphData": []
    });

    useEffect(() =>{

        const controller = new AbortController();


        const loadData = async () =>{

            const req = await fetch("/api/match", {
                "signal": controller.signal,
                "headers": {"Content-type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({"mode": "pings", "matchId": matchId, "players": playerIds})
            });

            const res = await req.json();

            if(res.error === undefined){

                dispatch({"type": "loaded", "data": res.data});
            }else{
                dispatch({"type": "error", "errorMessage": res.error});
            }
        }

        loadData();

        return () =>{
            controller.abort();
        }
    }, [matchId]);


    const renderTable = () =>{

        if(state.bLoading) return null;

        const headers = {
            "player": "Player",
            "min": "Min",
            "average": "Average",
            "max": "Max"
        };

        const data = [];

        for(let i = 0; i < playerData.length; i++){

            const {playerId, min, average, max} = playerData[i];
            const player = Functions.getPlayer(players, playerId, true);
     
            data.push({
                "player": {
                    "value": player.name.toLowerCase(), 
                    "displayValue": <Link href={`/pmatch/${matchId}/?player=${playerId}`}>
                        <a>
                            <CountryFlag country={player.country}/>{player.name}
                        </a>
                    </Link>,
                    "className": `player ${Functions.getTeamColor(player.team)}`
                },
                "min":  {"value": min},
                "average":  {"value": average},
                "max":  {"value": max}
            });
        }

        return <InteractiveTable width={2} headers={headers} data={data}/>;
    }

    if(state.bLoading) return <Loading />;
    if(state.error !== null) return <ErrorMessage title="Player Ping History" text={state.error}/>

    return <div>
        <div className="default-header">Player Ping History</div>
        {renderTable()}
        <Graph title="Player Ping History" data={state.graphData}/>
    </div>

}

export default MatchPlayerPingHistory;
