import React from "react";
import styles from './BarChart.module.css';
import Functions from "../../api/functions";

class BarChart extends React.Component{

    constructor(props){

        super(props);
        this.state = {"minValue": 0, "maxValue": 0, "range": 0};

    }

    componentDidMount(){

        //const range = this.props.minValue ?? 0 - this.props.maxValue;

        let minValue = this.props.minValue ?? 0;
        let maxValue = null;

        for(let i = 0; i < this.props.values.length; i++){

            const v = this.props.values[i];

            if(minValue === null || v < minValue){
                minValue = v;
            }

            if(maxValue === null || v > maxValue){
                maxValue = v;
            }
        }

        console.log("minValue", minValue, "maxValue", maxValue, "range", maxValue - minValue);

        this.setState({"minValue": minValue, "maxValue": maxValue, "range": maxValue - minValue});
   
    }

    renderBar(id, name, value){

        const bit = 100 / this.state.range;

        const percent = bit * value;


        return <div key={id} className={`${styles.bar} ${Functions.getTeamColor(id)}`} style={{"width": `${percent}%`}}></div>;
    }

    renderBars(label, names, values, maxValue){


        const bars = [];

       
        for(let i = 0; i < this.props.values.length; i++){

            const v = this.props.values[i];
            bars.push(this.renderBar(i, "rtest", v));

        }

        /*
        <div className={`${styles.bar} ${Functions.getTeamColor(1)}`} style={{"width": "2%"}}></div>
                <div className={`${styles.bar} ${Functions.getTeamColor(2)}`} style={{"width": "99%"}}></div>
                <div className={`${styles.bar} ${Functions.getTeamColor(3)}`} style={{"width": "33%"}}></div>
        */

        return <div className={styles.barm}>
            <div className={styles.label}>
                {label}
            </div>
            <div className={styles.bars}>
                {bars}
                
            </div>
        </div>;
    }

    render(){

        return <div className={styles.wrapper}>
            <div className={styles.title}>
                {this.props.title}
            </div>

            {this.renderBars(this.props.label)}

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
                <div className={styles.value} style={{"marginLeft": "33.125%"}}>{this.state.range * 0.25}</div>
                <div className={styles.value} style={{"marginLeft": "49.375%"}}>{this.state.range * 0.5}</div>
                <div className={styles.value} style={{"marginLeft": "65.625%"}}>{this.state.range * 0.75}</div>
                <div className={styles.value} style={{"marginLeft": "81.875%"}}>{this.state.maxValue}</div>
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