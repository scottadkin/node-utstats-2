import styles from './MatchAssaultSummary.module.css';
import CountryFlag from '../CountryFlag/';
import Functions from '../../api/functions';
import Table2 from '../Table2';
import Loading from '../Loading';
import {React, useEffect, useReducer} from "react";


const MatchAssaultSummary = ({matchId, mapId, players, matchStart, redScore, blueScore, attackingTeam}) =>{

    const reducer = (state, action) =>{

        switch(action.type){
            case "loaded": {return {
                "bLoading": false,
                "assaultObjectives": action.payload.objectives

            }}
            default: return state
        }
    }

    const [state, dispatch] = useReducer(reducer, {
        "bLoading": true,
        "assaultObjectives": []
    });


    useEffect(() =>{

        const controller = new AbortController();

        const loadData = async () =>{

            const req = await fetch("/api/match", {
                "signal": controller.signal,
                "headers": {"Content-type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({"mode": "assault", "matchId": matchId, "mapId": mapId})
            });

            const res = await req.json();

            dispatch({
                "type": "loaded",
                "payload": {"assaultObjectives": []}
            });
        }

        loadData();

        return () =>{
            controller.abort();
        }
        
    }, [matchId, mapId]);

    if(state.bLoading){
        return <Loading />
    }

    return <div>
        <div className="default-header">Assault Summary</div>
    </div>
}

export default MatchAssaultSummary;

/*const MatchAssaultSummary = ({host, players, data, matchStart, attackingTeam, redScore, blueScore, playerNames}) =>{


    if(data.caps === undefined) return null;

    const elems = [];

    let d = 0;

    let currentPlayer = 0;

    const cappedIds = [];


    for(let i = 0; i < data.caps.length; i++){

        d = data.caps[i];

        
        currentPlayer = Functions.getPlayer(playerNames, d.player);

        cappedIds.push(d.obj_id);

        elems.push(<tr key={`attacked-obj-${i}`}>
            <td className="text-left">{getName(data.objectives, d.obj_id)}</td>
            <td>{(d.bfinal) ? 'True' : ''}</td>
            <td><MMSS timestamp={d.timestamp - matchStart} /></td>
            <td className={Functions.getTeamColor(currentPlayer.team)}><CountryFlag host={host} country={currentPlayer.country}/>{currentPlayer.name}</td>

        </tr>);
    }

    for(let i = 0; i < data.objectives.length; i++){

        d = data.objectives[i];

        if(cappedIds.indexOf(d.obj_id) === -1){
            elems.push(
                <tr key={`defended-obj-${i}`} className={Functions.getTeamColor((attackingTeam === 0) ? 1 : 0)}>
                    <td className="text-left">{d.name}</td>
                    <td></td>
                    <td></td>
                    <td>Defended Successfully</td>
                </tr>
            );
        }
    }

    let resultTitle = '';
    let resultColor = 'team-none';

    if(attackingTeam === 0){
        //resultTitle = 'Red Attacking';
        if(redScore > blueScore){
            resultTitle = "Red Captured the base.";
            resultColor = "team-red";
        }else{
            resultTitle = "Blue Defended the base.";
            resultColor = "team-blue";
        }

    }else{

        if(blueScore > redScore){
            resultTitle = "Blue Captured the base.";
            resultColor = "team-blue";
        }else{
            resultTitle = "Red Defended the base.";
            resultColor = "team-red";
        }
    }

    return (
        <div className="special-table m-bottom-25">
            <div className="default-header">
                Assault Summary
            </div>

            <div className={`${styles.attacking} t-width-1 center`}>
                <div className="team-red">{(attackingTeam === 0) ? 'Attacking' : 'Defending'}</div>
                <div className="team-blue">{(attackingTeam === 1) ? 'Attacking' : 'Defending'}</div>
            </div>
            <div className={`${resultColor} ${styles.result} t-width-1 center`}>
                {resultTitle}
            </div>
            {(elems.length === 0) ? null :
            <Table2 width={1}>
                <tr>
                    <th>Objective</th>
                    <th>Final Objective</th>
                    <th>Captured Time</th>
                    <th>Captured By</th>
                    
                </tr>
                {elems}
            </Table2>}
        </div>
    );
}


export default MatchAssaultSummary;*/