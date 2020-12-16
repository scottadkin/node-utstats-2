import PlayerListBox from '../PlayerListBox/'
import styles from './PlayerList.module.css'

function PlayersList(props){

    const elems = [];

    //const faces = new Faces();


    //console.log(props);

    const players = JSON.parse(props.players);
    console.log(props);
    const faces = JSON.parse(props.faces);
    console.log(faces);
    //players = JSON.parse(players);


    for(let i = 0; i < players.length; i++){

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
         

        />);
    }

    return (
        <div className={styles.box}>
            <PlayerListBox playerId={-1 }/>
            {elems}
        </div>
    );

}



export default PlayersList;