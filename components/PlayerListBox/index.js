import styles from './PlayerListBox.module.css';
import Countries from '../../api/countries';
import Link from 'next/link';
import TimeStamp from '../TimeStamp/';
import CountryFlag from '../CountryFlag';



const RecordBar = ({name, value, percent}) =>{

    return <div className={styles.bwrapper}>
        <div className={styles.lb}>
            <div className={styles.bname}>{name}</div>
            <div className={styles.bar}>
                <div className={styles.barinner} style={{"width": `${percent}%`}}></div>
            </div>
        </div>
        <div className={styles.bvalue}>{value}</div>
    </div>
}


function PlayerListBox({
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
    accuracy,
    recordsPercent

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
                <div className={styles.wrapper}>
                    <div className={styles.inner}>
                        <div className={styles.left}>
                            <img className={styles.face} src={`/images/faces/${face}.png`} alt="face"/>
                            <div className={styles.country}>
                                <CountryFlag country={countryData.country}/><br/>
                                {countryData.country}
                            </div>
                        </div>
                        <div className={styles.right}>
                            <div className={styles.name}>{name}</div>
                            <div className={styles.last}>Last <TimeStamp timestamp={last} noDayName={true} noTime={true}/></div>
                            <RecordBar name={"Matches"} value={matches} percent={recordsPercent.matches}/>
                            <RecordBar name={"Wins"} value={wins} percent={recordsPercent.wins}/>
                            <RecordBar name={"Score"} value={score} percent={recordsPercent.score}/>
                            <RecordBar name={"Kills"} value={kills} percent={recordsPercent.kills}/>
                            <RecordBar name={"Deaths"} value={deaths} percent={recordsPercent.deaths}/>
                            <RecordBar name={"Efficiency"} value={`${efficiency}%`} percent={recordsPercent.efficiency}/>
                            <RecordBar name={"Accuracy"} value={`${accuracy}%`} percent={recordsPercent.accuracy}/>
                        </div>
                    </div>
                </div>
            </a>
        </Link>
    )
}


export default PlayerListBox;