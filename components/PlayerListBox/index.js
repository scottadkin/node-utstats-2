import styles from './PlayerListBox.module.css'
import Countires from '../../api/countries'
import Link from 'next/link'


export default function PlayerListBox({
    playerId,
    name,
    country,
    playtime,
    wins,
    matches,
    score,
    kills,
    deaths,
    face

}){

    if(playerId === -1){

        return (
            <div className={styles.outter}>
                <div className={styles.inneralt}>
                    <div>
                        &nbsp;
                    </div>
                    <div>
                        Name
                    </div>
                    <div>Score</div>
                    <div>Kills</div>
                    <div>Winrate</div>
                    <div>Matches</div>     
                </div>         
            </div>
        )
    }

    let winRate = Math.floor((wins / (wins + matches)) * 100);
    let efficiency = kills / (kills + deaths);

    playtime = (playtime / (60 * 60)).toFixed(2);

    if(winRate !== winRate){

        if(wins > 0){
            winRate == 100;
        }else{
            winRate = 0;
        }
    }

    if(efficiency !== efficiency){

        if(kills > 0){
            efficiency = 100;
        }else{
            efficiency = 0;
        }
    }

    efficiency = Math.floor(efficiency * 100);

    return (
        <div className={styles.outter}>
            <Link href={`player/${playerId}`}>
                <a>
                    <div className={styles.inner}>
                        <div className={styles.face}>
                            <img src={`images/faces/${face.name}.png`} alt="face"/>
                        </div>
                        <div>
                            <img className="country-flag" src={`images/flags/${Countires(country).code.toLowerCase()}.svg`} alt="flag" /> {name}
                        </div>
                        <div>{score}</div>
                        <div>{kills}</div>
                        <div>{winRate}%</div>
                        <div>{matches}</div>
                        
                      
                        
                    </div>
                </a>
            </Link>
        </div>
    )
}


/**
 *   /*<div>
                            <KeyValue label="Score" value={score} />
                            <KeyValue label="Kills" value={kills} />
                            <KeyValue label="Deaths" value={deaths} />
                            <KeyValue label="Efficiency" value={`${efficiency}%`} />
                        </div>
                        <div>
                            <KeyValue label="Playitme" value={`${playtime} Hours`} />
                            <KeyValue label="Matches" value={matches} />
                            <KeyValue label="Wins" value={wins} />
                            <KeyValue label="WinRate" value={`${winRate}%`} />

                        </div>
 */