import MMSS from '../MMSS/';
import CountryFlag from '../CountryFlag/';

const getPlayer = (players, id) =>{

    for(let i = 0; i < players.length; i++){

        if(players[i].id === id){
            return players[i];
        }
    }

    return {"name": "not found", "country": "xx"}
}

const ConnectionSummary = ({data, playerNames}) =>{

    playerNames = JSON.parse(playerNames);
    data = JSON.parse(data);

    //console.log(data);

    console.log(playerNames);

    const elems = [];
    let currentPlayer = 0;

    for(let i = 0; i < data.length; i++){

        currentPlayer = getPlayer(playerNames, data[i].player);

        elems.push(<tr>
            <td><MMSS timestamp={data[i].timestamp}/></td>
            <td><CountryFlag country={currentPlayer.country}/>{currentPlayer.name}</td>
            <td>{(!data[i].event) ? "Connected" : "Disconnected"}</td>
        </tr>);
    }

    return (
        <div className="special-table">
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