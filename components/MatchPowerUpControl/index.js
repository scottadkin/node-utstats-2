import React from 'react';
import styles from './MatchPowerUpControl.module.css';
import CountryFlag from '../CountryFlag/';
import Link from 'next/link';


class MatchPowerUpControl extends React.Component{

    constructor(props){

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

    getTeamTopPlaytimePlayer(team){

        let p = 0;

        let players  = this.props.players;

        players.sort((a, b) =>{

            a = a.playtime;
            b = b.playtime;

            if(a > b){
                return -1;
            }else if(a < b){
                return 1;
            }

            return 0;
        });

        for(let i = 0; i < this.props.players.length; i++){

            p = this.props.players[i];

            if(p.team === team) return {"name": p.name, "id": p.player_id, "country": p.country}
        }

        return {"name": "Not Found", "id": -1, "country": "xx"};
    }

    getName(team){

        if(this.props.players.length === 2){
            // /<CountryFlag country={"gb"}/>Ooper

            let player = this.getTeamTopPlaytimePlayer(team);

            return <Link href={`/player/${player.id}`}><a><CountryFlag country={player.country} />{player.name}</a></Link>

        }else{

            if(team === 0) return "Red Team";
            if(team === 1) return "Blue Team";
            if(team === 2) return "Green Team";
            if(team === 3) return "Yellow Team";
        }
    }

    displayItemDuel(item){

        let title = "Unknown";

        let timeElems = null;
        let totalPickups = 0;  
   
        let totalTeams = this.props.totalTeams;

        const values = {
            "red": 0,
            "blue": 0
        };

        const percentValues = {
            "red": 0,
            "blue": 0
        };

        totalPickups = this.getTotal(item)

        if(totalPickups === 0) return null;

        values.red = this.getTotal(item, 0);
        values.blue = this.getTotal(item, 1);
        

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

        for(let [key, value] of Object.entries(percentValues)){

            if(totalPickups != 0 && values[key] != 0){
                value = values[key] / totalPickups;
            }

            value *= 100;
            percentValues[key] = value;
        }

        if(totalPickups === 0){

            for(let [key, value] of Object.entries(percentValues)){

                value = 100 / totalTeams;
                percentValues[key] = value;
            }
        }


        return <div className={styles.iwrapper}>

            <div className={styles.iname}>{title}</div>
            {timeElems}
            <div className={styles.pcontrol}>
                <div className={styles.name1}>
                    {this.getName(0)}
                </div>
                <div className={styles.bar}>
                    <div style={{"width": `${percentValues.red}%`}} className={`${styles.player1} team-red`}>
                       {values.red}
                    </div>
                    <div style={{"width": `${percentValues.blue}%`}} className={`${styles.player2} team-blue`}>
                        {values.blue}
                    </div>
                </div>
                <div className={styles.name2}>
                    {this.getName(1)}
                </div>
            </div>
        </div>
    }

    //for 1v1s or 2 team games
    displayDuel(){

        if(this.props.totalTeams !== 2) return null;

        return <div>
            {this.displayItemDuel("amp")}
            {this.displayItemDuel("invisibility")}
            {this.displayItemDuel("belt")}
            {this.displayItemDuel("armor")}
            {this.displayItemDuel("pads")}
            {this.displayItemDuel("boots")}
        </div>;
    }

    render(){

        return <div>
            <div className="default-header">
                Power Up Control
            </div>

            {this.displayDuel()}
        </div>
    }
}


export default MatchPowerUpControl;