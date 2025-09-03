import React from "react";
import styles from "./Playtime.module.css";
import Functions from "../../api/functions";


export default function Playtime(){

    return <div className={styles.wrapper}>
        {Functions.toPlaytime(this.props.timestamp)}
    </div>
}
