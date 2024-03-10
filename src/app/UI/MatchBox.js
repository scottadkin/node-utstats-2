"use client"
import Link from "next/link";
import styles from "./MatchBox.module.css";
import Image from "next/image";
import MatchScoreBox from "./MatchScoreBox";
import { convertTimestamp, toPlaytime } from "../../../api/generic.mjs";

export default function MatchBox({data}){

    return <Link href={`/match/${data.id}`}>
        <div className={styles.wrapper}>
            <div className={styles.map}>
                {data.mapName}
            </div>      
            <div className={styles.gametype}>
                {data.gametypeName}
            </div>  
            <div className={styles.server}>
                {data.serverName}
            </div>  
            <Image src={`/images/maps/thumbs/${data.mapImage}.jpg`} alt="image" width={360} height={202} />
            <div className={styles.info}>
                {data.players} Player{(data.players !== 1) ? "s" : ""}<br/>
                {toPlaytime(data.playtime)}<br/>
                {convertTimestamp(data.date, true)}
            </div>
            <MatchScoreBox data={data}/>
        </div>
    </Link>
}