import styles from './PlayerGeneral.module.css';
import Functions from '../../api/functions';
import BasicUIBox from '../BasicUIBox';


const PlayerGeneral = ({host,flag, country, face, first, last, matches, playtime, wins, losses, winRate}) =>{

    if(flag === "") flag = "xx";

    return <div className={styles.wrapper}>
        <BasicUIBox title={"From"} value={country} image={`/images/flags/${flag}.svg`} />
        <BasicUIBox title={"Recent Face"} value={""} image={`/images/faces/${face}.png`} />
        <BasicUIBox title={"First Seen"} value={Functions.convertTimestamp(first, true)} image={`/images/visual.png`} />
        <BasicUIBox title={"Last Seen"} value={Functions.convertTimestamp(last, true)} image={`/images/visual.png`} />
        <BasicUIBox title={"Playtime"} value={`${(playtime / (60 * 60)).toFixed(2)} Hours`} image={"/images/clock.png"} /><br/>
        <BasicUIBox title={"Matches"} value={matches} image={"/images/matches.png"} />
        <BasicUIBox title={"Wins"} value={wins} image={"/images/checked.png"} />
        <BasicUIBox title={"Losses"} value={losses} image={"/images/cancel.png"} />
        <BasicUIBox title={"Win Rate"} value={`${winRate.toFixed(2)}%`} image={"/images/bar-chart.png"} />
    </div>
}


export default PlayerGeneral;