import React from "react";
import styles from "./ServerDefaultView.module.css";
import CountryFlag from "../CountryFlag";
import Functions from "../../api/functions";
import Link from "next/link";

class ServerDefaultView extends React.Component{

    constructor(props){

        super(props);
    }

    getMapImage(mapName){


        const cleanMapName = Functions.cleanMapName(mapName);

        const index = this.props.mapImages.indexOf(cleanMapName.toLowerCase());
        
        if(index === -1) return "default";

        return this.props.mapImages[index];
    }

    render(){

        const d = this.props.data;

        const mapName = this.props.mapNames[this.props.data.last_map_id] ?? "Not Found";

        const mapImage = this.getMapImage(mapName);

        let password = "";
        let passwordElem = null;

        if(d.password !== ""){
            password = `?password=${d.password}`;

            passwordElem = <span className={styles.password}>?password={d.password}</span>
        }


        return <div className={styles.wrapper}>
            <div className={`${styles.title} ellipsis`}>
                <CountryFlag country={d.country}/>
                {d.name}
            </div>
            <Link href={`/match/${d.last_match_id}`}>
                <a>
                    <div className={styles.last}>
                        <div className={styles.row}>
                            <div>Last Match</div>
                            <div>{mapName}</div>
                        </div>
                        <div className={styles.date}>
                            {Functions.convertTimestamp(d.last, true)}
                        </div>
                    </div>
                </a>
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
                <a>
                    <div className={`${styles.recent} ellipsis`}>
                        View Recent Matches
                    </div>
                </a>
            </Link>
            <a href={`unreal://${d.ip}:${d.port}${password}`}>
                <div className={`${styles.join} purple ellipsis`}>
                    <span className="yellow">Join the server</span> {d.ip}:{d.port}{passwordElem}
                </div>
            </a>
        </div>
    }
}

export default ServerDefaultView;