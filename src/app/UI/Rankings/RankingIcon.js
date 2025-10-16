import MouseOver from "../MouseOver";
import styles from "./RankingIcon.module.css";

export default function RankingIcon({change}){

    change = parseFloat(change);

    let icon = "nochange";
    let displayString = "There were no changes to ranking score.";

    if(change < 0){
        icon = "down";
        displayString = `The player lost ${change.toFixed(2)} points.`;
    }

    if(change > 0){
        icon = "up";
        displayString = `The player gained ${change.toFixed(2)} points.`;
    }

    return <div className={styles.wrapper}>
        <MouseOver title="Ranking Change" display={displayString}>
            <img src={`/images/${icon}.png`} alt="icon" className="ranking-icon"/>
        </MouseOver>
    </div>
}
