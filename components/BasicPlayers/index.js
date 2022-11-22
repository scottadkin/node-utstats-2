import Link from 'next/link';
import CountryFlag from '../CountryFlag';
import styles from './AddictedPlayers.module.css';
import Functions from '../../api/functions';
import Image from 'next/image';
import Playtime from '../Playtime';

const BasicPlayers = ({title, players, faceFiles, host}) =>{

    players = JSON.parse(players);
    faceFiles = JSON.parse(faceFiles);

    const elems = [];

    let p = 0;

    let currentFace = 0;

    for(let i = 0; i < players.length; i++){

        p = players[i];

        currentFace = faceFiles[p.face];

        if(currentFace === undefined) currentFace = {"name": "faceless" };

        elems.push(<Link key={i} href={`/player/${p.id}`}><a>
            <div className={`${styles.player} center`}>
                <div className={styles.name}><CountryFlag country={p.country} host={host}/> {p.name}</div>
                <Image className={`${styles.face} center`} width={64} height={64} src={`/images/faces/${currentFace.name}.png`} alt="face"/>
                <div className={styles.info}>
                    Last Match {Functions.convertTimestamp(p.last, true)}<br/>
                    First Match {Functions.convertTimestamp(p.first, true)}<br/>
                    Playtime <Playtime timestamp={p.playtime}/><br/>
                    {p.matches} Matches
                </div>
            </div>
            </a>
        </Link>);
    }

    return <div className={`${styles.wrapper} m-bottom-10`}>
        <div className="default-header">{title}</div>

        {elems}
    </div>
}

export default BasicPlayers;