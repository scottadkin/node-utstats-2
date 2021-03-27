import React from 'react';
import MatchFragTable from '../MatchFragTable/';
import MatchFragDistances from '../MatchFragDistances/';



class MatchFragSummary extends React.Component{

    constructor(props){

        super(props);

        this.state = {"mode": 0}; //0 normal, 1 kill distances

        this.changeMode = this.changeMode.bind(this);
    }

    changeMode(id){

        this.setState({"mode": id});
    }

    displaySelected(id){

        if(id === this.state.mode) return "tab-selected"
        return '';
    }

    getPlayersInTeam = (team) =>{

        const foundPlayers = [];
   
        let p = 0;
    
        for(let i = 0; i < this.props.playerData.length; i++){

            p = this.props.playerData[i];
            
            if(p.team === team || team === -1){
                foundPlayers.push(p);
            }
        }
    
        return foundPlayers;
    }

    typesToDisplay(){

        const toDisplay = [];
        const toDisplayDistances = [];
        

        const typesTeams = {
            "suicides": [],
            "team_kills": [],
            "spawn_kills": [],
            "headshots":  [],
            "deaths":  [],
            "kills": [],
            "frags":  [],
            "score":  [],
            "k_distance_normal": [],
            "k_distance_long": [],
            "k_distance_uber": []
        };


        const types = [
            "suicides",
            "team_kills",
            "spawn_kills",
            "headshots",
            "deaths",
            "kills",
            "frags",
            "score",
            "k_distance_normal",
            "k_distance_long",
            "k_distance_uber"
        ];


        let p = 0;

        for(let i = 0; i < this.props.playerData.length; i++){

            p = this.props.playerData[i];

            for(let x = 0; x < types.length; x++){

                if(p[types[x]] !== 0){
                    if(typesTeams[types[x]].indexOf(p.team) === -1) typesTeams[types[x]].push(p.team);
                }
            }
        }

        
        let i = 0;

        for(const [key, value] of Object.entries(typesTeams)){

            if(value.length > 0){

                if(i < 7){
                    toDisplay.push(key);
                }else{
                    toDisplayDistances.push(key);
                }
                
            }
            i++;
        }



        return {"default": toDisplay, "distances": toDisplayDistances};
    }

    bAnyDistanceData(){


        const types = [
            "shortest_kill_distance", 
            "average_kill_distance", 
            "longest_kill_distance",
            "k_distance_normal",
            "k_distance_long",
            "k_distance_uber"
        ];

        let p = 0;

        for(let i = 0; i < this.props.playerData.length; i++){

            p = this.props.playerData[i];

            for(let x = 0; x < types.length; x++){

                if(p[types[x]] !== 0){
                    return true;
                }
            }
        }

        return false;
    }

    render(){

        let elems = [];

        const teamData = [];

        const toDisplay = this.typesToDisplay();

        if(this.state.mode === 0){

            if(this.props.totalTeams < 2){
                teamData.push(<MatchFragTable key={-1} players={this.getPlayersInTeam(-1)} toDisplay={toDisplay.default} team={-1} matchStart={this.props.matchStart}/>);
            }else{

                for(let i = 0; i < this.props.totalTeams; i++){
                   // teamData.push(this.getPlayersInTeam(i));
                   teamData.push(<MatchFragTable key={i} players={this.getPlayersInTeam(i)} toDisplay={toDisplay.default} team={i} matchStart={this.props.matchStart}/>);
                }
            }

        }else if(this.state.mode === 1){

            if(this.props.totalTeams < 2){
                teamData.push(<MatchFragDistances key={-1} toDisplay={toDisplay.distances} players={this.getPlayersInTeam(-1)} team={-1} />);
            }else{

                for(let i = 0; i < this.props.totalTeams; i++){
                   // teamData.push(this.getPlayersInTeam(i));
                   teamData.push(<MatchFragDistances key={i} toDisplay={toDisplay.distances} players={this.getPlayersInTeam(i)} team={i} />);
                }
            }
        }

        return <div>
            <div className="default-header">Frag Summary</div>
            {
            (this.bAnyDistanceData()) ?
                <div className="tabs">
                    <div onClick={() => this.changeMode(0)} className={`tab ${this.displaySelected(0)}`}>General Data</div>
                    <div onClick={() => this.changeMode(1)} className={`tab ${this.displaySelected(1)}`}>Kill Distances</div>
                </div>
                :
                null
            }
            {teamData}
        </div>
    }
}


export default MatchFragSummary;