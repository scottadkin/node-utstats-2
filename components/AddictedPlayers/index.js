import Link from 'next/link';
import CountryFlag from '../CountryFlag/';
import styles from './AddictedPlayers.module.css';
import TimeStamp from '../TimeStamp/';

const AddictedPlayers = ({players, faceFiles}) =>{

    players = JSON.parse(players);
    faceFiles = JSON.parse(faceFiles);

    const elems = [];

    let p = 0;

    let currentFace = 0;

    for(let i = 0; i < players.length; i++){

        p = players[i];

        currentFace = faceFiles[p.face];

        if(currentFace === undefined) currentFace = {"name": "faceless" };

        elems.push(<Link href={`/player/${p.id}`}><a>
            <div className={`${styles.player} center`}>
                <div className={styles.name}><CountryFlag country={p.country}/>{p.name}</div>
                <img className={`${styles.face} center`} src={`/images/faces/${currentFace.name}.png`} alt="face"/>
                <div className={styles.info}>
                    <span className="yellow">Last</span> <TimeStamp timestamp={p.last} noDayName={true}/><br/>
                    <span className="yellow">First</span> <TimeStamp timestamp={p.first} noDayName={true}/><br/>
                    {(p.playtime / (60 * 60)).toFixed(2)} <span className="yellow">Hours</span><br/>
                    {p.matches} <span className="yellow">Matches</span>
                </div>
            </div>
            </a>
        </Link>);
    }

    return <div className={styles.wrapper}>
        <div className="default-header">Addicted Players</div>

        {elems}
    </div>
}

export default AddictedPlayers;