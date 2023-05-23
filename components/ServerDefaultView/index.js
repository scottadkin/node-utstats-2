import React from "react";
import styles from "./ServerDefaultView.module.css";
import CountryFlag from "../CountryFlag";
import Functions from "../../api/functions";
import Link from "next/link";

const ServerDefaultView = ({mapImages, mapNames, data}) =>{

    const d = data;

    const getMapImage = (mapName) =>{

        mapName = Functions.cleanMapName(mapName).toLowerCase();

        if(mapImages[mapName] !== undefined){
            return mapImages[mapName];
        }

        return "default";

    }

    const mapName = mapNames[data.last_map_id] ?? "Not Found";
    const mapImage = getMapImage(mapName);

    let password = "";
    let passwordElem = null;

    if(d.password !== ""){
        password = `?password=${d.password}`;

        passwordElem = <span className={styles.password}>?password={d.password}</span>
    }

    return <div className={styles.wrapper}>
            <Link href={`/server/${d.id}`}>
                
                    <div className={`${styles.title} ellipsis`}>
                        <CountryFlag country={d.country}/>
                        {d.name}
                    </div>
                
            </Link>
            <Link href={`/match/${d.last_match_id}`}>
                
                    <div className={styles.last}>
                        <div className={styles.row}>
                            <div>Last Match</div>
                            <div>{mapName}</div>
                        </div>
                        <div className={styles.date}>
                            {Functions.convertTimestamp(d.last, true)}
                        </div>
                    </div>
                
            </Link>
            <div className={styles.image}>
                <img src={`/images/maps/thumbs/${mapImage}.jpg`} alt="image"/>
            </div>
            <div className={styles.info}>
                <div className={styles.row}>
                    <div>Total Matches</div>
                    <div>{d.matches}</div>
                </div>
                <div className={styles.row}>
                    <div>Total Playtime</div>
                    <div>{Functions.toPlaytime(d.playtime)}</div>
                </div>
            </div>
            <Link href={`/matches/?server=${d.id}`}>
                
                    <div className={`${styles.recent} ellipsis`}>
                        View Recent Matches
                    </div>
                
            </Link>
            <a href={`unreal://${d.ip}:${d.port}${password}`}>
                <div className={`${styles.join} purple ellipsis`}>
                    <span className="yellow">Join the server</span> {d.ip}:{d.port}{passwordElem}
                </div>
            </a>
        </div>
}

export default ServerDefaultView;
