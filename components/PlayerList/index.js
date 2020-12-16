import PlayerListBox from '../PlayerListBox/'
import styles from './PlayerList.module.css'

function PlayersList(props){

    const elems = [];

    //console.log(props);

    const players = JSON.parse(props.players);
    //players = JSON.parse(players);

    console.log(players);

    for(let i = 0; i < players.length; i++){

        elems.push(<PlayerListBox key={i} 

            playerId={players[i].id} 
            name={players[i].name} 
            country={players[i].country}
            playtime={players[i].playtime}
            wins={players[i].wins}
            matches={players[i].matches}
         

        />);
    }

    return (
        <div className={styles.box}>
            {elems}
        </div>
    );

}



export default PlayersList;