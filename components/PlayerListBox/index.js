import styles from './PlayerListBox.module.css';
import Countries from '../../api/countries';
import Link from 'next/link';
import TimeStamp from '../TimeStamp/';



const RecordBar = ({name, value, percent}) =>{

    return <div className={styles.bwrapper}>
            <div>{name}</div>
            <div>{value}</div>
            <div className={styles.bar}>
                <div className={styles.ibar} style={{"width": `${percent}%`}}></div>
            </div>
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
    recordsPercent,
    host

}){

    const countryData = Countries(country);

    let efficiency = 0;

    if(kills > 0 && deaths === 0){
        efficiency = 1;
    }else if(deaths !== 0 && kills !== 0){
        efficiency = kills / (kills + deaths);
    }

    efficiency = (efficiency * 100).toFixed(2);

    if(playtime > 0){
        playtime = (playtime / (60 * 60)).toFixed(2);
    }
   
    return <Link href={`/player/${playerId}`}>
        <a>
            <div className={`${styles.wrapper} center`}>
                <div className={styles.name}> 
                    <img src={`${host}images/flags/${countryData.code.toLowerCase()}.svg`} alt="flag"/> 
                    {name}
                    <span className={styles.countryName}>{countryData.country}</span>
                    <span className={styles.playtime}>{playtime} Hours</span>
                </div>
                <div className={styles.face}>
                    <img src={`${host}images/faces/${face}.png`} alt="face"/>
                </div>
                <div className={styles.right}>
                    <div className={styles.info}>
                        Played {matches} Matches<br/>
                        Last Seen <TimeStamp timestamp={last} noDayName={true}/><br/>
                    </div>
                    <div className={styles.bars}>
                        
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
    
}


export default PlayerListBox;