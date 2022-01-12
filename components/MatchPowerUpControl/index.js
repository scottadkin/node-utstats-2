import React from 'react';
import styles from './MatchPowerUpControl.module.css';
import CountryFlag from '../CountryFlag/';
import Link from 'next/link';
import Functions from '../../api/functions';
import MatchPowerUp from '../MatchPowerUp';
import BarChart from '../BarChart';

class MatchPowerUpControl extends React.Component{

    constructor(props){

        super(props);
        this.state = {"bFinishedLoading": false, "bFailed": false, "playerTeams": [[],[],[],[]]};

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

                this.setState({
                    "itemNames": res.itemNames, 
                    "playerUses": res.playerUses, 
                    "itemTotals": res.itemTotals, 
                    "bFinishedLoading": true
                });
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

        if(this.state.itemTotals[itemId] !== undefined) return this.state.itemTotals[itemId];
        
        return 0;
    }

    getPlayerTeam(playerId){

        for(let i = 0; i < this.props.players.length; i++){

            const p = this.props.players[i];

            if(p.id === playerId) return p.team;
        }

        return -1;
    }

    getTeamsItemUsage(itemId){

        if(this.props.totalTeams < 2) return [];

        let total = [];

        for(let i = 0; i < this.props.totalTeams; i++) total.push(0);

        for(let i = 0; i < this.state.playerUses.length; i++){

            const p = this.state.playerUses[i];
        
            if(p.item === itemId){

                const playerTeam = this.getPlayerTeam(p.player_id);
                total[playerTeam] += p.uses;
            }
        }

        return total;
    }


    getTeamNames(){

        const names = [];

        for(let i = 0; i < this.props.totalTeams; i++){

            names.push(Functions.getTeamName(i));
        }

        return names;
    }

    createElems(){

        const health = [];
        const powerUps = [];

        const names = this.getTeamNames();

        for(let i = 0; i < this.state.itemNames.length; i++){

            const item = this.state.itemNames[i];
            
            if(item.type < 0) continue;

            const teamUses = this.getTeamsItemUsage(item.id);

            if(item.type === 3){

                health.push(
                    <BarChart 
                        key={i}
                        title={item.display_name} 
                        label="Taken" 
                        values={teamUses}
                        names={names}        
                    />
                );
                
            }else if(item.type === 4){

                powerUps.push(
                    <BarChart 
                        key={i}
                        title={item.display_name} 
                        label="Taken" 
                        values={teamUses}
                        names={names}        
                    />
                );
            }
            
        }

        return {"health": health, "powerUps": powerUps};

    }


    render(){




        /*return <div>
            <div className="default-header">BARCHART TEST</div>
            <BarChart 
                title="Test title"
                
            /></div>;*/


        if(!this.state.bFinishedLoading){

            return <div>
                <div className="default-header">Item Stats</div>
                Loading Please Wait...
            </div>

        }

        const elems = this.createElems();
            
        return <div>
            <div className="default-header">
                Power Up Control
            </div>
            <div className={styles.wrapper}>
                {elems.powerUps}
            </div>
            <div className="default-header">
                Health/Armour Control
            </div>
            <div className={styles.wrapper}>
                {elems.health}
            </div>
        </div>
        
  
    }
}


export default MatchPowerUpControl;