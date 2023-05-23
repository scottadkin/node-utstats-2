import { useReducer, useEffect } from "react";
import ErrorMessage from "../ErrorMessage";
import Tabs from "../Tabs";
import Loading from "../Loading";
import InteractiveTable from "../InteractiveTable";
import Functions from "../../api/functions";
import CountryFlag from "../CountryFlag";
import Link from "next/link";

const renderTabs = (state, dispatch) =>{

    const options = [
        {"name": "General", "value": 0},
        {"name": "Kills", "value": 1},
    ];

    return <Tabs selectedValue={state.selectedTab} options={options} changeSelected={(newTab) => {
        dispatch({"type": "changeTab", "tab": newTab});
    }} />
}


const reducer = (state, action) =>{

    switch(action.type){
        case "loaded": {
            return {
                ...state,
                "bLoading": false,
                "error": null,
                "kills": action.kills
            }
        }
        case "changeTab": {
            return {
                ...state,
                "selectedTab": action.tab
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

const renderGeneral = (state, stats) =>{

    if(state.selectedTab !== 0) return null;

    const headers = {
        "kills": "Telefrag Kills",
        "deaths": "Telefrag Deaths",
        "bestMulti": "Best Telefrag Multi Kill",
        "bestSpree": "Best Telefrag Spree",
        "discKills": "Disc Kills",
        "discDeaths": "Disc Deaths",
        "discBestMulti": "Best Disc Multi Kill",
        "discBestSpree": "Best Disc Spree",

    };

    const data = {
        "kills": {
            "value": stats.telefrag_kills, 
            "displayValue": Functions.ignore0(stats.telefrag_kills)
        },
        "deaths": {
            "value": stats.telefrag_deaths, 
            "displayValue": Functions.ignore0(stats.telefrag_deaths)
        },
        "bestMulti": {
            "value": stats.telefrag_best_multi, 
            "displayValue": Functions.ignore0(stats.telefrag_best_multi)
        },
        "bestSpree": {
            "value": stats.telefrag_best_spree, 
            "displayValue": Functions.ignore0(stats.telefrag_best_spree)
        },
        "discKills": {
            "value": stats.tele_disc_kills, 
            "displayValue": Functions.ignore0(stats.tele_disc_kills)
        },
        "discDeaths": {
            "value": stats.tele_disc_deaths, 
            "displayValue": Functions.ignore0(stats.tele_disc_deaths)
        },
        "discBestMulti": {
            "value": stats.tele_disc_best_multi, 
            "displayValue": Functions.ignore0(stats.tele_disc_best_multi)
        },
        "discBestSpree": {
            "value": stats.tele_disc_best_spree, 
            "displayValue": Functions.ignore0(stats.tele_disc_best_spree)
        },
    };



    return <InteractiveTable width={1} headers={headers} data={[data]}/>
}

const renderKills = (state, matchId, matchStart, players) =>{

    if(state.selectedTab !== 1) return null;
    if(state.bLoading) return <Loading />;
    if(state.error !== null) return <ErrorMessage title="Telefrag kills" text={state.error}/>

    const headers = {
        "timestamp": "Timestamp",
        "killer": "Killer",
        "victim": "Victim",
        "discKill": "Kill Type"
    };

    const data = state.kills.map((kill) =>{

        const killer = Functions.getPlayer(players, kill.killer_id, true);
        const victim = Functions.getPlayer(players, kill.victim_id, true);

        const killerElem = <Link href={`/pmatch/${matchId}/?player=${killer.player_id}`}><CountryFlag country={killer.country}/>{killer.name}</Link>
        const victimElem = <Link href={`/pmatch/${matchId}/?player=${victim.player_id}`}><CountryFlag country={victim.country}/>{victim.name}</Link>

        return {
            "timestamp": {"value": kill.timestamp, "displayValue": Functions.MMSS(kill.timestamp - matchStart)},
            "killer": {"value": killer.name.toLowerCase(), "displayValue": killerElem, "className": Functions.getTeamColor(killer.team)},
            "victim": {"value": victim.name.toLowerCase(), "displayValue": victimElem, "className": Functions.getTeamColor(victim.team)},
            "discKill": {"value": kill.disc_kill, "displayValue": (kill.disc_kill) ? "Disc Kill" : "Telefrag"}
        }
    });

    return <InteractiveTable width={1} headers={headers} data={data}/>
}

const loadData = async (matchId, playerId, dispatch, signal) =>{

    try{

        const req = await fetch("/api/match", {
            "signal": signal,
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({
                "mode": "player-match-telefrags", 
                "playerId": playerId, 
                "matchId": matchId
            })
        });

        const res = await req.json();

        if(res.error !== undefined){
            dispatch({"type": "error", "errorMessage": res.error});
            return;
        }

        dispatch({"type": "loaded", "kills": res.kills});

    }catch(err){

        if(err.name !== "AbortError"){
            console.trace(err);
        }
    }
}

const PlayerMatchTeleFrags = ({data, matchId, playerId, matchStart, players}) =>{

    const [state, dispatch] = useReducer(reducer, {
        "bLoading": true, 
        "selectedTab": 0, 
        "error": null,
        "kills": []
    });

    useEffect(() =>{

        const controller = new AbortController();

        loadData(matchId, playerId, dispatch, controller.signal);

        return () =>{ return controller.abort() }

    }, [matchId, playerId]);

    if(data.length === 0) return null;

    return <div>
        <div className="default-header">Telefrags Summary</div>
        {renderTabs(state, dispatch)}
        {renderGeneral(state, data[0])}
        {renderKills(state, matchId, matchStart, players)}
    </div>
}

export default PlayerMatchTeleFrags;