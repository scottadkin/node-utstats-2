import React from 'react';
import MatchFragTable from '../MatchFragTable/';

class MatchFragSummary2 extends React.Component{

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

    render(){

        let elems = [];

        const teamData = [];

        if(this.state.mode === 0){

            if(this.props.totalTeams < 2){
                teamData.push(<MatchFragTable key={-1} players={this.getPlayersInTeam(-1)} team={-1} matchStart={this.props.matchStart}/>);
            }else{

                for(let i = 0; i < this.props.totalTeams; i++){
                   // teamData.push(this.getPlayersInTeam(i));
                   teamData.push(<MatchFragTable key={i} players={this.getPlayersInTeam(i)} team={i} matchStart={this.props.matchStart}/>);
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


export default MatchFragSummary2;