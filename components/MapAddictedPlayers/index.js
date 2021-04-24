import Link from 'next/link';
import CountryFlag from '../CountryFlag';
import Functions from '../../api/functions';

const MapAddictedPlayers = ({players, playerNames}) =>{


    const elems = [];

        let p = 0;


        players = JSON.parse(players);
        playerNames = JSON.parse(playerNames);
        let currentPlayer = 0;

        for(let i = 0; i < players.length; i++){

            p = players[i];

            currentPlayer = Functions.getPlayer(playerNames, p.player);
  
            elems.push(<tr key={i}>
                <td className="text-left"><Link href={`/player/${currentPlayer.id}`}><a><CountryFlag country={currentPlayer.country}/>{currentPlayer.name}</a></Link></td>
                <td>{Functions.convertTimestamp(p.first, false, false)}</td>
                <td>{Functions.convertTimestamp(p.last, false, false)}</td>
                <td>{p.matches}</td>
                <td>{(p.playtime / (60 * 60)).toFixed(2)} Hours</td>
                
            </tr>);
        }

        if(elems.length === 0){

            
            return <div key={"none"} className="not-found">No Player Data</div>
                
        }else{

            return <table className="t-width-1 td-1-150">
                <tbody>
                    <tr>
                        <th>Name</th>
                        <th>First</th>
                        <th>Last</th>
                        <th>Matches</th>
                        <th>Playtime</th>
                    </tr>
                    {elems}
                </tbody>
            </table>
        }

}


export default MapAddictedPlayers;