import React from "react";
import styles from "./CapChart.module.css";
import Functions from "../../api/functions";
import MouseOver from "../MouseOver";

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

        const totalTravelTime = this.props.capInfo.travel_time;

        const barParts = [];

        let lastDropTime = null;

        for(let i = 0; i < this.props.carryTimes.length; i++){

            const c = this.props.carryTimes[i];

            if(lastDropTime !== null){

                let droppedPercent = 0;

                console.log(`Dropped for ${c.start_time - lastDropTime}`);

                const droppedTime = c.start_time - lastDropTime;

                if(droppedTime > 0){
                    droppedPercent = (droppedTime / totalTravelTime) * 100;
                }

                barParts.push(
                    <div key={`${c.id}-dropped`} className={`${styles["inner-bar"]} ${styles.dropped}`} style={{"width": `${droppedPercent}%`}}>
                        <MouseOver title="Flag Dropped" display={`Flag Dropped for ${droppedTime.toFixed(2)} seconds.`}>&nbsp;</MouseOver>
                    </div>
                );
            }

            let carryPercent = 0;

            if(totalTravelTime > 0 && c.carry_time > 0){
                carryPercent = (c.carry_time / totalTravelTime) * 100;
            }

            barParts.push(<div key={c.id} className={`${styles["inner-bar"]} ${styles.carry}`} style={{"width": `${carryPercent}%`}}>
                <MouseOver title="Flag In Possession" display={`Flag Carried for ${c.carry_time.toFixed(2)} seconds.`}>&nbsp;</MouseOver>
            </div>);

            lastDropTime = c.end_time;
        }


        if(barParts.length === 0){
            barParts.push(<div key="0" className={`${styles["inner-bar"]} ${styles.solo}`} style={{"width": `100%`}}></div>);
        }

        const teamScoreElems = [];

        for(let i = 0; i < this.props.teamScores.length; i++){

            const t = this.props.teamScores[i];

            teamScoreElems.push(<div key={i} style={{"width": `${100 / this.props.teamScores.length}%`}} className={`${Functions.getTeamColor(i)} ${styles["team-score"]}`}>
                {t}
            </div>);
        }

        return <div className={`${styles.wrapper} center`}>
            <div className={styles.title}>The {capTeamName} Capped the {cappedFlagName} Flag</div>
            {teamScoreElems}
            <div className={styles["bar-title"]}>
                Cap Timeline
            </div>
            <div className={styles["bar-wrapper"]}>
                {barParts}
            </div>
        </div>
    }
}

export default CapChart;