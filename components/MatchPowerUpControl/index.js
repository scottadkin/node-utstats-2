import {React, useReducer, useEffect} from 'react';
import Functions from '../../api/functions';
import BarChart from '../BarChart';
import Loading from '../Loading';
import ErrorMessage from '../ErrorMessage';

const MatchPowerUpControl = ({matchId, players, totalTeams}) =>{


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

    /*const renderTeamTotalsTables = () =>{

        if(state.displayMode !== 1 || !state.bTeamsView) return null;

        const headers = {
            "item": "Item"
        };

        for(let i = 0; i < totalTeams; i++){
            headers[`team_${i}`] = Functions.getTeamName(i);
        }

        const data = [];

        for(let i = 0; i < state.itemNames.length; i++){

            const item = state.itemNames[i];

            if(item.type !== state.mode) continue;
            

            const current = {
                "item": {
                        "value": item.name.toLowerCase(), 
                        "displayValue": item.name,
                        "className": "text-left"
                    }
                }

            for(let x = 0; x < totalTeams; x++){

                const totalUses = getTeamTotalUses(item.id, x);
                current[`team_${x}`] = {"value": totalUses, "displayValue": Functions.ignore0(totalUses)};
            }

            data.push(current);
        }

        return <div>
            <InteractiveTable width={2} headers={headers} data={data}/>
        </div>
    }*/

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


    if(state.error !== null) return <ErrorMessage title="Powerup Control" text={state.error}/>
    if(state.bLoading) return <Loading />;

    return <div>
        <div className="default-header">Powerup Control</div>


        <div className="tabs">
            <div className={`tab ${(!state.bTeamsView) ? "tab-selected" : ""}`}
                onClick={() => dispatch({"type": "teamsViewChange", "mode": false})}>
                    Players
            </div>
            <div className={`tab ${(state.bTeamsView) ? "tab-selected" : ""}`}
                onClick={() => dispatch({"type": "teamsViewChange", "mode": true})}>
                    Teams
            </div>
        </div>

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


export default MatchPowerUpControl;
