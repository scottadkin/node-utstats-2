import {React, useReducer, useEffect} from 'react';
import Functions from '../../api/functions';
import BarChart from '../BarChart';
import Loading from '../Loading';
import ErrorMessage from '../ErrorMessage';

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

const MatchItemsSummary = ({matchId, players, totalTeams}) =>{

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
            case "displayModeChange": {
                return {
                    ...state,
                    "displayMode": action.mode
                }
            }
            case "modeChange": {
                return {
                    ...state,
                    "mode": action.mode
                };
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

    const [state, dispatch] = useReducer(reducer, {
        "bLoading": true,
        "mode": 1,
        "error": null,
        "displayMode": 0,
        "bTeamsView": false
        
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


    const getTeamTotalUses = (itemId, targetTeam) =>{

        let totalUses = 0;

        for(const [playerId, playerUses] of Object.entries(state.playerUses)){

            const player = Functions.getPlayer(players, playerId, true);

            if(player.team === targetTeam){

                if(playerUses[itemId] !== undefined){
                    totalUses += playerUses[itemId];
                }
            }
        }

        return totalUses;
    }

    const renderTeamBarCharts = () =>{

        if(state.displayMode !== 0 || !state.bTeamsView) return null;
        
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
                values.push(getTeamTotalUses(item.id, x));
            }
          
            barCharts.push(<BarChart key={item.id} label="Taken" title={item.name} values={values} names={names}/>);
        }

        return <div>
            {barCharts}
        </div>
    }


    const getPlayerUses = (itemId) =>{

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

    const renderPlayerBarCharts = () =>{

        if(state.bTeamsView || state.displayMode !== 0) return null;

        const barCharts = [];

        const names = [];

        for(const player of Object.values(players)){

            if(player.spectator) continue;
            
            names.push(player.name);
            
        }

        for(let i = 0; i < state.itemNames.length; i++){

            const item = state.itemNames[i];

            if(item.type !== state.mode) continue;

            const uses = getPlayerUses(item.id);

            barCharts.push(<BarChart key={item.id} label="Taken" title={item.name} names={names} values={uses} />);

        }

        return <div>
            {barCharts}
        </div>
    }

    


    if(state.error !== null) return <ErrorMessage title="Items Summary" text={state.error}/>
    if(state.bLoading) return <Loading />;

    if(state.itemNames.length === 0) return null;

    return <div>
        <div className="default-header">Items Summary</div>


        {renderTeamTabs(totalTeams, dispatch, state)}

        <div className="tabs">
            <div className={`tab ${(state.mode === 1) ? "tab-selected" : ""}`} 
                onClick={() => dispatch({"type": "modeChange", "mode": 1})}>
                    Weapons
            </div>
            <div className={`tab ${(state.mode === 2) ? "tab-selected" : ""}`} 
                onClick={() => dispatch({"type": "modeChange", "mode": 2})}>
                    Ammo
            </div>
        
            <div className={`tab ${(state.mode === 3) ? "tab-selected" : ""}`} 
                onClick={() => dispatch({"type": "modeChange", "mode": 3})}>
                    Armour
            </div>
            <div className={`tab ${(state.mode === 4) ? "tab-selected" : ""}`} 
                onClick={() => dispatch({"type": "modeChange", "mode": 4})}>
                    Powerups
            </div>
            <div className={`tab ${(state.mode === 0) ? "tab-selected" : ""}`} 
                onClick={() => dispatch({"type": "modeChange", "mode": 0})}>
                    Unsorted
            </div>
        </div>
        {renderTeamBarCharts()}
        {renderPlayerBarCharts()}
    </div>
}


export default MatchItemsSummary;
