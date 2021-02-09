import styles from './PlayerListBox.module.css'
import Countires from '../../api/countries'
import Link from 'next/link'


const TestBar = ({title, value, max, postFix}) =>{

    value = parseFloat(value);
    max = parseFloat(max);

    console.log(value,max);

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

    return (<div className={styles.obar}>
        <div className={styles.title}>
            {title} 
        </div>
        <div className={styles.value}>
            {value}{postFix}
        </div>
        <div className={styles.bar}>
            <div className={styles.bar_inner} style={{"width": `${percent}%`}}></div>
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
    last

}){

    if(playerId === -1){
        return (<div></div>);
        return (
            <div className={styles.outter}>
                <div className={styles.inneralt}>

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
                        <div className={styles.info}>
                            <div>
                                <img className="country-flag" src={`images/flags/${Countires(country).code.toLowerCase()}.svg`} alt="flag" /> {name}<br/>
                                <img src={`/images/faces/faceless.png`} alt="image"/>
                            </div>
                            <div>
                                Location {Countires(country).country}<br/>
                                First Seen {first}<br/>
                                Last Seen {last}<br/>
                            </div>
                        </div>
                     
                        <div className={styles.bars}>
                            <TestBar title={"Matches"} value={matches} max={500}/>
                            <TestBar title={"WinRate"} value={winRate} max={100} postFix="%"/> 
                            <TestBar title={"Efficiency"} value={efficiency} max={100} postFix="%"/> 
                            <TestBar title={"Score"} value={score} max={20000}/>
                            <TestBar title={"Kills"} value={kills} max={20000}/>
                            <TestBar title={"Deaths"} value={deaths} max={20000}/>
                             
                        </div>             
                    </div>
                </a>
            </Link>
        </div>
    )
}
