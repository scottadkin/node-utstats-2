import {React, useEffect, useState} from "react";
import styles from "./MatchCTFReturnDetailed.module.css";
import Functions from "../../api/functions";
import CountryFlag from "../CountryFlag";
import Link from "next/link";
import PieChart from "../PieChart";

const MatchCTFReturnDetailed = ({data, playerData, smartCTFString, matchId, matchStart}) =>{

    const dropPercent = data.drop_time_percent;
    const carryPercent = data.carry_time_percent;

    const travelParts = [
        {"value": `${data.drop_time.toFixed(2)} Seconds`, "percent": dropPercent, "name": "Time Dropped"},
        {"value": `${data.carry_time.toFixed(2)} Seconds`, "percent": carryPercent, "name": "Carry Time"},
    ];
    
    const createCoverParts = () =>{

        const parts = [];

        const coversByPlayer = {};

        for(let i = 0; i < data.coverData.length; i++){

            const c = data.coverData[i];

            if(coversByPlayer[c.killer_id] === undefined){
                coversByPlayer[c.killer_id] = 0;
            }

            coversByPlayer[c.killer_id]++;
        }

        for(const [key, value] of Object.entries(coversByPlayer)){

            const currentPlayer = Functions.getPlayer(playerData, key);

            parts.push({
                "value": `${value} ${Functions.plural(value, "Cover")}`, 
                "percent": (value / data.total_covers) * 100, 
                "name": currentPlayer.name
            });
        }

        return parts;

    }

    const coverParts = createCoverParts();

    


   

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
        <div>
            <div>Carry Time</div>
            <div>Carry Time</div>
        </div>
        <PieChart titles={["Flag Info", "Covers"]} parts={[travelParts, coverParts]}/>
        
      
    </div>
}


export default MatchCTFReturnDetailed;