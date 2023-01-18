import {React, useEffect, useState} from "react";
import styles from "./MatchCTFReturnDetailed.module.css";
import Functions from "../../api/functions";
import CountryFlag from "../CountryFlag";
import Link from "next/link";
import PieChart from "../PieChart";

const MatchCTFReturnDetailed = ({data, playerData, smartCTFString, matchId, matchStart}) =>{

    const [pieParts, setPieParts] = useState([]);

    useEffect(() =>{

        const dropPercent = data.drop_time_percent;
        const carryPercent = data.carry_time_percent;

        const parts = [
            {"value": dropPercent, "name": "Drop Percent"},
            {"value": carryPercent, "name": "Carry Percent"},
        ];



        setPieParts(parts);

        console.log("someting chagned");
    }, [data.id]);


   

    const returnPlayer = Functions.getPlayer(playerData, data.return_player);

    return <div className={styles.wrapper}>
        <div className={`${styles.returned} ${Functions.getTeamColor(data.flag_team)}`}>
                {Functions.getTeamName(data.flag_team, true)} Flag Returned By&nbsp; 
                <Link href={`/pmatch/${matchId}/?player=${data.return_player}`}>
                    <a>
                        <CountryFlag country={returnPlayer.country}/>{returnPlayer.name}
                    </a>
                </Link>
        </div>
        <div className={styles.distance}>
            Distance to being capped<br/>
            <b>{data.distance_to_cap.toFixed(2)}</b> <span className="yellow">({smartCTFString})</span>
        </div>
        
        <div className={styles.times}>
            <div className={styles.row}>
                <div className={styles.label}>Flag Taken</div>
                <div className={styles.value}>{Functions.MMSS(data.grab_time - matchStart)}</div>
            </div>
            <div className={styles.row}>
                <div className={styles.label}>Flag Returned</div>
                <div className={styles.value}>{Functions.MMSS(data.return_time - matchStart)}</div>
            </div>
        </div>

        <PieChart parts={pieParts}/>
      
    </div>
}


export default MatchCTFReturnDetailed;