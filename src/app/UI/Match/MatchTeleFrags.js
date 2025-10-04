"use client"
import InteractiveTable from "../InteractiveTable";
import Link from "next/link";
import CountryFlag from "../CountryFlag";
import {useState} from "react";
import Tabs from "../Tabs";
import { getPlayerFromMatchData, MMSS, getTeamColor, ignore0 } from "../../../../api/generic.mjs";

function renderKills(selectedTab, data, matchId, matchStart, players){

    if(selectedTab !== 1) return null;

    const headers = {
        "time": "Timestamp",
        "killer": "Killer",
        "victim": "Victim",
        "type": "Kill Type"

    };

    const rows = data.map((kill) =>{

        const killer = getPlayerFromMatchData(players, kill.killer_id);
        const victim = getPlayerFromMatchData(players, kill.victim_id);

        let killType = "Telefrag";

        if(kill.disc_kill){
            killType = "Disc Kill";
        }
 
        return {
            "time": {"value": kill.timestamp, "displayValue": MMSS(kill.timestamp - matchStart)},
            "killer": {
                "value": killer.name.toLowerCase(), 
                "displayValue": <Link href={`/pmatch/${matchId}/?player=${killer.id}`}>
                    
                        <CountryFlag country={killer.country}/>{killer.name}
                    
                </Link>,
                "className": getTeamColor(killer.team)
            },
            "victim": {
                "value": victim.name.toLowerCase(), 
                "displayValue": <Link href={`/pmatch/${matchId}/?player=${victim.id}`}>
                    
                        <CountryFlag country={victim.country}/>{victim.name}
                    
                </Link>,
                "className": getTeamColor(victim.team)
            },
            "type": {"value": kill.disc_kill, "displayValue": killType},
        }
    });

    return <div>
        <InteractiveTable width={4} headers={headers} data={rows} perPage={10}/>
    </div>
}


const renderGeneral = (selectedTab, matchId, players) =>{

    if(selectedTab !== 0) return null;

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

    const rows = [];

    for(let i = 0; i < players.length; i++){

        const d = players[i];

        if(d.playtime === 0) continue;
        
        rows.push({
            "player": {
                "value": d.name.toLowerCase(), 
                "displayValue": <Link href={`/pmatch/${matchId}/?player=${d.player_id}`}>
                    
                        <CountryFlag country={d.country}/>
                        {d.name}
                    
                </Link>,
                "className": `text-left ${getTeamColor(d.team)}`
            },
            "kills": {"value": d.telefrag_kills, "displayValue": ignore0(d.telefrag_kills)},
            "deaths": {"value": d.telefrag_deaths, "displayValue": ignore0(d.telefrag_deaths)},
            "bestSpree": {"value": d.telefrag_best_spree, "displayValue": ignore0(d.telefrag_best_spree)},
            "bestMulti": {"value": d.telefrag_best_multi, "displayValue": ignore0(d.telefrag_best_multi)},
            "discKills": {"value": d.tele_disc_kills, "displayValue": ignore0(d.tele_disc_kills)},
            "discDeaths": {"value": d.tele_disc_deaths, "displayValue": ignore0(d.tele_disc_deaths)},
            "discSpree": {"value": d.tele_disc_best_spree, "displayValue": ignore0(d.tele_disc_best_spree)},
            "discMulti": {"value": d.tele_disc_best_multi, "displayValue": ignore0(d.tele_disc_best_multi)},
        });

    }


    return <InteractiveTable width={1} headers={headers} data={rows}/>
}

export default function MatchTeleFrags({data, matchId, matchStart, players}){

    const [selectedTab, setSelectedTab] = useState(0);

    if(data == null || data.length === 0) return null;

    const tabOptions = [
        {"value": 0, "name": "General Stats"},
        {"value": 1, "name": "Kills List"},
    ];

    return <div>
        <div className="default-header">Telefrags Summary</div>
        
        <Tabs 
            options={tabOptions} 
            selectedValue={selectedTab} 
            changeSelected={(newTab) => setSelectedTab(newTab)}
        />
        {renderGeneral(selectedTab, matchId, players)}
        {renderKills(selectedTab, data, matchId, matchStart, players)}
    </div>
}
