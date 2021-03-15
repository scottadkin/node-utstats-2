import styles from './MatchFragTable.module.css';
import Playtime from '../Playtime/';
import CountryFlag from '../CountryFlag/';
import Link from 'next/link';
import TipHeader from '../TipHeader/';
import MMSS from '../MMSS/';
import Functions from '../../api/functions';
import React from 'react';


//find what types of data have a value other than 0 (no point displaying headshots if there arent any same with anything else)
const bAnyData = (players, types) =>{

    const typeStats = {};

    for(let i = 0; i < types.length; i++){

        typeStats[types[i]] = false;
    }

    let p = 0;

    for(let i = 0; i < players.length; i++){

        p = players[i];

        for(let x = 0; x < types.length; x++){

            if(!typeStats[types[x]]){

                if(p[types[x]] !== 0){
                    typeStats[types[x]] = true;
                }
            }
        }
    }

    return typeStats;
}

const MatchFragTable = ({players, team, matchStart}) =>{


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
    let totalAccuracy = 0;
    let totalHeadshots = 0;

    let p = 0;


    const typeStats = bAnyData(players, ['suicides','team_kills','spawn_kills','headshots']);

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
        totalAccuracy += p.accuracy;
        totalHeadshots += p.headshots;

        elems.push(<tr key={`frag_tr_${team}_${i}`} className={bgColor}>
            <td className="text-left"><CountryFlag key={`frag_country__${team}_${i}`} country={p.country} /><Link href={`/player/${p.player_id}`}><a>{p.name}</a></Link></td>
            <td><MMSS key={`frag_playtime__${team}_${i}`} timestamp={p.playtime - matchStart} /></td>
        
            {(typeStats['suicides']) ? <td>{Functions.ignore0(p.suicides)}</td> : null}
            {(typeStats['team_kills']) ? <td>{Functions.ignore0(p.team_kills)}</td> : null}
            {(typeStats['spawn_kills']) ? <td>{Functions.ignore0(p.spawnKills)}</td> : null}
            {(typeStats['headshots']) ? <td>{Functions.ignore0(p.headshots)}</td> : null}
            <td>{Functions.ignore0(p.deaths)}</td>
            <td>{Functions.ignore0(p.kills)}</td>
            <td>{p.efficiency.toFixed(2)}%</td>
            <td>{p.accuracy.toFixed(2)}%</td>
            <td>{Functions.ignore0(p.frags)}</td>
            <td>{Functions.ignore0(p.score)}</td>

        </tr>);
    }

    if(totalKills && totalDeaths > 0){
        totalEff = totalKills / (totalDeaths + totalKills);
        totalEff *= 100;
    }else if(totalKills > 0){
        totalEff = 100;
    }

    if(players.length > 0){

        totalAccuracy = (totalAccuracy / players.length).toFixed(2);
    }

    elems.push(<tr key={`frag_tr_total__${team}`} className={`${styles.totals}`}>
        <td className="text-left">Totals</td>
        <td><MMSS key={`frag_country__${team}_total`} timestamp={totalPlaytime} /></td>
  
        {(typeStats['suicides']) ? <td>{Functions.ignore0(totalSuicides)}</td> : null}
        {(typeStats['team_kills']) ? <td>{Functions.ignore0(totalTeamKills)}</td> : null}
        {(typeStats['spawn_kills']) ? <td>{Functions.ignore0(totalSpawnKills)}</td> : null}
        {(typeStats['headshots']) ? <td>{Functions.ignore0(totalHeadshots)}</td> : null}
        <td>{Functions.ignore0(totalDeaths)}</td>
        <td>{Functions.ignore0(totalKills)}</td>
        <td>{totalEff.toFixed(2)}%</td>
        <td>{totalAccuracy}%</td>
        <td>{Functions.ignore0(totalFrags)}</td>
        <td>{Functions.ignore0(totalScore)}</td>
    </tr>);

    return (<table className={`center m-bottom-25`}>
        <tbody>
            <tr className={bgColor}>
                <th>Player</th>
                <th>Playtime</th>
                {(typeStats['suicides']) ? <th>Suicides</th> : null}
                {(typeStats['team_kills']) ? <th>Team Kills</th> : null}
                {(typeStats['spawn_kills']) ? <th>Spawn Kills</th> : null}
                {(typeStats['headshots']) ? <th>Headshots</th> : null}
                <th>Deaths</th>
                <th>Kills</th>
                <th>Efficiency</th>
                <th>Accuracy</th>
                <th>Frags</th>
                <th>Score</th>
            </tr>
            {elems}
        </tbody>
    </table>);
}


export default MatchFragTable;