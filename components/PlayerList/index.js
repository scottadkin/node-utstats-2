import PlayerListBox from '../PlayerListBox/'
import styles from './PlayerList.module.css'

function PlayersList(props){

    const elems = [];

    console.log(props);

    const players = JSON.parse(props.players);
    //players = JSON.parse(players);

    for(let i = 0; i < players.length; i++){
        elems.push(<PlayerListBox key={i} data={players[i].name}/>);
    }

    return (
        <div className={styles.box}>
            {elems}
        </div>
    );

}



export default PlayersList;