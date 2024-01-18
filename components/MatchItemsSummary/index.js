import {React, useReducer, useEffect} from "react";
import Functions, { ignore0 } from "../../api/functions";
import BarChart from "../BarChart";
import Loading from "../Loading";
import ErrorMessage from "../ErrorMessage";
import Tabs from "../Tabs";
import InteractiveTable from "../InteractiveTable";
import {getPlayer, getTeamColor, getTeamName} from "../../api/generic.mjs";
import CountryFlag from "../CountryFlag";
import Link from "next/link";

const reducer = (state, action) =>{

    switch(action.type){
        case "setError": {
            return {
                ...state,
                "error": action.payload.error,
                "bLoading": false
            }
        }
        case "teamsViewChange": {
            return {
                ...state,
                "bTeamsView": action.mode
            }
        }
        case "modeChange": {
            return {
                ...state,
                "mode": action.mode
            };
        }
        case "changeDisplayMode": {
            return {
                ...state,
                "displayMode": action.displayMode
            }
        }
        case "changeSelectedItem": {
            return {
                ...state,
                "selectedItem": action.value
            }
        }
        case "loaded": {
            return {
                ...state,
                "bLoading": false,
                "itemNames": action.payload.itemNames,
                "playerUses": action.payload.playerUses,
                "itemTotals": action.payload.itemTotals
            };
        }
        default: return state
    }
}

const filterByType = (state, targetType) =>{

    const result = state.itemNames.filter((item) =>{
        return item.type === targetType;
    });

    return result;
}

const createTypeTabs = (state, dispatch, selectedKey, selectedType) =>{
    
    const items = filterByType(state, state.mode);

    const bSelectedExist = items.some((item) =>{
        return item.id === state[selectedKey];
    });

    if(!bSelectedExist && items.length > 0){
        dispatch({"type": "changeSelectedItem", "value": items[0].id});
    }

    if(items.length === 0){
        return <div className="not-found">
            No data found
        </div>
    }

    return <>
        <Tabs 
            options={items.map((item) =>{
                return {"value": item.id, "name": item.name}
            })} 
            selectedValue={state[selectedKey]}
            changeSelected={(value) =>{dispatch({"type": selectedType,"value": value})}}
        />
    </>
}

const renderTeamTabs = (totalTeams, dispatch, state) =>{

    if(totalTeams < 2) return null;

    return <div className="tabs">
        <div className={`tab ${(!state.bTeamsView) ? "tab-selected" : ""}`}
            onClick={() => dispatch({"type": "teamsViewChange", "mode": false})}>
                Players
        </div>
        <div className={`tab ${(state.bTeamsView) ? "tab-selected" : ""}`}
            onClick={() => dispatch({"type": "teamsViewChange", "mode": true})}>
                Teams
        </div>
    </div>
}

const bAnyDataOfType = (data, targetType) =>{

    for(let i = 0; i < data.length; i++){

        const d = data[i];
        if(d.type === targetType) return true;
    }

    return false;
}

const renderTypeTabs = (state, dispatch) =>{

    const tabs = [];

    const dummyTabs = [
        {"name": "Weapons", "value": 1},
        {"name": "Ammo", "value": 2},
        {"name": "Health & Armour", "value": 3},
        {"name": "Powerups", "value": 4},
        {"name": "Unsorted", "value": 0},
    ];

    const foundTypes = [];
    let bFoundSelectedType = false;


    for(let i = 0; i < dummyTabs.length; i++){

        const {value} = dummyTabs[i];

        if(bAnyDataOfType(state.itemNames, value)){
            foundTypes.push(value);
            tabs.push(dummyTabs[i]);

            if(state.mode === value) bFoundSelectedType = true;
        }
    }

    if(!bFoundSelectedType){
   
        if(foundTypes.length === 0) return null;

        dispatch({"type": "modeChange", "mode": foundTypes[0]});
        return;
    }

    return <Tabs options={tabs} selectedValue={state.mode} changeSelected={
        (a) =>{
            dispatch({"type": "modeChange", "mode": a})
        }
    }/>
}

const renderPlayerTables = (state, dispatch, players, matchId) =>{
    
    if(state.bLoading || state.displayMode !== 0 || state.bTeamsView) return null;

    const tables = [];

    const headers = {
        "name": "Player",
        "uses": "Times Used"
    };

    for(let i = 0; i < state.itemNames.length; i++){

        const item = state.itemNames[i];

        if(item.type !== state.mode) continue;

        const itemId = item.id;
        const data = [];

        for(const [playerId, playerData] of Object.entries(state.playerUses)){

            if(playerData[itemId] !== undefined){

                const player = getPlayer(players, playerId, true);

                data.push({
                    "name": {
                        "value": 0, 
                        "displayValue": <Link href={`/pmatch/${matchId}?player=${player.id}`}><CountryFlag country={player.country}/>{player.name}</Link>,
                        "className": `text-left ${getTeamColor(player.team)}`
                    },
                    "uses": {
                        "value": playerData[itemId]
                    }
                });
            }
        }

        tables.push(<InteractiveTable key={item.id} title={item.name} width={2} headers={headers} data={data} defaultOrder="uses" bAsc={false}/>);
    }

    return <>
        {createTypeTabs(state, dispatch, "selectedItem", "changeSelectedItem")}
        {tables}
    </>;
}

