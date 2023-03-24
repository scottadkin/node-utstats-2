
import {useEffect, useReducer} from 'react';
import Functions from '../../api/functions';
import Loading from '../Loading';
import ErrorMessage from '../ErrorMessage';
import InteractiveTable from '../InteractiveTable';
import Tabs from "../Tabs";
import PlayerWeapon from "../PlayerWeapon";
import PieChart from '../PieChart';

const reducer = (state, action) =>{

    switch(action.type){

        case "loaded": {
            return {
                ...state,
                "bLoading": false,
                "error": null,
                "totals": action.totals,
                "best": action.best,
                "names": action.names,
                "images": action.images
            }
        }
        case "error": {
            return {
                ...state,
                "bLoading": false,
                "error": action.errorMessage
            }
        }
        case "changeSelected": {
            return {
                ...state,
                "selectedTab": action.value
            }    
        }
        case "changeDisplay": {
            return {
                ...state,
                "displayMode": action.value
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

const getMaxValues = (state, type) =>{

    const max = {};

    if(state[type].length === 0) return {};

    const keys = Object.keys(state[type][0]);

    for(let i = 0; i < state[type].length; i++){

        const s = state[type][i];

        for(let x = 0; x < keys.length; x++){

            const k = keys[x];

            if(max[k] === undefined){

                max[k] = s[k];
                continue;
            }

            if(max[k] < s[k]) max[k] = s[k];
        }
    }

    return max;
}

const renderTotals = (state) =>{

    const headers = {
        "name": "Weapon",
        "matches": "Matches",
        "teamKills": "Team Kills",
        "suicides": "Suicides",
        "deaths": "Deaths",
        "kills": "Kills",
        "efficiency": "Efficiency",
        "shots": "Shots",
        "hits": "Hits",
        "accuracy": "Accuracy",
        "damage": "Damage"
    };


    const maxValues = getMaxValues(state, "totals");

    const data = state.totals.map((stats) =>{

        const weaponName = getWeaponName(state, stats.weapon);

        if(state.displayMode === 0){
            return <PlayerWeapon key={stats.weapon} name={weaponName} image={state.images[stats.weapon]} stats={stats} maxValues={maxValues}/>;
        }

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

    if(state.displayMode === 1){
        return <InteractiveTable key="totals" width={1} headers={headers} data={data}/>
    }

    return <div key="totals" className="t-width-1 center">{data}</div>
    
}

const renderBest = (state) =>{

    
    const headers = {
        "name": "Weapon",
        "teamKills": "Team Kills",
        "suicides": "Suicides",
        "deaths": "Deaths",
        "kills": "Kills",
        "shots": "Shots",
        "hits": "Hits",
        "damage": "Damage",
        "bestSpree": "Best Spree",
        "bestTeamKills": "Most Team Kills"
    };

    const maxValues = getMaxValues(state, "best");

    const data = state.best.map((stats) =>{

        const weaponName = getWeaponName(state, stats.weapon_id);

        if(state.displayMode === 0){
            return <PlayerWeapon key={stats.weapon_id} name={weaponName} image={state.images[stats.weapon_id]} stats={stats} maxValues={maxValues}/>;
        }

        return {
            "name": {
                "value": weaponName.toLowerCase(), 
                "displayValue": weaponName,
                "className": "text-left"
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

            "shots": {
                "value": stats.shots,
                "displayValue": Functions.ignore0(stats.shots)
            },
            "hits": {
                "value": stats.hits,
                "displayValue": Functions.ignore0(stats.hits)
            },
            "damage": {
                "value": stats.damage,
                "displayValue": Functions.ignore0(stats.damage)
            },
            "bestSpree": {
                "value": stats.kills_best_life,
                "displayValue": Functions.ignore0(stats.kills_best_life),
            },
            "bestTeamKills": {
                "value": stats.team_kills_best_life,
                "displayValue": Functions.ignore0(stats.team_kills_best_life),
            }
        }
    });

    if(state.displayMode === 1){
        return <InteractiveTable key="best" width={1} headers={headers} data={data}/>
    }

    return <div key="best" className="t-width-1 center">
        {data}
    </div>

}

const renderTabs = (state, dispatch) =>{

    const selected = state.selectedTab;

    const options = [
        {"name": "Total Stats", "value": 0},
        {"name": "Best Stats", "value": 1},
    ];

    const displayOptions = [
        {"name": "Default View", "value": 0},
        {"name": "Table View", "value": 1},
    ];

    return <>
        <Tabs options={displayOptions} selectedValue={state.displayMode} changeSelected={(value) =>{
            dispatch({"type": "changeDisplay", "value": value})
        }}/>
        <Tabs options={options} selectedValue={selected} changeSelected={(value) =>{
            dispatch({"type": "changeSelected", "value": value})
        }}/>  
    </>
}


const PlayerWeapons = ({playerId, pageSettings}) =>{

    const [state, dispatch] = useReducer(reducer, {
        "bLoading": true,
        "error": null,
        "totals": [],
        "best": [],
        "names": {},
        "images": {},
        "selectedTab": 0,
        "displayMode": parseInt(pageSettings["Default Weapon Display"])
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
                "names": res.names,
                "images": res.images
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
    if(state.totals.length > 0 && state.selectedTab === 0) elems.push(renderTotals(state));
    if(state.best.length > 1 && state.selectedTab === 1) elems.push(renderBest(state));

    return <div>
        <div className="default-header">Weapon Stats</div>
        <PieChart data={[
            [
                {"value": 32, "name": "poops"},
                {"value": 50, "name": "Tuna"},
                {"value": 18, "name": "Oinks"},
            ],
            [
                {"value": 2312, "name": "aaaa"},
                {"value": 44, "name": "bbbb"},
                {"value": 1338, "name": "cccc"},
                {"value": 355, "name": "Poooo"},
            ],

            [
                {"value": 11, "name": "What does this one do"},
                {"value": 22, "name": "Why is this title really really reall long?"},
                {"value": 33, "name": "Oops"},
                {"value": 44, "name": "Damn :("},
            ],
            [
                {"value": 11, "name": "What does this one do"},
                {"value": 22, "name": "Why is this title really really reall long?"},
                {"value": 33, "name": "Oops"},
                {"value": 44, "name": "Damn :("},
                {"value": 11, "name": "What does this one do"},
                {"value": 22, "name": "Why is this title really really reall long?"},
                {"value": 33, "name": "Oops"},
                {"value": 44, "name": "Damn :("},
                {"value": 11, "name": "What does this one do"},
                {"value": 22, "name": "Why is this title really really reall long?"},
                {"value": 33, "name": "Oops"},
                {"value": 44, "name": "Damn :("},
            ],
            [
                {"value": 32, "name": "poops"},
                {"value": 50, "name": "Tuna"},
                {"value": 18, "name": "Oinks"},
            ],
            [
                {"value": 32, "name": "poops2"},
                {"value": 50, "name": "Tuna2"},
                {"value": 18, "name": "Oinks2"},
            ],
            [
                {"value": 32, "name": "poops3"},
                {"value": 50, "name": "Tuna3"},
                {"value": 18, "name": "Oinks3"},
            ]
        ]} titles={["Farts", "Sharts", "Longer Title Name", "cooooossos", "asfsafas", "95393ujjgjg", "884ujmjfjfjf"]}/>
        {renderTabs(state, dispatch)}
        {elems}
    </div>
}


export default PlayerWeapons;