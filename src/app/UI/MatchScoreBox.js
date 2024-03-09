import styles from "./MatchScoreBox.module.css";
import { getTeamColorClass } from "../api/generic";

export default function MatchScoreBox({data}){

    console.log(data);

    let wrapperClassName = styles.solo;
    
    if(data.total_teams === 2) wrapperClassName = styles.duo;
    if(data.total_teams === 3) wrapperClassName = styles.trio;
    if(data.total_teams === 4) wrapperClassName = styles.quad;

    const scoreElems = [];

    for(let i = 0; i < data.total_teams; i++){

        scoreElems.push(<div key={i} className={getTeamColorClass(i)}>
            {data[`team_score_${i}`]}
        </div>);
    }

    return <div className={`${styles.wrapper} ${wrapperClassName}`}>
        {scoreElems}
    </div>
}