import Link from 'next/link';
import CountryFlag from '../CountryFlag/';
import styles from './MapAddictedPlayer.module.css';
import Functions from '../../api/functions';

const MapAddictedPlayer = ({name, playerId, matches, playtime, country, longest, longestId, face}) =>{


    return <div className={styles.wrapper}>
        <div className={styles.face}>
            <img src={`/images/faces/${face}.png`} alt="image" />
        </div>
        <div>
            <div className={styles.name}>
                <CountryFlag country={country} /><Link href={`/player/${playerId}`}><a>{name}</a></Link>
            </div>
            <div className={styles.kv}>
                <div>Matches</div>
                <div>{matches}</div>
            </div>
            <div className={styles.kv}>
                <div>Playtime</div>
                <div>{(playtime / (60 * 60)).toFixed(2)} Hours</div>
            </div>
            <Link href={`/match/${longestId}`}><a>
                <div className={styles.kv}>
                    <div>Longest Match</div>
                    <div>{Functions.MMSS(longest)}</div>
                </div>
            </a></Link>
        </div>
    </div>

}


export default MapAddictedPlayer;