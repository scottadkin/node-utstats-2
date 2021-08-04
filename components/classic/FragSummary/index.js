import Link from 'next/link';
import CountryFlag from '../../CountryFlag';
import Functions from '../../../api/functions';

const TeamTable = ({teamId, players}) =>{

    const rows = [];

    let p = 0;
    let teamColor = "team-none";

    if(teamId === 0){
        teamColor = "team-red";
    }else if(teamId === 1){
        teamColor = "team-blue";
    }else if(teamId === 2){
        teamColor = "team-green";
    }else if(teamId === 3){
        teamColor = "team-yellow";
    }

    let totals = {
        "gametime": 0,
        "frags": 0,
        "kills": 0,
        "deaths": 0,
        "suicides": 0,
        "teamkills": 0,
        "ttl": 0,
        "players": 0
    };

    for(let i = 0; i < players.length; i++){

        p = players[i];

        if(p.country === ""){
            p.country = "xx";
        }

        if(teamId === -1 || teamId === p.team){

            totals.gametime += p.gametime;
            totals.frags += p.frags;
            totals.kills += p.kills;
            totals.deaths += p.deaths;
            totals.suicides += p.suicides;
            totals.teamkills += p.teamkills;
            totals.ttl += p.ttl;
            totals.players++;

            rows.push(<tr key={i}>
                <td className={teamColor}><Link href={`/classic/pmatch/${p.pid}`}><a><CountryFlag country={p.country}/>{p.name}</a></Link></td>
                <td>{Functions.MMSS(p.gametime)}</td>
                <td>{Functions.ignore0(p.frags)}</td>
                <td>{Functions.ignore0(p.kills)}</td>
                <td>{Functions.ignore0(p.deaths)}</td>
                <td>{Functions.ignore0(p.suicides)}</td>
                <td>{Functions.ignore0(p.teamkills)}</td>
                <td>{p.eff.toFixed(2)}%</td>
                <td>{Functions.MMSS(p.ttl)}</td>
            </tr>);
        }
    }

    let totalEff = 0;

    if(totals.kills > 0){

        if(totals.deaths === 0){
            totalEff = 100;
        }else{
            totalEff = (totals.kills / (totals.kills + totals.deaths)) * 100;
        }
    }

    let totalTTL = 0;
    
    if(totals.ttl > 0 && totals.players > 0){
        totals.ttl / totals.players;
    }

    console.log(totalTTL);

    rows.push(<tr key={"totals"}>
        <td>Totals</td>
        <td>{Functions.MMSS(totals.gametime)}</td>
        <td>{Functions.ignore0(totals.frags)}</td>
        <td>{Functions.ignore0(totals.kills)}</td>
        <td>{Functions.ignore0(totals.deaths)}</td>
        <td>{Functions.ignore0(totals.suicides)}</td>
        <td>{Functions.ignore0(totals.teamkills)}</td>
        <td>{totalEff.toFixed(2)}%</td>
        <td>{Functions.MMSS(totalTTL)}</td>
    </tr>);

    return <table className="t-width-1 td-1-left td-1-150 m-bottom-25">
        <tbody>
            <tr>
                <th>Player</th>
                <th>Playtime</th>
                <th>Frags</th>
                <th>Kills</th>
                <th>Deaths</th>
                <th>Suicides</th>
                <th>Team Kills</th>
                <th>Efficiency</th>
                <th>Avg TTL</th>
            </tr>
            {rows}
        </tbody>
    </table>
 
}

const FragSummary = ({data, teams}) =>{

    const tables = [];

    if(teams === 0){
        tables.push(<TeamTable key={-1} teamId={-1} players={data} />);
    }else{

        for(let i = 0; i < teams; i++){

            tables.push(<TeamTable key={i} teamId={i} players={data} />);
        }
    }

    return <div>
        <div className="default-header">Frag Summary</div>
        {tables}
    </div>
}

export default FragSummary;