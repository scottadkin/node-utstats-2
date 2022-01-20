import styles from './ProgressBarAdvanced.module.css';
import React from 'react';

class ProgressBarAdvanced extends React.Component{

    constructor(props){

        super(props);
    }

    render(){

        let part = 100 / this.props.total;

        let passPercent = this.props.passed * part;
        let failPercent = this.props.failed * part;

        let totalPercent = passPercent + failPercent;

        if(totalPercent !== totalPercent) totalPercent = 0;

        return <div className={styles.wrapper}>
            <div className={styles.obar}>
                <div className={styles.pass} style={{"width": `${passPercent}%`}}></div>
                <div className={styles.fail} style={{"width": `${failPercent}%`}}></div>
            </div>
            <div className={styles.value}>{totalPercent.toFixed(2)}%</div>
        </div>
    }
}

export default ProgressBarAdvanced;