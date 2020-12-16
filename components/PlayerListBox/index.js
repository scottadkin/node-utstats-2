import styles from './PlayerListBox.module.css'
import Countires from '../../api/countries'
import Link from 'next/link'

export default function PlayerListBox({
    playerId,
    name,
    country,
    playtime,
    wins,
    matches
}){

    let winRate = Math.floor((wins / (wins + matches)) * 100);

    if(winRate !== winRate){

        if(wins > 0){
            winRate == 100;
        }else{
            winRate = 0;
        }
    }

    return (
        <div className={styles.outter}>
            <Link href={`players/${playerId}`}>
                <a>
                    <div className={styles.inner}>
                        <div className={styles.flag}>
                            <img className="country-flag" src={`images/flags/${Countires(country).code}.svg`} alt="flag"></img>
                        </div>
                        <div className={styles.name}>
                           {name}
                        </div>
                        <div className={styles.playtime}>
                           {(playtime / (60 * 60)).toFixed(2)} Hours
                        </div>
                        <div className={styles.playtime}>
                           {winRate}%
                        </div>
                        <div className={styles.matches}>
                           {matches}
                        </div>
                        
                    </div>
                </a>
            </Link>
        </div>
    )
}