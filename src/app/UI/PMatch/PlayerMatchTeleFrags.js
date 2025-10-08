"use client"
import { useState } from "react";
import Tabs from "../Tabs";
import InteractiveTable from "../InteractiveTable";
import CountryFlag from "../CountryFlag";
import Link from "next/link";
import { ignore0, getPlayerFromMatchData, MMSS, getTeamColor, scalePlaytime } from "../../../../api/generic.mjs";

function renderGeneral(selectedTab, stats){

    if(selectedTab !== 0) return null;

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
            "displayValue": ignore0(stats.telefrag_kills)
        },
        "deaths": {
            "value": stats.telefrag_deaths, 
            "displayValue": ignore0(stats.telefrag_deaths)
        },
        "bestMulti": {
            "value": stats.telefrag_best_multi, 
            "displayValue": ignore0(stats.telefrag_best_multi)
        },
        "bestSpree": {
            "value": stats.telefrag_best_spree, 
            "displayValue": ignore0(stats.telefrag_best_spree)
        },
        "discKills": {
            "value": stats.tele_disc_kills, 
            "displayValue": ignore0(stats.tele_disc_kills)
        },
        "discDeaths": {
            "value": stats.tele_disc_deaths, 
            "displayValue": ignore0(stats.tele_disc_deaths)
        },
        "discBestMulti": {
            "value": stats.tele_disc_best_multi, 
            "displayValue": ignore0(stats.tele_disc_best_multi)
        },
        "discBestSpree": {
            "value": stats.tele_disc_best_spree, 
            "displayValue": ignore0(stats.tele_disc_best_spree)
        },
    };

    return <InteractiveTable width={1} headers={headers} data={[data]}/>
}

function renderKills(selectedTab, matchId, matchStart, players, kills, bHardcore){

    if(selectedTab !== 1) return null;

    const headers = {
        "timestamp": "Timestamp",
        "killer": "Killer",
        "victim": "Victim",
        "discKill": "Kill Type"
    };

    const data = kills.map((kill) =>{

        const killer = getPlayerFromMatchData(players, kill.killer_id);
        const victim = getPlayerFromMatchData(players, kill.victim_id);
        

        const killerElem = <Link href={`/pmatch/${matchId}/?player=${killer.id}`}><CountryFlag country={killer.country}/>{killer.name}</Link>
        const victimElem = <Link href={`/pmatch/${matchId}/?player=${victim.id}`}><CountryFlag country={victim.country}/>{victim.name}</Link>

        let timestamp = scalePlaytime(kill.timestamp - matchStart, bHardcore);
        
        return {
            "timestamp": {"value": kill.timestamp, "displayValue": MMSS(timestamp)},
            "killer": {"value": killer.name.toLowerCase(), "displayValue": killerElem, "className": getTeamColor(killer.team)},
            "victim": {"value": victim.name.toLowerCase(), "displayValue": victimElem, "className": getTeamColor(victim.team)},
            "discKill": {"value": kill.disc_kill, "displayValue": (kill.disc_kill) ? "Disc Kill" : "Telefrag"}
        }
    });

    return <InteractiveTable width={1} headers={headers} data={data}/>
}


export default function PlayerMatchTeleFrags({data, matchId, bHardcore, matchStart, kills}){

    const [selectedTab, setSelectedTab] = useState(0);


    const tabOptions = [
        {"name": "General", "value": 0},
        {"name": "Kills", "value": 1},
    ];

    return <div>
        <div className="default-header">Telefrags Summary</div>
        <Tabs selectedValue={selectedTab} options={tabOptions} changeSelected={(newTab) => {
            setSelectedTab(newTab)
        }} />
        {renderGeneral(selectedTab, data[0])}
        {renderKills(selectedTab, matchId, matchStart, data, kills, bHardcore)}
    </div>
}
