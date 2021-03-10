import styles from './PlayerListBox.module.css';
import Countries from '../../api/countries';
import Link from 'next/link';
import TimeStamp from '../TimeStamp/';



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
    face,
    first,
    last,
    records,
    accuracy

}){



    const countryData = Countries(country);

    let efficiency = 0;

    if(kills > 0 && deaths === 0){
        efficiency = 1;
    }else if(deaths !== 0 && kills !== 0){
        efficiency = kills / (kills + deaths);
    }

    efficiency = (efficiency * 100).toFixed(2);
    
    return (
        <Link href={`player/${playerId}`}>
            <a>
                <div className={styles.outter}>
                    
                        
                    <div className={styles.name}>{name}</div>
                    <img className={styles.face} src={`/images/faces/${face}.png`} alt="face"/>
                    <div className={styles.country}>{countryData.country}<br/><img src={`/images/flags/${country}.svg`} alt="flag"/></div>
                    
                    <table>
                        <tbody>
                            <tr>
                                <td>First</td>
                                <td><TimeStamp timestamp={first} noDayName={true} noTime={true}/></td>
                            </tr>
                            <tr>
                                <td>Last</td>
                                <td><TimeStamp timestamp={last} noDayName={true} noTime={true}/></td>
                            </tr>
                            <tr>
                                <td>Matches</td>
                                <td>{matches}</td>
                            </tr>
                            <tr>
                                <td>Wins</td>
                                <td>{wins}</td>
                            </tr>
                            <tr>
                                <td>Score</td>
                                <td>{score}</td>
                            </tr>
                            <tr>
                                <td>Kills</td>
                                <td>{kills}</td>
                            </tr>
                            <tr>
                                <td>Deaths</td>
                                <td>{deaths}</td>
                            </tr>
                            <tr>
                                <td>Efficiency</td>
                                <td>{efficiency}%</td>
                            </tr>
                            <tr>
                                <td>Accuracy</td>
                                <td>{accuracy}%</td>
                            </tr>


                        </tbody>
                    </table>
                
                </div>
            </a>
        </Link>
    )
}
