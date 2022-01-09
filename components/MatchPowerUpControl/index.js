import React from 'react';
import styles from './MatchPowerUpControl.module.css';
import CountryFlag from '../CountryFlag/';
import Link from 'next/link';
import Functions from '../../api/functions';
import MatchPowerUp from '../MatchPowerUp';

class MatchPowerUpControl extends React.Component{

    constructor(props){

        super(props);

        console.log(this.props.players);
        this.state = {"bFinishedLoading": false, "bFailed": false, "playerTeams": [[],[],[],[]]};
        //console.log(this.props.itemNames);
    }

    async loadData(){

        try{

            const req = await fetch("/api/pickups", {
                "headers": {"content-type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({"mode": "matchUsage", "matchId": this.props.matchId})
            });

            const res = await req.json();

            console.log(res);

            if(res.error !== undefined){
                this.setState({"bFailed": true});
            }else{

                this.setState({"itemNames": res.itemNames, "playerUses": res.playerUses, "bFinishedLoading": true});
            }

        }catch(err){
            console.trace(err);
        }
    }

    async componentDidMount(){

        this.setPlayerTeams();
        await this.loadData();

    }

    setPlayerTeams(){

        const teams = [[],[],[],[]];

        for(let i = 0; i < this.props.players.length; i++){

            const p = this.props.players[i];

            if(p.team >= 0 && p.team <= 4){

                teams[p.team].push(p.id);
            }
        }

        this.setState({"playerTeams": teams});
    }

    getItemTotalUsage(itemId){

        let total = 0;

        for(let i = 0; i < this.state.playerUses.length; i++){

            const p = this.state.playerUses[i];

            if(p.item === itemId) total++;
        }

        return total;
    }


    createElems(){

        const health = [];
        const powerUps = [];

        for(let i = 0; i < this.state.itemNames.length; i++){

            const item = this.state.itemNames[i];

            if(item.type < 3) continue;

            if(item.type === 3){

                health.push(<MatchPowerUp
                    key={i}
                    title={item.display_name}  
                    totalUses={this.getItemTotalUsage(item.id)}
                />);
                
            }else{

                powerUps.push(<MatchPowerUp
                    key={i}
                    title={item.display_name}  
                    totalUses={this.getItemTotalUsage(item.id)}
                />);
            }
            
        }

        return {"health": health, "powerUps": powerUps};

    }


    render(){


        let inner = <>Loading Please Wait...</>;


        if(this.state.bFinishedLoading){

            const elems = this.createElems();

            inner = [elems.health, elems.powerUps];

        }
            
        return <div>
            <div className="default-header">
                Power Up Control
            </div>
            {inner}
        </div>
        
  
    }
}


export default MatchPowerUpControl;