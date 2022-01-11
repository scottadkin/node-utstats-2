import React from "react";
import styles from './BarChart.module.css';
import Functions from "../../api/functions";

class BarChart extends React.Component{

    constructor(props){

        super(props);
    }

    render(){

        return <div className={styles.wrapper}>
            <div className={styles.title}>
                {this.props.title}
            </div>

            <div className={styles.barm}>
                <div className={styles.label}>
                    Kills
                </div>
                <div className={styles.bars}>
                    <div className={`${styles.bar} ${Functions.getTeamColor(0)}`} style={{"width": "72%"}}></div>
                    <div className={`${styles.bar} ${Functions.getTeamColor(1)}`} style={{"width": "2%"}}></div>
                    <div className={`${styles.bar} ${Functions.getTeamColor(2)}`} style={{"width": "99%"}}></div>
                    <div className={`${styles.bar} ${Functions.getTeamColor(3)}`} style={{"width": "33%"}}></div>
                </div>
            </div>

            <div className={styles.barm}>
                <div className={styles.label}>
                    Deaths
                </div>
                <div className={styles.bars}>
                    <div className={`${styles.bar} ${Functions.getTeamColor(0)}`} style={{"width": "22%"}}></div>
                    <div className={`${styles.bar} ${Functions.getTeamColor(1)}`} style={{"width": "52%"}}></div>
                    <div className={`${styles.bar} ${Functions.getTeamColor(2)}`} style={{"width": "59%"}}></div>
                    <div className={`${styles.bar} ${Functions.getTeamColor(3)}`} style={{"width": "13%"}}></div>
                </div>
            </div>

            <div className={styles.hl}></div>
            <div className={styles.vls}>
                <div className={styles.vl} style={{"marginLeft": "25%"}}></div>
                <div className={styles.vl} style={{"marginLeft": "41.25%"}}></div>
                <div className={styles.vl} style={{"marginLeft": "57.50%"}}></div>
                <div className={styles.vl} style={{"marginLeft": "73.75%"}}></div>
                <div className={styles.vl} style={{"marginLeft": "90%"}}></div>
            </div>
            <div className={styles.values}>
                <div className={styles.value} style={{"marginLeft": "16.875%"}}>0</div>
                <div className={styles.value} style={{"marginLeft": "33.125%"}}>125</div>
                <div className={styles.value} style={{"marginLeft": "49.375%"}}>350</div>
                <div className={styles.value} style={{"marginLeft": "65.625%"}}>675</div>
                <div className={styles.value} style={{"marginLeft": "81.875%"}}>7100</div>
            </div>


            <div className={styles.keys}>
                <div className={styles.key}>
                    <div className={`${styles.color} ${Functions.getTeamColor(0)}`}></div>
                    <div className={styles.kname}>Red Team</div>
                </div>
                <div className={styles.key}>
                    <div className={`${styles.color} ${Functions.getTeamColor(1)}`}></div>
                    <div className={styles.kname}>Blue Team</div>
                </div>
                <div className={styles.key}>
                    <div className={`${styles.color} ${Functions.getTeamColor(2)}`}></div>
                    <div className={styles.kname}>Green Team</div>
                </div>
                <div className={styles.key}>
                    <div className={`${styles.color} ${Functions.getTeamColor(3)}`}></div>
                    <div className={styles.kname}>Yellow Team</div>
                </div>
            </div>
  
        </div>
    }
}

export default BarChart;