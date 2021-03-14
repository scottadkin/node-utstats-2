import styles from './MatchFragTable.module.css';
import Playtime from '../Playtime/';
import CountryFlag from '../CountryFlag/';
import Link from 'next/link';
import TipHeader from '../TipHeader/';
import MMSS from '../MMSS/';
import Functions from '../../api/functions';
import React from 'react';

const MatchFragTable = ({players, team, matchStart}) =>{



    //console.log(players);

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
        totalAccuracy += p.accuracy;

        elems.push(<tr key={`frag_tr_${team}_${i}`} className={bgColor}>
            <td className="text-left"><CountryFlag key={`frag_country__${team}_${i}`} country={p.country} /><Link href={`/player/${p.player_id}`}><a>{p.name}</a></Link></td>
            <td><MMSS key={`frag_playtime__${team}_${i}`} timestamp={p.playtime - matchStart} /></td>
        
            <td>{(p.suicides > 0) ? p.suicides : ''}</td>
            <td>{(p.team_kills > 0) ? p.team_kills : ''}</td>
            <td>{(p.spawn_kills > 0) ? p.spawn_kills : ''}</td>
            <td>{(p.deaths > 0) ? p.deaths : ''}</td>
            <td>{(p.kills > 0) ? p.kills : ''}</td>
            <td>{p.efficiency.toFixed(2)}%</td>
            <td>{p.accuracy.toFixed(2)}%</td>
            <td>{p.frags}</td>
            <td>{p.score}</td>
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
  
        <td>{(totalSuicides > 0) ? totalSuicides : ''}</td>
        <td>{(totalTeamKills > 0) ? totalTeamKills : ''}</td>
        <td>{(totalSpawnKills > 0) ? totalSpawnKills : ''}</td>
        <td>{(totalDeaths > 0) ? totalDeaths : ''}</td>
        <td>{(totalKills > 0) ? totalKills : ''}</td>
        <td>{totalEff.toFixed(2)}%</td>
        <td>{totalAccuracy}%</td>
        <td>{totalFrags}</td>
        <td>{totalScore}</td>
    </tr>);

    return (<table className={`center m-bottom-25`}>
        <tbody>
            <tr className={bgColor}>
                <th>Player</th>
                <th>Playtime</th>
                <th>Suicides</th>
                <th>Team Kills</th>
                <th>Spawn Kills</th>
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