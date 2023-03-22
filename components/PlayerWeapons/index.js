
import styles from './PlayerWeapons.module.css';
import PlayerWeapon from '../PlayerWeapon/';
import {useEffect, useReducer} from 'react';
import Functions from '../../api/functions';
import Loading from '../Loading';
import ErrorMessage from '../ErrorMessage';
import InteractiveTable from '../InteractiveTable';

const reducer = (state, action) =>{

    switch(action.type){

        case "loaded": {
            return {
                ...state,
                "bLoading": false,
                "error": null,
                "totals": action.totals,
                "best": action.best,
                "names": action.names
            }
        }
        case "error": {
            return {
                ...state,
                "bLoading": false,
                "error": action.errorMessage
            }
        }
    }

    return state;
}

const getWeaponName = (state, weaponId) =>{

    if(state.names[weaponId] !== undefined){

        return state.names[weaponId];
    }

    return {"name": "Not Found"};
}

const renderTotals = (state, dispatch) =>{

    const headers = {
        "name": "Weapon",
        "matches": "Matches",
        "teamKills": "Team Kills",
        "suicides": "Suicides",
        "deaths": "Deaths",
        "kills": "KIlls",
        "efficiency": "Efficiency",
        "shots": "Shots",
        "hits": "Hits",
        "accuracy": "Accuracy",
        "damage": "Damage"
    };


    const data = state.totals.map((stats) =>{

        const weaponName = getWeaponName(state, stats.weapon);

        return {
            "name": {
                "value": weaponName.toLowerCase(), 
                "displayValue": weaponName,
                "className": "text-left"
            },
            "matches": {
                "value": stats.matches
            },
            "kills": {
                "value": stats.kills,
                "displayValue": Functions.ignore0(stats.kills)
            },
            "deaths": {
                "value": stats.deaths,
                "displayValue": Functions.ignore0(stats.deaths)
            },
            "suicides": {
                "value": stats.suicides,
                "displayValue": Functions.ignore0(stats.suicides)
            },
            "teamKills": {
                "value": stats.team_kills,
                "displayValue": Functions.ignore0(stats.team_kills)
            },
            "efficiency": {
                "value": stats.efficiency,
                "displayValue": `${stats.efficiency.toFixed(2)}%`
            },
            "shots": {
                "value": stats.shots,
                "displayValue": Functions.ignore0(stats.shots)
            },
            "hits": {
                "value": stats.hits,
                "displayValue": Functions.ignore0(stats.hits)
            },
            "accuracy": {
                "value": stats.accuracy,
                "displayValue": `${stats.accuracy.toFixed(2)}%`
            },
            "damage": {
                "value": stats.damage,
                "displayValue": Functions.ignore0(stats.damage)
            },
        }
    });

    return <InteractiveTable key="totals" width={1} headers={headers} data={data}/>
}

const PlayerWeapons = ({playerId}) =>{

    const [state, dispatch] = useReducer(reducer, {
        "bLoading": true,
        "error": null,
        "totals": [],
        "best": [],
        "names": {}
    });

    useEffect(() =>{

        const controller = new AbortController();

        const loadData = async () =>{

            const req = await fetch("/api/weapons", {
                "signal": controller.abort(),
                "headers": {"Content-type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({
                    "mode": "player-profile",
                    "playerId": playerId
                })
            });

            const res = await req.json();

            if(res.error !== undefined){
                dispatch({"type": "error", "errorMessage": res.error});
                return;
            }

            dispatch({
                "type": "loaded", 
                "totals": res.totals, 
                "best": res.best,
                "names": res.names
            });
        }

        loadData();

        return () =>{
            controller.abort();
        }

    }, [playerId]);

    const elems = [];

    if(state.bLoading) elems.push(<Loading key="loading" />);
    if(state.error !== null) elems.push(<ErrorMessage key="error" type="error" text={state.error}/>);
    if(state.totals.length > 0) elems.push(renderTotals(state, dispatch));

    return <div>
        <div className="default-header">Weapon Stats</div>
        {elems}
    </div>
}


export default PlayerWeapons;