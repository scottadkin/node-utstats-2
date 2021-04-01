import styles from './PlayerGeneral.module.css';
import Timestamp from '../TimeStamp/';

const PlayerGeneral = ({flag, country, face, first, last, matches, playtime, wins, losses, winRate}) =>{


    /*let hours = data[2] / (60 * 60);

    if(hours !== hours) hours = 0;

    let winRate = data[4] / data[3];

    if(winRate !== winRate) winRate = 0;*/

    console.log(flag);

    return <div className={styles.wrapper}>
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

    /*return (
        <div className={`${styles.table} special-table`}>
                <div className="default-header">
                    General Stats
                </div>       
                <table>
                    <tbody>
                        <tr>
                            <th>Country</th>   
                            <th>Playtime</th>   
                            <th>Matches</th>   
                            <th>Wins</th>   
                            <th>Draws</th>   
                            <th>Losses</th>   
                            <th>WinRate</th>   
                        </tr>
                        <tr>
                            <td><img className="country-flag" src={`../images/flags/${data[1]}.svg`} alt="image"/> {data[0]}</td> 
                            <td>{hours.toFixed(2)} Hours</td> 
                            <td>{data[3]}</td> 
                            <td>{data[4]}</td> 
                            <td>{data[5]}</td> 
                            <td>{data[6]}</td> 
                            <td>{(winRate * 100).toFixed(2)}%</td> 
                        </tr>
                    </tbody>
                </table>
                
            </div>
    );*/
}


export default PlayerGeneral;