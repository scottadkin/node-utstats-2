import styles from './ConnectionSummary.module.css';
import MMSS from '../MMSS/';
import CountryFlag from '../CountryFlag/';
import Functions from '../../api/functions';

const ConnectionSummary = ({data, playerNames, bTeamGame}) =>{

    playerNames = JSON.parse(playerNames);
    data = JSON.parse(data);
    bTeamGame = parseInt(bTeamGame);
    //console.log(data);

    //console.log(playerNames);

    const elems = [];
    let currentPlayer = 0;
    let bgColor = '';

    for(let i = 0; i < data.length; i++){

        currentPlayer = Functions.getPlayer(playerNames, data[i].player);
        if(bTeamGame){
            bgColor = Functions.getTeamColor(currentPlayer.team);
        }else{
            bgColor = "team-none";
        }

        elems.push(<tr key={`connection-${i}`} className={bgColor}>
            <td><MMSS timestamp={data[i].timestamp}/></td>
            <td><a href={`/player/${data[i].player}`}><CountryFlag country={currentPlayer.country}/>{currentPlayer.name}</a></td>
            <td>{(!data[i].event) ? "Connected" : "Disconnected"}</td>
        </tr>);
    }

    return (
        <div className={`special-table ${styles.wrapper} center`}>
            <div className="default-header">
                Player Connections
            </div>
            <table>
                <tbody>
                    <tr>
                        <th>Time</th>
                        <th>Player</th>
                        <th>Event</th>
                    </tr>
                    {elems}
                </tbody>
            </table>
        </div>
    );
}


export default ConnectionSummary;