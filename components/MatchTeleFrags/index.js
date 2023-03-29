import InteractiveTable from "../InteractiveTable";
import Functions from "../../api/functions";
import Link from "next/link";
import CountryFlag from "../CountryFlag";
import {useEffect, useReducer} from "react";
import Loading from "../Loading";
import NotificationSmall from "../NotificationSmall";

const reducer = (state, action) =>{

    switch(action.type){

        case "loaded":{
            return {
                ...state,
                "bLoading": false,
                "error": null,
                "data": action.data
            }
        }
        case "error": {
            return {
                ...state,
                "bLoading": false,
                "error": action.errorMessage,
                "data": null
            }
        }
    }
    return state;
}

const loadData = async (dispatch, matchId, signal) =>{

    const req = await fetch("/api/match", {
        "signal": signal,
        "headers": {"Content-type": "application/json"},
        "method": "POST",
        "body": JSON.stringify({"mode": "telefrags", "matchId": matchId})
    });

    const res = await req.json();

    if(res.error !== undefined){

        dispatch({"type": "error", "errorMessage": res.error});
        return;
    }

    dispatch({"type": "loaded", "data": res.data});
}

const renderKills = (state, matchId, matchStart, players) =>{

    if(state.error !== null){
        return <NotificationSmall type="error">
        <b>Failed to display telefrag kills:</b> {state.error}
        </NotificationSmall>
    }

    if(state.bLoading) return <Loading />;

    const headers = {
        "time": "Timestamp",
        "killer": "Killer",
        "victim": "Victim",
        "type": "Kill Type"

    };

    const data = state.data.map((kill) =>{

        const killer = Functions.getPlayer(players, kill.killer_id, true);
        const victim = Functions.getPlayer(players, kill.victim_id, true);

        console.log(killer);

        let killType = "Telefrag";

        if(kill.disc_kill){
            killType = "Disc Kill";
        }
 
        return {
            "time": {"value": kill.timestamp, "displayValue": Functions.MMSS(kill.timestamp - matchStart)},
            "killer": {
                "value": killer.name.toLowerCase(), 
                "displayValue": <Link href={`/pmatch/${matchId}/?player=${killer.player_id}`}>
                    <a> 
                        <CountryFlag country={killer.country}/>{killer.name}
                    </a>
                </Link>,
                "className": Functions.getTeamColor(killer.team)
            },
            "victim": {
                "value": victim.name.toLowerCase(), 
                "displayValue": <Link href={`/pmatch/${matchId}/?player=${victim.player_id}`}>
                    <a> 
                        <CountryFlag country={victim.country}/>{victim.name}
                    </a>
                </Link>,
                "className": Functions.getTeamColor(victim.team)
            },
            "type": {"value": kill.disc_kill, "displayValue": killType},
        }
    });

    return <InteractiveTable width={1} headers={headers} data={data}/>
}

const MatchTeleFrags = ({data, matchId, matchStart, players}) =>{

    const [state, dispatch] = useReducer(reducer, {"bLoading": true, "error": null, "data": null});

    useEffect(() =>{

        const controller = new AbortController();

        loadData(dispatch, matchId, controller.signal);

        return () =>{
            controller.abort();
        }

    },[matchId]);

    const headers = {
        "player": "Player",
        "kills": "Kills",
        "deaths": "Deaths",
        "bestSpree": "Best Spree",
        "bestMulti": "Best Multi Kill",
        "discKills": "Disc Kills",
        "discDeaths": "Disc Deaths",
        "discSpree": "Disc Kills Best Spree",
        "discMulti": "Disc Kills Best Multi",
    };

    const columns = data.map((d) =>{

        return {
            "player": {
                "value": d.name.toLowerCase(), 
                "displayValue": <Link href={`/pmatch/${matchId}/?player=${d.player_id}`}>
                    <a>
                        <CountryFlag country={d.country}/>
                        {d.name}
                    </a>
                </Link>,
                "className": `text-left ${Functions.getTeamColor(d.team)}`
            },
            "kills": {"value": d.telefrag_kills, "displayValue": Functions.ignore0(d.telefrag_kills)},
            "deaths": {"value": d.telefrag_deaths, "displayValue": Functions.ignore0(d.telefrag_deaths)},
            "bestSpree": {"value": d.telefrag_best_spree, "displayValue": Functions.ignore0(d.telefrag_best_spree)},
            "bestMulti": {"value": d.telefrag_best_multi, "displayValue": Functions.ignore0(d.telefrag_best_multi)},
            "discKills": {"value": d.tele_disc_kills, "displayValue": Functions.ignore0(d.tele_disc_kills)},
            "discDeaths": {"value": d.tele_disc_deaths, "displayValue": Functions.ignore0(d.tele_disc_deaths)},
            "discSpree": {"value": d.tele_disc_best_spree, "displayValue": Functions.ignore0(d.tele_disc_best_spree)},
            "discMulti": {"value": d.tele_disc_best_multi, "displayValue": Functions.ignore0(d.tele_disc_best_multi)},
        }
    });

    return <div>
        <div className="default-header">Telefrags Summary</div>
        <InteractiveTable width={1} headers={headers} data={columns}/>
        <h1>Fix importer duplicates and ignore suicides</h1>
        {renderKills(state, matchId, matchStart, players)}
    </div>
}

export default MatchTeleFrags;