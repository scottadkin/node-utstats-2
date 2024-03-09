"use client"
import Link from "next/link";
import styles from "./MatchBox.module.css";
import Image from "next/image";
import MatchScoreBox from "./MatchScoreBox";

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
            <img src={`/images/maps/thumbs/${data.mapImage}.jpg`} alt="image" />
            <div className={styles.info}>
                Players 23<br/>
                Date 1st January 1900
            </div>
            <MatchScoreBox data={data}/>
        </div>
    </Link>
}