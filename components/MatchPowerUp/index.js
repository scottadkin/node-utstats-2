import React from "react";
import styles from './MatchPowerUp.module.css';
import Image from "next/image";
import Functions from '../../api/functions';


class MatchPowerUp extends React.Component{

    constructor(props){

        super(props);

        console.log(this.props);
    }


    renderTeamPart(teamId){
        
        let totalPercent =  this.props.teamUses[teamId] / this.props.totalUses;

        const parsed = parseInt(totalPercent);
        if(parsed !== parsed) totalPercent = 0;

        totalPercent *= 100;

        return <div key={teamId} className={`${styles.bari} ${Functions.getTeamColor(teamId)}`} style={{"width": `${totalPercent}%`}}></div>
    }

    renderMainBar(){

        const elems = [];

        for(let i = 0; i < this.props.totalTeams; i++){

            const elem = this.renderTeamPart(i);
            elems.push(elem);
        }

        return <div className={styles.bar}>
            {elems}
        </div>

    }

    renderTeamValue(teamId){

        const percent = 100 / this.props.totalTeams;

        return <div key={teamId} className={`${styles.tvalue} ${Functions.getTeamColor(teamId)}`} style={{"width" :`${percent}%`}}>{this.props.teamUses[teamId]}</div>
    }

    renderTValues(){

        const elems = [];
        

        for(let i = 0; i < this.props.totalTeams; i++){

            const current = this.renderTeamValue(i);
            elems.push(current);
        }

        return <div className={styles.tvalues}>
            {elems}
        </div>

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
                {this.renderTValues()}
            </div>
        </div>
    }
}

export default MatchPowerUp;