import {MMSS, ignore0, toPlaytime} from "../../../../api/generic.mjs";
import CountryFlag from '../CountryFlag';
import Link from 'next/link';
import InteractiveTable from "../InteractiveTable";

export default function MatchMonsterHuntFragSummary({playerData, single, matchStart, matchId, bMH}){

    if(bMH === 0) return null;
    const rows = [];

    let headers = {
        "playtime": "Playtime",
        "teamKills": "Team Kills",
        "deaths": "Deaths",
        "deathsMonster": "Deaths By Monster",
        "monsterKills": "Monster Kills",
        "mostKills": "Most Kills In A Life",
        "score": "Score"
    };

    for(let i = 0; i < playerData.length; i++){

        const p = playerData[i];

        const row = [
            MMSS(p.playtime - matchStart),
            ignore0(p.team_kills),
            ignore0(p.deaths + p.suicides),
            ignore0(p.mh_deaths),
            ignore0(p.mh_kills),
            ignore0(p.mh_kills_best_life),
            ignore0(p.score),
        ];


        rows.push({
            "player": {"value": p.name.toLowerCase() , "displayValue":  <Link href={`/pmatch/${matchId}?player=${p.player_id}`}>
                <CountryFlag country={p.country}/>{p.name}
            </Link>, "className": "player"},
            "playtime": {"value": p.playtime, "displayValue": toPlaytime(p.playtime - matchStart), "className": "playtime" },
            "teamKills": {"value": p.team_kills, "displayValue": ignore0(p.team_kills)},
            "deaths": {"value": p.deaths + p.suicides, "displayValue":  ignore0(p.deaths + p.suicides)},
            "deathsMonster": {"value": p.mh_deaths, "displayValue": ignore0(p.mh_deaths)},
            "monsterKills": {"value": p.mh_kills, "displayValue":  ignore0(p.mh_kills)},
            "mostKills": {"value": p.mh_kills_best_life, "displayValue": ignore0(p.mh_kills_best_life)},
            "score": {"value": p.score, "displayValue": ignore0(p.score)},
        });
    }

    if(single !== undefined){
       headers = Object.assign({"player": "Player"}, headers);
    }

    return <InteractiveTable width={1} headers={headers} data={rows} bAsc={false} defaultOrder="score"/> 
}

