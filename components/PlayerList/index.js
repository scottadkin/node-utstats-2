import PlayerListBox from '../PlayerListBox/'
import styles from './PlayerList.module.css'

function PlayersList({players, faces}){

    const elems = [];

    players = JSON.parse(players);

    faces = JSON.parse(faces);


    let currentFace = 0;

    for(let i = 0; i < players.length; i++){


        currentFace = faces[players[i].face];

        if(currentFace === null){
            currentFace = {"name": "faceless"};
        }

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
            face={currentFace}
         

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