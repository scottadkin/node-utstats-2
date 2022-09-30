import React from "react";
import styles from "./HeatMap.module.css";

class HeatMap extends React.Component{

    constructor(props){

        super(props);
    }

    renderLabels(){

        const labels = [];


        return <rect x="15%" y="12.5%" width="85%" height="70%" fill="pink">
            labels

        </rect>;
    }

    render(){


        return <div>
            <div className="default-header">heat map</div>
            <div className={`${styles.wrapper} center`}>
                <svg viewBox="0 0 100 56.25">
                    <text className={styles.title} x="50" y="4" fontSize="3" >{this.props.title}</text>
                    {this.renderLabels()}
                </svg>
            </div>
        </div>
    }
}

export default HeatMap;