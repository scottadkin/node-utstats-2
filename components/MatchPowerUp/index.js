import React from "react";
import styles from './MatchPowerUp.module.css';
import Image from "next/image";


class MatchPowerUp extends React.Component{

    constructor(props){

        super(props);
    }

    render(){

        return <div className={styles.wrapper}>
            <div className={styles.title}>
                {this.props.title}
            </div>
            <div className={styles.iwrapper}>
                <Image src={`/images/temp2.jpg`} width={200} height={200}/>
            </div>
            <div className={styles.tusages}>
                Used {this.props.totalUses} Time{(this.props.totalUses === 1) ? "" : "s"}
            </div>
            <div className={styles.bwrapper}>
                <div className={styles.bar}>
                    <div className={`${styles.bari} team-red`} style={{"width": "40%"}}>
                    </div>
                    <div className={`${styles.bari} team-blue`} style={{"width": "60%"}}>
                    </div>
                </div>
                <div className={styles.tvalues}>
                    <div className={styles.tvalue} style={{"width" :"50%"}}>40%</div>
                    <div className={styles.tvalue} style={{"width" :"50%"}}>60%</div>
                </div>
            </div>
        </div>
    }
}

export default MatchPowerUp;