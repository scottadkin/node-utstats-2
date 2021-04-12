import React from 'react';
import styles from './MatchPowerUpControl.module.css';
import CountryFlag from '../CountryFlag/';


class MatchPowerUpControl extends React.Component{

    constructor(props){

        console.log(props);

        super(props);
    }


    getTotal(item, team){

        let total = 0;

        let p = 0;

        for(let i = 0; i < this.props.players.length; i++){

            p = this.props.players[i];
            
            if(team !== undefined){
                if(p.team === team){
                    if(p[item] !== undefined) total += p[item];
                }
            }else{
                if(p[item] !== undefined) total += p[item];
            }
        }

        return total;
    }

    displayItem(item){

        let title = "Unknown";

        let timeElems = null;
        let totalPickups = 0;
        let redValue = 0;
        let blueValue = 0;
        let redPercent = 0;
        let bluePercent = 0;

        totalPickups = this.getTotal(item)

        redValue = this.getTotal(item, 0);
        blueValue = this.getTotal(item, 1);

        if(item === "amp"){

            title = "UDamage";

            timeElems = <div className={styles.pcontroltop}>
                <div>{this.getTotal("amp_time", 0)} seconds</div>
                <div>{this.getTotal("amp_time", 1)} seconds</div>
            </div>

        }else if(item === "invisibility"){

            title = "Invisibility";

            timeElems = <div className={styles.pcontroltop}>
                <div>{this.getTotal("invisibility_time", 0)} seconds</div>
                <div>{this.getTotal("invisibility_time", 1)} seconds</div>
            </div>

        }else if(item === "belt"){

            title = "Shield Belt";

        }else if(item === "armor"){

            title = "Body Armor";

        }else if(item === "pads"){

            title = "Thigh Pads";

        }else if(item === "boots"){

            title = "Jump Boots";
        }


        if(totalPickups > 0 && redValue > 0){
            redPercent =  redValue / totalPickups;
            redPercent *= 100;
        }

        if(totalPickups > 0 && blueValue > 0){
            bluePercent = blueValue / totalPickups;
            bluePercent *= 100;
        }

        if(redPercent === 0 && bluePercent === 0){
            redPercent = 50;
            bluePercent = 50;
        }


        console.log(`item = ${item} redValue = ${redValue}  blueValue = ${blueValue}`);

        return <div className={styles.iwrapper}>

            <div className={styles.iname}>{title}</div>
            {timeElems}
            <div className={styles.pcontrol}>
                <div className={styles.name1}>
                    <CountryFlag country={"gb"}/>Ooper
                </div>
                <div className={styles.bar}>
                    <div style={{"width": `${redPercent}%`}} className={`${styles.player1} team-red`}>
                       {redValue}
                    </div>
                    <div style={{"width": `${bluePercent}%`}} className={`${styles.player2} team-blue`}>
                        {blueValue}
                    </div>
                </div>
                <div className={styles.name2}>
                    <CountryFlag country={"us"}/>Pooper
                </div>
            </div>
        </div>
    }

    render(){

        return <div>
            <div className="default-header">
                Power Up Control
            </div>

            {this.displayItem("amp")}
            {this.displayItem("invisibility")}
            {this.displayItem("belt")}
            {this.displayItem("armor")}
            {this.displayItem("pads")}
            {this.displayItem("boots")}
        </div>
    }
}


export default MatchPowerUpControl;