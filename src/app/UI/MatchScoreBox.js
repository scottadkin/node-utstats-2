import styles from "./MatchScoreBox.module.css";
import { getTeamColorClass, getTeamIcon } from "../lib/generic";
import Image from "next/image";

export default function MatchScoreBox({data}){

    console.log(data);

    let wrapperClassName = styles.solo;
    
    if(data.total_teams === 2) wrapperClassName = styles.duo;
    if(data.total_teams === 3) wrapperClassName = styles.trio;
    if(data.total_teams === 4) wrapperClassName = styles.quad;

    const scoreElems = [];

    if(data.dmWinner == null){

        for(let i = 0; i < data.total_teams; i++){

            scoreElems.push(<div key={i} className={getTeamColorClass(i)}>
                <Image src={`/images/${getTeamIcon(i)}`} alt="image" width={32} height={32} priority={true}/><br/>
                <div className={styles.score}>{data[`team_score_${i}`]}</div>
            </div>);
        }
    }else{

        scoreElems.push(<div key="-1">
            <Image src={`/images/${getTeamIcon(255)}`} alt="image" width={32} height={32} priority={true}/><br/>
            {data.dmWinner.name} Wins with {data.dm_score}
        </div>);
    }

    return <div className={`${styles.wrapper} ${wrapperClassName}`}>
        {scoreElems}
    </div>
}