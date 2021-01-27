import styles from './TeamsSummary.module.css';
import Functions from '../../api/functions';
import MMSS from '../MMSS/';
import CountryFlag from '../CountryFlag/';
import Link from 'next/link';


const TeamsSummary = ({data, playerNames}) =>{

    data = JSON.parse(data);
    playerNames = JSON.parse(playerNames);

    const elems = [];
    let currentPlayer = 0;

    for(let i = 0; i < data.length; i++){

        currentPlayer = Functions.getPlayer(playerNames, data[i].player);

        elems.push(<tr key={`team-change-${i}`} className={Functions.getTeamColor(data[i].team)}>
            <td><MMSS timestamp={data[i].timestamp} /></td>
            <td>
                <Link href={`/players/${data[i].player}`}><a><CountryFlag country={currentPlayer.country}/> <b>{currentPlayer.name} </b></a></Link>
                joined the <b>{Functions.getTeamName(data[i].team)}</b> 
            </td>
        </tr>);
    }


    return (<div className={`special-table ${styles.table}`}>
        <div className="default-header">
            Team Changes Summary
        </div>
        <table>
            <tbody>
                <tr>
                    <th>Timestamp</th>
                    <th>Information</th>
                </tr>
                {elems}
            </tbody>
        </table>
    </div>);
}


export default TeamsSummary;