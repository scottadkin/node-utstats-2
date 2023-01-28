import {React, useReducer, useEffect} from 'react';
import Graph from '../Graph';
import Functions from '../../api/functions';
import CountryFlag from '../CountryFlag';
import Link from 'next/link';
import Loading from '../Loading';

const MatchDominationSummaryNew = ({matchId, mapId, totalTeams, playerData}) =>{

    const reducer = (state, action) =>{

        switch(action.type){

            case "load": return {
                "playerCaps": action.payload.playerCaps,
                "playerTotals": action.payload.playerTotals,
                "pointNames": action.payload.pointNames,
                "pointGraph": action.payload.pointGraph,
                "bLoading": false
            }
        }
    }

    const [state, dispatch] = useReducer(reducer, {
        "playerCaps": {},
        "playerTotals": [],
        "pointNames": [],
        "pointGraph": [],
        "bLoading": true
    });

    useEffect(() =>{

        const controller = new AbortController();

        const loadData = async () =>{

            const req = await fetch("/api/match",{
                "signal": controller.signal,
                "headers": {"Content-type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({"mode": "playerdomcaps", "matchId": matchId, "mapId": mapId})
            });

            const res = await req.json();

            dispatch({
                "type": "load",
                "payload": {
                    "playerTotals": res.playerTotals,
                    "playerCaps": res.playerCaps,
                    "pointNames": res.pointNames,
                    "pointsGraph": res.pointGraph
                }
            });

            console.log(res);
        }

        loadData();

    }, [matchId, mapId]);


    const renderGraph = () =>{
        
        if(state.bLoading) return null;

        const data = [];
        const titles = [];

        console.log(state.pointNames);

        for(const values of Object.values(state.pointNames)){

            titles.push(values.name);
        }

        for(const [point, pointInfo] of Object.entries(state.pointNames)){

            const current = [];

            for(const [player, capData] of Object.entries(state.playerCaps)){

                const currentPlayer = Functions.getPlayer(playerData, player, true);

                current.push({"name": currentPlayer.name, "data": [...capData[pointInfo.id]]});
            }

            data.push(current);
        }
        
        return <Graph title={titles} data={data}/>
    }

    return <div>
        <div className="default-header">Domination Summary</div>
        <Loading value={!state.bLoading}/>
        {renderGraph()}
    </div>
}

export default MatchDominationSummaryNew;
