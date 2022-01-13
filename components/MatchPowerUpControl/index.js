import React from 'react';
import styles from './MatchPowerUpControl.module.css';
import Functions from '../../api/functions';
import BarChart from '../BarChart';

class MatchPowerUpControl extends React.Component{

    constructor(props){

        super(props);
        this.state = {"bFinishedLoading": false, "bFailed": false, "playerTeams": [[],[],[],[]], "bAllDisabled": false};

    }

    bAllDisabled(){

        const needed = [
            "Display Weapons Control",
            "Display Powerup Control",
            "Display Ammo Control",
            "Display Health/Armour Control"
        ];

        for(let i = 0; i < needed.length; i++){

            const n = needed[i];

            if(this.props.settings[n] === "true"){
                return false;
            }
        }
        
        return true;
    }

    async loadData(){

        try{

            if(this.bAllDisabled()){
                this.setState({"bAllDisabled": true});
                return;
            }

            const req = await fetch("/api/pickups", {
                "headers": {"content-type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({"mode": "matchUsage", "matchId": this.props.matchId})
            });

            const res = await req.json();

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

    getPlayerItemUsage(item, playerId){

        for(let i = 0; i < this.state.playerUses.length; i++){

            const p = this.state.playerUses[i];

            if(p.player_id === playerId){

                if(p.item === item){
                    return p.uses;
                }
            }
        }

        return 0;
    }

    getPlayersItemUsage(itemId){

        const uses = [];

        for(let i = 0; i < this.props.players.length; i++){

            const p = this.props.players[i];

            uses.push(this.getPlayerItemUsage(itemId, p.id));
        }

        return uses;
    }

    getPlayerNames(){

        const names = [];

        for(let i = 0; i < this.props.players.length; i++){

            const p = this.props.players[i];

            names.push(p.name);
        }

        return names;
    }

    createElems(){

        const health = [];
        const powerUps = [];
        const weapons = [];
        const ammo = [];

        let names = [];

        if(this.props.totalTeams >= 2){
            names = this.getTeamNames();
        }else{
            names = this.getPlayerNames();
        }

        for(let i = 0; i < this.state.itemNames.length; i++){

            const item = this.state.itemNames[i];
            
            if(item.type < 0) continue;

            let uses = [];

            if(this.props.totalTeams >= 2){

                uses = this.getTeamsItemUsage(item.id);

            }else{

                uses = this.getPlayersItemUsage(item.id);
            }

            let targetArray = null;

            if(item.type === 1){

                if(this.props.settings["Display Weapons Control"] === "true"){
                    targetArray = weapons;
                }
                
            }else if(item.type === 2){
                
                if(this.props.settings["Display Ammo Control"] === "true"){
                    targetArray = ammo;
                }

            }else if(item.type === 3){

                if(this.props.settings["Display Health/Armour Control"] === "true"){
                    targetArray = health;
                }
                
            }else if(item.type === 4){

                if(this.props.settings["Display Powerup Control"] === "true"){
                    targetArray = powerUps;
                }
            }

            if(targetArray !== null){

                targetArray.push(<BarChart 
                    key={i}
                    title={item.display_name} 
                    label="Taken" 
                    values={uses}
                    names={names}        
                />);
            }
            
        }

        return {"health": health, "powerUps": powerUps, "weapons": weapons, "ammo": ammo};

    }


    renderCategory(title, elems){

        if(elems.length === 0) return null;

        return <>
            <div className="default-header">
                {title}
            </div>
            <div className={styles.wrapper}>
                {elems}
            </div>
        </>
    }

    render(){

        if(this.state.bAllDisabled) return null;

        if(!this.state.bFinishedLoading){

            return <div>
                <div className="default-header">Item Stats</div>
                Loading Please Wait...
            </div>

        }

        let elems = null;

        elems = this.createElems();
   
        if(elems === null) return null;

        return <div>
                {this.renderCategory("Power Up Control", elems.powerUps)}
                {this.renderCategory("Health/Armour Control", elems.health)}
                {this.renderCategory("Weapons Control", elems.weapons)}
                {this.renderCategory("Ammo Control", elems.ammo)}
            </div>
        
  
    }
}


export default MatchPowerUpControl;