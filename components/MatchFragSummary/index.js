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

        const typesTeams = {
            "suicides": [],
            "team_kills": [],
            "spawn_kills": [],
            "headshots":  [],
            "deaths":  [],
            "kills": [],
            "frags":  [],
            "score":  [],
        };

        const types = [
            "suicides",
            "team_kills",
            "spawn_kills",
            "headshots",
            "deaths",
            "kills",
            "frags",
            "score"
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

        
        for(const [key, value] of Object.entries(typesTeams)){

            if(value.length > 0){
                toDisplay.push(key);
            }
        }


        return toDisplay;
    }

    render(){

        let elems = [];

        const teamData = [];

        const toDisplay = this.typesToDisplay();

        if(this.state.mode === 0){

            if(this.props.totalTeams < 2){
                teamData.push(<MatchFragTable key={-1} players={this.getPlayersInTeam(-1)} toDisplay={toDisplay} team={-1} matchStart={this.props.matchStart}/>);
            }else{

                for(let i = 0; i < this.props.totalTeams; i++){
                   // teamData.push(this.getPlayersInTeam(i));
                   teamData.push(<MatchFragTable key={i} players={this.getPlayersInTeam(i)} toDisplay={toDisplay} team={i} matchStart={this.props.matchStart}/>);
                }
            }

        }else if(this.state.mode === 1){

            if(this.props.totalTeams < 2){
                teamData.push(<MatchFragDistances key={-1} players={this.getPlayersInTeam(-1)} team={-1} />);
            }else{

                for(let i = 0; i < this.props.totalTeams; i++){
                   // teamData.push(this.getPlayersInTeam(i));
                   teamData.push(<MatchFragDistances key={i} players={this.getPlayersInTeam(i)} team={i} />);
                }
            }
        }

        return <div>
            <div className="default-header">Frag Summary</div>
            <div className="tabs">
                <div onClick={() => this.changeMode(0)} className={`tab ${this.displaySelected(0)}`}>General Data</div>
                <div onClick={() => this.changeMode(1)} className={`tab ${this.displaySelected(1)}`}>Kill Distances</div>
            </div>
            {teamData}
        </div>
    }
}


export default MatchFragSummary;