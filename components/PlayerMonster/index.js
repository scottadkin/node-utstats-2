import React from "react";
import styles from "./PlayerMonster.module.css";
import Image from "next/image";

class PlayerMonster extends React.Component{

    constructor(props){

        super(props);
    }

    render(){

        const kills = this.props.stats.kills ?? 0;
        const deaths = this.props.stats.deaths ?? 0;

        const matches = this.props.stats.matches ?? 0;
        let average = 0;

        if(matches > 0 && kills > 0){

            average = kills / matches;
            average = average.toFixed(2);
        }

        let averageDeaths = 0;

        if(matches > 0 && deaths > 0){

            averageDeaths = (deaths / matches).toFixed(2);
        }

        return <div className={styles.wrapper}>
            <div className={styles.title}>{this.props.name ?? "No name supplied"}</div>
            <div className={styles.split}>
                <div className={styles.image}>
                    <Image src={`/images/monsters/${this.props.monsterClass ?? "default"}.png`} width="130" height="130"/>
                </div>
                <div className={styles.text}>
                    <span className={styles.info}>Seen in {matches} match{(matches !== 1) ? "es" : ""}</span><br/>
                    {kills} Killed<br/>
                    <span className={styles.info}>{average} kills per match</span><br/>
                    {this.props.stats.deaths} Deaths<br/>
                    {averageDeaths} Deaths per match

                </div>
            </div>
        </div>
    }
}

export default PlayerMonster;