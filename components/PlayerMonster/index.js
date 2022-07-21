import React from "react";
import styles from "./PlayerMonster.module.css";
import Image from "next/image";

class PlayerMonster extends React.Component{

    constructor(props){

        super(props);
    }

    render(){

        const kills = this.props.stats.kills ?? 0;

        const matches = this.props.stats.matches ?? 0;
        let average = 0;

        if(matches > 0 && kills > 0){

            average = kills / matches;
            average = average.toFixed(2);
        }

        return <div className={styles.wrapper}>
            <div className={styles.title}>{this.props.name ?? "No name supplied"}</div>
            <div className={styles.image}>
                <Image src={`/images/monsters/${this.props.monsterClass ?? "default"}.png`} width="150" height="150"/>
            </div>
            <div className={styles.killed}>
                {kills} Killed<br/>
                <span className={styles.info}>Seen in {matches} match{(matches !== 1) ? "es" : ""}</span><br/>
                <span className={styles.info}>{average} per match</span>
            </div>
        </div>
    }
}

export default PlayerMonster;