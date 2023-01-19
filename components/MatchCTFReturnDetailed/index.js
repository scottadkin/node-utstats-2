import {React, useEffect, useState} from "react";
import styles from "./MatchCTFReturnDetailed.module.css";
import Functions from "../../api/functions";
import CountryFlag from "../CountryFlag";
import Link from "next/link";
import PieChart from "../PieChart";

const MatchCTFReturnDetailed = ({data, playerData, smartCTFString, matchId, matchStart}) =>{

    const dropPercent = data.drop_time_percent;
    const carryPercent = data.carry_time_percent;

    console.log(data);

    const travelParts = [
        {"value": `${data.drop_time.toFixed(2)} Seconds`, "percent": dropPercent, "name": "Time Dropped"},
        {"value": `${data.carry_time.toFixed(2)} Seconds`, "percent": carryPercent, "name": "Carry Time"},
    ];

    const convertToParts = (data, maxValue, valueString) =>{

        const parts = [];

        for(const [key, value] of Object.entries(data)){

            const currentPlayer = Functions.getPlayer(playerData, key);

            let percent = 0;

            if(value > 0 && maxValue > 0){
                percent = (value / maxValue);
            }

            parts.push({
                "value": `${value} ${Functions.plural(value, valueString)}`, 
                "percent": percent * 100, 
                "name": currentPlayer.name
            });
        }


        parts.sort((a, b) =>{

            a = a.name.toLowerCase();
            b = b.name.toLowerCase();

            if(a < b) return -1;
            if(a > b) return 1;
            return 0;
        });

        return parts;
    }
    
    const createCoverParts = (bSelfCovers) =>{


        const coversByPlayer = {};

        const coverData = (bSelfCovers) ? data.selfCoverData : data.coverData;
        const totalCovers = (bSelfCovers) ? data.total_self_covers : data.total_covers;

        for(let i = 0; i < coverData.length; i++){

            const c = coverData[i];

            if(coversByPlayer[c.killer_id] === undefined){
                coversByPlayer[c.killer_id] = 0;
            }

            coversByPlayer[c.killer_id]++;
        }

        const valueString = (bSelfCovers) ? "Self Cover" : "Cover";

        return convertToParts(coversByPlayer, totalCovers, valueString);
    }

    const createFlagKillParts = () =>{

        const players = {};

        for(let i = 0; i < data.deathsData.length; i++){

            const d = data.deathsData[i];

            //don't count suicide as flag kill
            if(d.victim_id !== -1){

                if(players[d.killer_id] === undefined){
                    players[d.killer_id] = 0;
                }

                players[d.killer_id]++;
            }
        }

        console.log();

        return convertToParts(players, data.total_deaths - data.total_suicides, "Flag Kill");
    }

    const coverParts = createCoverParts(false);
    const selfCoverParts = createCoverParts(true);
    const flagKillParts = createFlagKillParts();

    


   

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
        <PieChart 
        titles={["Flag Info", "Covers", "Self Covers", "Flag Kills", "Flfsfsag Kills"]} 
        parts={[travelParts, coverParts, selfCoverParts, flagKillParts, flagKillParts]}/>
        
      
    </div>
}


export default MatchCTFReturnDetailed;