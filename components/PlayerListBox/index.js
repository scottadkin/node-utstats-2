import styles from './PlayerListBox.module.css';
import Countires from '../../api/countries';
import Link from 'next/link';
import TimeStamp from '../TimeStamp/';


const TestBar = ({title, value, max, postFix}) =>{

    value = parseFloat(value);
    max = parseFloat(max);

    let bit = 0;

    if(max !== 0){
        bit = 100 / max;
    }

    if(postFix === undefined){
        postFix = '';
    }

    let percent = bit * value;

    if(percent > 100){
        percent = 100;
    }

    let color = "green";

    color = `rgb(${255 - (percent * 2.25)},255,${255 - (percent * 2.25)})`;

    return (<div className={styles.obar}>
        <div className={styles.title}>
            {title} 
        </div>
        <div className={styles.value}>
            {value}{postFix}
        </div>
        <div className={styles.bar}>
            <div className={styles.bar_inner} style={{"width": `${percent}%`, "backgroundColor": color}}></div>
        </div>
    </div>);
}

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

    records = JSON.parse(records);

    return (
        <div className={styles.outter}>
            <Link href={`player/${playerId}`}>
                <a>
                    <div className={styles.inner}>
                        <div className={styles.info}>
                            <div>
                                <span className={styles.name}>{name}</span><br/>
                                <img className={styles.face} src={`/images/faces/${face}.png`} alt="image"/>
                            </div>
                            <div>
                                <span className="yellow">Location</span> <img className="country-flag" src={`images/flags/${Countires(country).code.toLowerCase()}.svg`} alt="flag" />  {Countires(country).country}<br/>
                                <span className="yellow">Playtime</span> {(parseFloat(playtime) / (60 * 60)).toFixed(2)} Hours<br/>
                                <span className="yellow">First Seen</span> <TimeStamp timestamp={first} /><br/>
                                <span className="yellow">Last Seen</span> <TimeStamp timestamp={last} /><br/>
                            </div>
                        </div>
                     
                        <div className={styles.bars}>
                            <TestBar title={"Matches"} value={matches} max={records.matches}/>
                            <TestBar title={"WinRate"} value={winRate} max={records.winrate} postFix="%"/> 
                            <TestBar title={"Accuracy"} value={accuracy} max={records.accuracy} postFix="%"/> 
                            <TestBar title={"Efficiency"} value={efficiency} max={records.efficiency} postFix="%"/> 
                            <TestBar title={"Score"} value={score} max={records.score}/>
                            <TestBar title={"Kills"} value={kills} max={records.kills}/>
                            <TestBar title={"Deaths"} value={deaths} max={records.deaths}/>
                             
                        </div>             
                    </div>
                </a>
            </Link>
        </div>
    )
}
