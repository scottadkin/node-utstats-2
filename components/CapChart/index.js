import React from "react";
import styles from "./CapChart.module.css";
import Functions from "../../api/functions";

class CapChart extends React.Component{

    constructor(props){

        super(props);
    }

    /*
    <div className={`${styles["inner-bar"]} ${styles.carry}`} style={{"width": "33%"}}></div>
                <div className={`${styles["inner-bar"]} ${styles.dropped}`} style={{"width": "20%"}}></div>
                <div className={`${styles["inner-bar"]} ${styles.carry}`} style={{"width": "47%"}}></div>
    */

    render(){

        console.log(this.props);

        const capTeamName = `${Functions.getTeamName(this.props.capInfo.cap_team)}`;
        const cappedFlagName = Functions.getTeamColorName(this.props.capInfo.flag_team);

        const totalCarryTime = this.props.capInfo.carry_time;

        const barParts = [];

        let lastDropTime = null;

        for(let i = 0; i < this.props.assists.length; i++){

            const assist = this.props.assists[i];

            if(lastDropTime !== null){

                const timeDropped = assist.pickup_time - lastDropTime;

                let dropPercent = 0;

                if(timeDropped > 0){
                    if(totalCarryTime > 0){
                        dropPercent = (timeDropped / assist.carry_time) * 100;
                    }
                }

                barParts.push(<div key={`${i}-dropped`} className={`${styles["inner-bar"]} ${styles.dropped}`} style={{"width": `${dropPercent}%`}}></div>);
                console.log(`flag was dropped fro ${timeDropped}`);
            }

            let carryPercent = 0;

            if(assist.carry_time > 0){

                if(totalCarryTime > 0){
                    carryPercent = (assist.carry_time / totalCarryTime) * 100;
                }
            }

            barParts.push(<div key={i} className={`${styles["inner-bar"]} ${styles.carry}`} style={{"width": `${carryPercent}%`}}></div>);

            lastDropTime = assist.dropped_time;
        }


        if(barParts.length === 0){
            barParts.push(<div key="0" className={`${styles["inner-bar"]} ${styles.solo}`} style={{"width": `100%`}}></div>);
        }

        return <div className={`${styles.wrapper} center`}>
            <div className={styles.title}>The {capTeamName} Capped the {cappedFlagName} Flag</div>

            <div className={styles["bar-wrapper"]}>
                {barParts}
            </div>
        </div>
    }
}

export default CapChart;