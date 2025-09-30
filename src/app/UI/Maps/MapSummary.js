
"use client"
import styles from './MapSummary.module.css';
import { toPlaytime, convertTimestamp } from '../../../../api/generic.mjs';
import {BasicTable} from "../Tables/";

export default function MapSummary({data, spawns}){

    const totalSpawns = spawns.length;

    return <div className={`${styles.wrapper}`}>
        <div className={`${styles.image} t-width-2 center`}>
            <img id="main-image" src={`/images/maps/${data.image}.jpg`} alt="Map image" style={{"width": "100%"}} onClick={(() =>{
            const elem = document.getElementById("main-image");
            elem.requestFullscreen();
        })}/>
        </div>
        <BasicTable width={2} rows={[
            ["Title", data.title],
            ["Author", data.author],
            ["Level Enter Text", data.level_enter_text],
            ["Ideal Player Count", data.ideal_player_count],
            ["First Match", convertTimestamp(data.first)],
            ["Latest Match", convertTimestamp(data.last)],
            ["Total Matches", data.matches],
            ["Playtime", toPlaytime(data.playtime)],
            ["Total Spawns", totalSpawns]
        ]}/> 
    </div>
}