import React from "react";
import styles from "./Playtime.module.css";
import Functions from "../../api/functions";

class Playtime extends React.Component{

    constructor(props){

        super(props);
    }


    render(){

        return <div className={styles.wrapper}>{Functions.toPlaytime(this.props.timestamp)}</div>
    }
}

export default Playtime;