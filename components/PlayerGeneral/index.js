import styles from './PlayerGeneral.module.css';
import Functions from '../../api/functions';
import Image from 'next/image';
import BasicUIBox from '../BasicUIBox';



const PlayerGeneral = ({host,flag, country, face, first, last, matches, playtime, wins, losses, winRate}) =>{

    return <div className={styles.wrapper}>
        <BasicUIBox title={"From"} value={country} image={`/images/flags/${flag}.svg`} />
        <BasicUIBox title={"Recent Face"} value={""} image={`/images/faces/${face}.png`} />
        <BasicUIBox title={"First Seen"} value={Functions.convertTimestamp(first, true)} image={`/images/visual.png`} />
        <BasicUIBox title={"Last Seen"} value={Functions.convertTimestamp(last, true)} image={`/images/visual.png`} />
        <BasicUIBox title={"Playtime"} value={`${(playtime / (60 * 60)).toFixed(2)} Hours`} image={"/images/clock.png"} />
        <BasicUIBox title={"Matches"} value={matches} image={"/images/matches.png"} />
        <BasicUIBox title={"Wins"} value={wins} image={"/images/checked.png"} />
        <BasicUIBox title={"Losses"} value={losses} image={"/images/cancel.png"} />
        <BasicUIBox title={"Win Rate"} value={`${winRate.toFixed(2)}%`} image={"/images/bar-chart.png"} />
    </div>

    /*
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

            {wins} <span className="yellow">wins</span> out of {matches} <span className="yellow">matches</span> 
            <PotatoBar wins={wins} losses={losses} matches={matches} winRate={winRate}/>
          
        </div>
        
    </div>*/
}


export default PlayerGeneral;