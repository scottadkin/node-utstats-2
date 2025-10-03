import {MMSS, ignore0} from "../../../../api/generic.mjs";
import CountryFlag from '../CountryFlag';
import Link from 'next/link';
import { BasicTable } from '../Tables';

export default function MatchMonsterHuntFragSummary({playerData, single, matchStart, matchId, bMH}){

    if(bMH === 0) return null;
    const rows = [];

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

        if(single !== undefined){

            row.unshift({"className":"team-none text-left player", "value": <Link href={`/pmatch/${matchId}/?player=${p.player_id}`}>
                <CountryFlag country={p.country}/>{p.name}
            </Link>});
        }
    }

    const headers = [];

    if(single !== undefined){
        headers.push("Player");
    }

    headers.push(
        "Playtime", "Team Kills", "Deaths", 
        "Deaths by Monster", "Monster Kills",
        "Most Kills In a Life",
        "Score"
    );

    return <BasicTable width={1} headers={headers} rows={rows} />
    
}

