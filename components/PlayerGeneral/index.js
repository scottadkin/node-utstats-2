import styles from './PlayerGeneral.module.css';
import Functions from '../../api/functions';

const PlayerGeneral = ({host,flag, country, face, first, last, matches, playtime, wins, losses, winRate}) =>{


    return <div className={`${styles.wrapper} m-bottom-10`}>
        <div className={styles.left}>
            <div className={styles.face}>
                <img src={`${host}images/faces/${face}.png`} alt="image"/>
            </div>
            <div className={styles.flag}>
                <img src={`${host}/images/flags/${flag}.svg`} alt="image"/>
            </div>    
        </div>
        <div className={styles.right}>

            From <span className="yellow">{country}</span><br/>
            First Seen <span className="yellow">{Functions.convertTimestamp(first)}</span><br/>
            Last Seen <span className="yellow">{Functions.convertTimestamp(last)}</span><br/>
            Total Playtime <span className="yellow">{(playtime / (60 * 60)).toFixed(2)} Hours</span><br/>
            Total Matches <span className="yellow">{matches}</span><br/>
            Total Wins <span className="yellow">{wins}</span><br/>
            Win Rate <span className="yellow">{(winRate).toFixed(2)}%</span><br/>
          
        </div>
        
    </div>
}


export default PlayerGeneral;