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

const TeamsSummary = ({data, playerNames}) =>{

    data = JSON.parse(data);
    playerNames = JSON.parse(playerNames);

    const elems = [];
    let currentPlayer = 0;
    let previousTeam = "";

    for(let i = 0; i < data.length; i++){

        currentPlayer = Functions.getPlayer(playerNames, data[i].player);

        previousTeam = getPreviousTeam(data, data[i].timestamp, data[i].player);

        elems.push(<tr key={`team-change-${i}`}>
            <td><MMSS timestamp={data[i].timestamp} /></td>
            <td><Link href={`/players/${data[i].player}`}><a><CountryFlag country={currentPlayer.country}/> <b>{currentPlayer.name} </b></a></Link></td>
            <td className={Functions.getTeamColor(previousTeam.team)}>
                {Functions.getTeamName(previousTeam.team)}
            </td>
            <td>{(previousTeam.playtime > 0) ? Functions.MMSS(previousTeam.playtime) : ''}</td>
            <td className={Functions.getTeamColor(data[i].team)}>
                <b>{Functions.getTeamName(data[i].team)}</b> 
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
                    <th>Playtime</th>
                    <th>New Team</th>
                </tr>
                {elems}
            </tbody>
        </table>
    </div>);
}


export default TeamsSummary;