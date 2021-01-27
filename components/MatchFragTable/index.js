import styles from './MatchFragTable.module.css';
import Playtime from '../Playtime/';
import CountryFlag from '../CountryFlag/';

const MatchFragTable = ({players, team}) =>{

    players = JSON.parse(players);

    //console.log(players);

    let bgColor = "team-none";

    switch(team){
        case 0: {  bgColor = "team-red"; } break;
        case 1: {  bgColor = "team-blue"; } break;
        case 2: {  bgColor = "team-green"; } break;
        case 3: {  bgColor = "team-yellow"; } break;
    }


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

    let p = 0;

    for(let i = 0; i < players.length; i++){

        p = players[i];

        totalPlaytime += p.playtime;
        totalSuicides += p.suicides;
        totalTeamKills += p.team_kills;
        totalSpawnKills += p.spawn_kills;
        totalDeaths += p.deaths;
        totalKills += p.kills;
        totalFrags += p.frags;
        totalScore += p.score;

        elems.push(<tr key={`frag_tr_${team}_${i}`} className={bgColor}>
            <td className="text-left"><CountryFlag key={`frag_country__${team}_${i}`} country={p.country} /><a  href={`/player/${p.player_id}`}>{p.name}</a></td>
            <td><Playtime key={`frag_playtime__${team}_${i}`} seconds={p.playtime} /></td>
            <td>{(p.suicides > 0) ? p.suicides : ''}</td>
            <td>{(p.team_kills > 0) ? p.team_kills : ''}</td>
            <td>{(p.spawn_kills > 0) ? p.spawn_kills : ''}</td>
            <td>{(p.deaths > 0) ? p.deaths : ''}</td>
            <td>{(p.kills > 0) ? p.kills : ''}</td>
            <td>{p.efficiency.toFixed(2)}%</td>
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

    elems.push(<tr key={`frag_tr_total__${team}`} className={`${styles.totals}`}>
        <td className="text-left">Totals</td>
        <td><Playtime key={`frag_country__${team}_total`} seconds={totalPlaytime} /></td>
        <td>{(totalSuicides > 0) ? totalSuicides : ''}</td>
        <td>{(totalTeamKills > 0) ? totalTeamKills : ''}</td>
        <td>{(totalSpawnKills > 0) ? totalSpawnKills : ''}</td>
        <td>{(totalDeaths > 0) ? totalDeaths : ''}</td>
        <td>{(totalKills > 0) ? totalKills : ''}</td>
        <td>{totalEff.toFixed(2)}%</td>
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
                <th>Frags</th>
                <th>Score</th>
            </tr>
            {elems}
        </tbody>
    </table>);
}

export default MatchFragTable;