const renderTeamBarCharts = (state, players, totalTeams) =>{


    if(state.displayMode !== 1 || !state.bTeamsView) return null;
    
    const barCharts = [];

    const names = [];

    for(let i = 0; i < totalTeams; i++){

        names.push(Functions.getTeamName(i));
    }

    for(let i = 0; i < state.itemNames.length; i++){

        const item = state.itemNames[i];
        

        if(item.type !== state.mode) continue;
        
        const values = [];

        for(let x = 0; x < totalTeams; x++){
            values.push(getTeamTotalUses(state, players, item.id, x));
        }
      
        barCharts.push(<BarChart key={item.id} label="Taken" title={item.name} values={values} names={names}/>);
    }

    return <div>
        {barCharts}
    </div>
}


const getPlayerUses = (state, itemId) =>{

    const uses = [];

    for(const playerUses of Object.values(state.playerUses)){

        if(playerUses[itemId] !== undefined){
            uses.push(playerUses[itemId]);
        }else{
            uses.push(0);
        }
    }

    return uses;
}

const renderPlayerBarCharts = (state, players) =>{

    if(state.bTeamsView || state.displayMode !== 1) return null;

    const barCharts = [];

    const names = [];

    for(const player of Object.values(players)){

        if(player.spectator) continue;
        
        names.push(player.name);
        
    }

    for(let i = 0; i < state.itemNames.length; i++){

        const item = state.itemNames[i];

        if(item.type !== state.mode) continue;

        const uses = getPlayerUses(state, item.id);

        barCharts.push(<BarChart key={item.id} label="Taken" title={item.name} names={names} values={uses} />);

    }

    return <div>
        {barCharts}
    </div>
}

const getTeamTotalUses = (state, players, itemId, targetTeam) =>{

    let totalUses = 0;

    for(const [playerId, playerUses] of Object.entries(state.playerUses)){

        const player = getPlayer(players, playerId, true);

        if(player.team === targetTeam){

            if(playerUses[itemId] !== undefined){
                totalUses += playerUses[itemId];
            }
        }
    }

    return totalUses;
}

const renderTeamTables = (state, dispatch, players, matchId, totalTeams) =>{

    if(state.bLoading || state.displayMode !== 0 || !state.bTeamsView) return null;

    console.log(state);

    //const items = filterByType(state, );

    const headers = {
        "team": "Team",
        "used": "Times Used"
    };

    const rows = [];

    for(let i = 0; i < totalTeams; i++){

        const teamTotal = getTeamTotalUses(state, players, state.selectedItem, i);
        //console.log(teamTotal);
        //data.push(teamTotal);
        rows.push({
            "team": {
                "value": i, 
                "displayValue": getTeamName(i),
                "className": `text-left ${getTeamColor(i)}`
            },
            "used": {
                "value": teamTotal,
                "displayValue": ignore0(teamTotal)
            }
        });
    }


    return <>
        {createTypeTabs(state, dispatch, "selectedItem", "changeSelectedItem")}
        <InteractiveTable headers={headers} data={rows} width={2}/>
    </>
}

const MatchItemsSummary = ({matchId, players, totalTeams}) =>{


    const [state, dispatch] = useReducer(reducer, {
        "bLoading": true,
        "mode": 1,
        "error": null,
        "displayMode": 0,
        "bTeamsView": true,
        "selectedItem": -1,
        "itemNames": [],
        "playerUses": [],
        "itemTotals": []
        
    });


    useEffect(() =>{

        const controller = new AbortController();

        const loadData = async () =>{

            try{
                const req = await fetch("/api/pickups", {
                    "headers": {"content-type": "application/json"},
                    "method": "POST",
                    "body": JSON.stringify({"mode": "matchUsage", "matchId": matchId})
                });

                const res = await req.json();

                if(res.error !== undefined){
                    dispatch({"type": "setError", "payload": {"error": res.error}});
                }else{
                    dispatch({"type": "loaded", "payload": res});
                }

            }catch(err){
                console.log(err);
            }
        }

        loadData();

        return () =>{

            controller.abort();
        }
    }, [matchId]);

    if(state.error !== null) return <ErrorMessage title="Items Summary" text={state.error}/>
    if(state.bLoading) return <Loading />;

    if(state.itemNames.length === 0) return null;

    return <div>
        <div className="default-header">Items Summary</div>


        {renderTeamTabs(totalTeams, dispatch, state)}

        {renderTypeTabs(state, dispatch)}
        <Tabs 
            options={[
                {"name": "Tables", "value": 0},
                {"name": "Bar Charts", "value": 1},
            ]}
            selectedValue={state.displayMode}
            changeSelected={(a) =>{
                dispatch({"type": "changeDisplayMode", "displayMode": a});
            }}
        />
        {renderTeamBarCharts(state, players, totalTeams)}
        {renderPlayerBarCharts(state, players)}
        {renderPlayerTables(state, dispatch, players, matchId)}
        {renderTeamTables(state, dispatch, players, matchId, totalTeams)}
    </div>
}


export default MatchItemsSummary;
