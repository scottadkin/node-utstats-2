import styles from './PlayerGeneral.module.css';
import Timestamp from '../TimeStamp/';

const PlayerGeneral = ({flag, country, face, first, last, matches, playtime, wins, losses, winRate}) =>{


    return <div className={`${styles.wrapper} m-bottom-10`}>
        <div className={styles.left}>
            <div className={styles.face}>
                <img src={`/images/faces/${face}.png`} alt="image"/>
            </div>
            <div className={styles.country}>
                {country}
            </div>
            <div className={styles.flag}>
                <img src={`/images/flags/${flag}.svg`} alt="image"/>
            </div>
            
        </div>
        <div className={styles.right}>

            <table className={styles.table}>
                <tbody>
                    <tr>
                        <td>First Seen</td>
                        <td><Timestamp timestamp={first} noDayName={true} noTime={true}/></td>
                    </tr>
                    <tr>
                        <td>Last Seen</td>
                        <td><Timestamp timestamp={last} noDayName={true} noTime={true}/></td>
                    </tr>
                    <tr>
                        <td>Playtime</td>
                        <td>{(playtime / (60 * 60)).toFixed(2)} Hours</td>
                    </tr>
                    <tr>
                        <td>Matches</td>
                        <td>{matches}</td>
                    </tr>
                    <tr>
                        <td>Win Rate</td>
                        <td>{winRate.toFixed(2)}%</td>
                    </tr>
                    <tr>
                        <td>Wins</td>
                        <td>{wins}</td>
                    </tr>
                    <tr>
                        <td>Losses</td>
                        <td>{losses}</td>
                    </tr>
                    
                </tbody>
            </table>
        </div>
        
    </div>
}


export default PlayerGeneral;