import PlayerListBox from '../PlayerListBox/'
import styles from './PlayerList.module.css'

function PlayersList({players, faces, records, displayType}){

    const elems = [];

    players = JSON.parse(players);

    faces = JSON.parse(faces);


    let currentFace = 0;

    displayType = parseInt(displayType);

    console.log(`displayType = ${displayType}`);

    for(let i = 0; i < players.length; i++){

        if(displayType === 1 && i === 0){
            elems.push(<tr>
                <th>Name</th>
                <th>Name</th>
                <th>Name</th>
                <th>Name</th>
                <th>Name</th>
            </tr>);
        }

        currentFace = faces[players[i].face];


        if(!currentFace.imageExists){
            currentFace = {"name": "faceless"};
        }

        if(displayType === 0){
            elems.push(<PlayerListBox key={i} 

                playerId={players[i].id} 
                name={players[i].name} 
                country={players[i].country}
                playtime={players[i].playtime}
                wins={players[i].wins}
                matches={players[i].matches}
                score={players[i].score}
                kills={players[i].kills}
                deaths={players[i].deaths}
                face={currentFace.name}
                first={players[i].first}
                last={players[i].last}
                records={records}
                accuracy={parseInt(players[i].accuracy)}
                displayType={displayType}
            />);
        }else{
            elems.push(<tr>
                <td>rwar</td>
                <td>rwar</td>
                <td>rwar</td>
                <td>rwar</td>
                <td>rwar</td>
            </tr>);
        }
    }

    if(displayType === 0){
        return (
            <div className={styles.box}>
                {elems}
            </div>
        );
    }else{

        return (<div className="special-table">
        <table>
            <tbody>
                {elems}
            </tbody>
        </table>
        </div>);
    }

}



export default PlayersList;