import {useEffect, useReducer, useState} from "react"; 
import Loading from "../Loading";
import ErrorMessage from "../ErrorMessage";
import InteractiveTable from "../InteractiveTable";
import Functions from "../../api/functions";
import Link from "next/link";
import CountryFlag from "../CountryFlag";

const reducer = (state, action) =>{

    switch(action.type){
        case "loaded": {
            return {
                "bLoading": false,
                "error": null,
                "powerupNames": action.powerupNames,
                "playerPowerupData": action.playerPowerupData
            }
        }
        case "error": {
            return {
                "bLoading": false,
                "error": action.errorMessage
            }
        }
    }

    return state;
}


const renderTable = (state, matchId, totalTeams, players, targetPowerup) =>{

    targetPowerup = parseInt(targetPowerup);

    const headers = {
        "player": "Player",
        "used": "Times Used",
        "carry": {"title": "Total Item Time", "content": "The total amount of time the player used an powerup."},
        "bestCarry": {"title": "Best Item Time", "content": "The most amount of time a player used an item in single use."},
        "kills": "Total Kills",
        "bestKills": {"title": "Best Kills", "detailedTitle": "Best Kills Single Use", "content": "The most amount of kills a player got in a single use."},
        "deaths": {"title": "Deaths", "detailedTitle": "Deaths Carrying Powerup", "content": "Total deaths the player had while carrying the item."},
        "suicides": {"title": "Suicides", "detailedTitle": "Suicides Carrying Powerup", "content": "Total suicides the player had while carrying the item."},
        "carrierKills": {"title": "Carrier Kills", "content": "Kills on players carrying this item."}
        
    };

    

    let powerupData = [...state.playerPowerupData];


    powerupData = powerupData.filter((stats) =>{

        if(stats.powerup_id === targetPowerup) return stats;

    });
    

    powerupData.sort((a, b) =>{

        a = a.total_kills;
        b = b.total_kills;

        if(a < b) return 1;
        if(a > b) return -1;
        return 0;
    });


    const data = powerupData.map((stats) =>{

        const player = Functions.getPlayer(players, stats.player_id, true);

        let teamColor = "team-none";

        if(totalTeams >= 2){
            teamColor = Functions.getTeamColor(player.team);
        }

        return {
            "player": {
                "value": player.name.toLowerCase(),
                "displayValue": <Link href={`/pmatch/${matchId}/${player.id}`}>
                    <a><CountryFlag country={player.country}/>{player.name}</a>
                </Link>,
                "className": `player ${teamColor}`
            },
            "carry": {
                "value": stats.carry_time,
                "displayValue": Functions.toPlaytime(stats.carry_time),
                "className": "playtime"
            },
            "bestCarry": {
                "value": stats.carry_time_best,
                "displayValue": Functions.toPlaytime(stats.carry_time_best),
                "className": "playtime"
            },
            "kills": {
                "value": stats.total_kills,
                "displayValue": Functions.ignore0(stats.total_kills)
            },
            "bestKills": {
                "value": stats.best_kills,
                "displayValue": Functions.ignore0(stats.best_kills)
            },
            "used": {
                "value": stats.times_used,
                "displayValue": Functions.ignore0(stats.times_used)
            },
            "suicides": {
                "value": stats.end_suicides,
                "displayValue": Functions.ignore0(stats.end_suicides)
            },
            "deaths": {
                "value": stats.end_deaths,
                "displayValue": Functions.ignore0(stats.end_deaths)
            },
            "carrierKills": {
                "value": stats.carrier_kills,
                "displayValue": Functions.ignore0(stats.carrier_kills)
            }
        };
    });

    return <InteractiveTable width={1} headers={headers} data={data}/>
}

const renderTabs = (powerupNames, selectedPowerup, setSelectedPowerup) =>{


    const tabs = [];

    for(const [key, value] of Object.entries(powerupNames)){

        tabs.push(<div className={`tab ${(selectedPowerup === key) ? "tab-selected" : ""}`} key={key} onClick={() => setSelectedPowerup(key)}>
            {value}
        </div>);
    }

    return <div className="tabs">
        {tabs}
    </div>
}

const renderData = (state, matchId, totalTeams, players, selectedPowerup) =>{


    return <>
        {renderTable(state, matchId, totalTeams, players, selectedPowerup)}
    </>
}

const MatchPowerupSummary = ({matchId, players, totalTeams}) =>{

    const [state, dispatch] = useReducer(reducer,{ 
        "bLoading": true,
        "error": null,
        "powerupNames": {},
        "playerPowerupData": []
    });

    const [selectedId, setSelectedId] = useState(-1);

    useEffect(() =>{

        const controller = new AbortController();

        const loadData = async () =>{

            const req = await fetch("/api/match",{
                "signal": controller.signal,
                "headers": {"Content-type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({"mode": "powerups", "matchId": matchId})
            });

            const res = await req.json();

            if(res.error !== undefined){
                dispatch({"type": "error", "errorMessage": res.error});
            }else{
            
                const ids = Object.keys(res.names);

                if(ids.length > 0){
                    setSelectedId(ids[0]);
                }

                dispatch({"type": "loaded", "powerupNames": res.names, "playerPowerupData": res.playerData});
            }

        }

        loadData();

        return () =>{
            controller.abort();
        }
    }, [matchId]);


    if(state.bLoading) return <Loading />;
    if(state.error !== null) return <ErrorMessage title="Powerup Summary" text={state.error}/>

    return <div>
        <div className="default-header">Powerup Summary</div>
        {renderTabs(state.powerupNames, selectedId, setSelectedId)}
        {renderData(state, matchId, totalTeams, players, selectedId)}
    </div>
}

export default MatchPowerupSummary;