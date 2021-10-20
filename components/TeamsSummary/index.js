import styles from './TeamsSummary.module.css';
import Functions from '../../api/functions';
import MMSS from '../MMSS/';
import CountryFlag from '../CountryFlag/';
import Link from 'next/link';


function getPreviousTeam(data, timestamp, player){


    let d = 0;
    let previous = -1;
    let previousTime = 0;

    for(let i = 0; i < data.length; i++){

        d = data[i];

        if(d.player === player){

            if(d.timestamp < timestamp){
                previous = d.team;
                previousTime = d.timestamp;
            }
        }
    }

    let playtime = 0;

    if(previousTime !== 0){
        playtime = timestamp - previousTime;
    }

    return {"team": previous, "playtime": playtime};
}

const TeamsSummary = ({host, data, playerNames, matchId}) =>{

    data = JSON.parse(data);
    playerNames = JSON.parse(playerNames);

    const elems = [];

    for(let i = 0; i < data.length; i++){

        const currentPlayer = Functions.getPlayer(playerNames, data[i].player);
        const previousTeam = getPreviousTeam(data, data[i].timestamp, data[i].player);

        const previousTeamString = (previousTeam.team === -1) ? "Joined Server" : (previousTeam.team === 255) ? "Spectator" : Functions.getTeamName(previousTeam.team)
        const currentTeamString = (data[i].team === 255) ? "Spectator" : Functions.getTeamName(data[i].team);

        elems.push(<tr key={`team-change-${i}`}>
            <td><MMSS timestamp={data[i].timestamp} /></td>
            <td><Link href={`/pmatch/${matchId}?player=${data[i].player}`}><a><CountryFlag host={host} country={currentPlayer.country}/> {currentPlayer.name} </a></Link></td>
            <td className={Functions.getTeamColor(previousTeam.team)}>
                {previousTeamString}
            </td>
            <td className={Functions.getTeamColor(data[i].team)}>
                <b>{currentTeamString}</b> 
            </td>
        </tr>);
    }


    return (<div className={`center ${styles.table}`}>
        <div className="default-header">
            Team Changes Summary
        </div>
        <table className="t-width-1">
            <tbody>
                <tr>
                    <th>Timestamp</th>
                    <th>Player</th>
                    <th>Old Team</th>
                    <th>New Team</th>
                </tr>
                {elems}
            </tbody>
        </table>
    </div>);
}


export default TeamsSummary;