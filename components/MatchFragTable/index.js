import styles from './MatchFragTable.module.css';
import CountryFlag from '../CountryFlag/';
import Link from 'next/link';
import MMSS from '../MMSS/';
import Functions from '../../api/functions';
import React from 'react';


const bAnyData = (data) =>{

    const types = [
        "suicides",
        "team_kills",
        "spawn_kills",
        "headshots",
        "deaths",
        "kills",
        "efficiency",
        "frags",
        "scores"
    ];


    for(let i = 0; i < types.length; i++){

        if(types[i] !== 0) return true;
    }

    return false;
}

const MatchFragTable = ({players, team, matchStart, toDisplay}) =>{

    if(players.length === 0) return null;

    let bgColor = Functions.getTeamColor(team);

    const elems = [];
    
    let totalPlaytime = 0;
    let totalSuicides = 0;
    let totalTeamKills = 0;
    let totalSpawnKills = 0;
    let totalDeaths = 0;
    let totalKills = 0;
    let totalFrags = 0;
    let totalScore = 0;
    let totalEff = 0;
    let totalHeadshots = 0;

    let p = 0;


    for(let i = 0; i < players.length; i++){

        p = players[i];

        totalPlaytime += p.playtime - matchStart;
        totalSuicides += p.suicides;
        totalTeamKills += p.team_kills;
        totalSpawnKills += p.spawn_kills;
        totalDeaths += p.deaths;
        totalKills += p.kills;
        totalFrags += p.frags;
        totalScore += p.score;
        totalHeadshots += p.headshots;

        if(bAnyData(p)){

            elems.push(<tr key={`frag_tr_${team}_${i}`} >
                <td className={`text-left ${bgColor}`}><CountryFlag key={`frag_country__${team}_${i}`} country={p.country} /><Link href={`/player/${p.player_id}`}><a>{p.name}</a></Link></td>
                <td><MMSS key={`frag_playtime__${team}_${i}`} timestamp={p.playtime - matchStart} /></td>
                <td>{Functions.ignore0(p.score)}</td>
                <td>{Functions.ignore0(p.frags)}</td>
                <td>{Functions.ignore0(p.kills)}</td>
                <td>{Functions.ignore0(p.deaths)}</td>
                {(toDisplay.indexOf('suicides') !== -1) ? <td>{Functions.ignore0(p.suicides)}</td> : null}
                {(toDisplay.indexOf('team_kills') !== -1) ? <td>{Functions.ignore0(p.team_kills)}</td> : null}
                {(toDisplay.indexOf('headshots') !== -1) ? <td>{Functions.ignore0(p.headshots)}</td> : null}
                {(toDisplay.indexOf('spawn_kills') !== -1) ? <td>{Functions.ignore0(p.spawn_kills)}</td> : null}
                <td>{p.efficiency.toFixed(2)}%</td>

            </tr>);
        }
    }

    if(totalKills && totalDeaths > 0){
        totalEff = totalKills / (totalDeaths + totalKills);
        totalEff *= 100;
    }else if(totalKills > 0){
        totalEff = 100;
    }


    elems.push(<tr key={`frag_tr_total__${team}`} className={`${styles.totals}`}>
        <td className="text-left">Totals</td>
        <td><MMSS key={`frag_country__${team}_total`} timestamp={totalPlaytime} /></td>
        <td>{Functions.ignore0(totalScore)}</td>
        <td>{Functions.ignore0(totalFrags)}</td>
        <td>{Functions.ignore0(totalKills)}</td>
        <td>{Functions.ignore0(totalDeaths)}</td>
        {(toDisplay.indexOf('suicides') !== -1) ? <td>{Functions.ignore0(totalSuicides)}</td> : null}
        {(toDisplay.indexOf('team_kills') !== -1) ? <td>{Functions.ignore0(totalTeamKills)}</td> : null}
        {(toDisplay.indexOf('headshots') !== -1) ? <td>{Functions.ignore0(totalHeadshots)}</td> : null}
        {(toDisplay.indexOf('spawn_kills') !== -1) ? <td>{Functions.ignore0(totalSpawnKills)}</td> : null}
       
        <td>{totalEff.toFixed(2)}%</td>
    
    </tr>);

    return (<table className={`${styles.table} center m-bottom-25 t-width-1`}>
        <tbody>
            <tr className={bgColor}>
                <th className="name-td">Player</th>
                <th>Playtime</th>
                <th>Score</th>
                <th>Frags</th>
                <th>Kills</th>
                <th>Deaths</th>
                {(toDisplay.indexOf('suicides') !== -1) ? <th>Suicides</th> : null}
                {(toDisplay.indexOf('team_kills') !== -1) ? <th>Team Kills</th> : null}
                {(toDisplay.indexOf('headshots') !== -1) ? <th>Headshots</th> : null}
                {(toDisplay.indexOf('spawn_kills') !== -1) ? <th>Spawn Kills</th> : null}
                <th>Efficiency</th>     
            </tr>
            {elems}
        </tbody>
    </table>);
}


export default MatchFragTable;