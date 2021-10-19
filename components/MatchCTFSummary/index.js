import MatchCTFSummaryDefault from '../MatchCTFSummaryDefault/';
import MatchCTFSummaryCovers from '../MatchCTFSummaryCovers/';
import React from 'react';
import Functions from '../../api/functions';


class MatchCTFSummary extends React.Component{

    constructor(props){

        super(props);

        this.state = {"mode": 0};

        this.changeMode = this.changeMode.bind(this);
    }

    bAnyCTFData(){


        const reg = /flag/i;
   
        for(let i = 0; i < this.props.players.length; i++){

            const p = this.props.players[i];

            for(const [key, value] of Object.entries(p)){
      
                if(reg.test(key)){
                    if(value !== 0) return true;
                }
            }
        }


        return false;
    }

    componentDidMount(){

        const settings = this.props.session;

        if(settings["matchPageCtfMode"] !== undefined){
            this.setState({"mode": parseInt(settings["matchPageCtfMode"])});
        }
    }

    changeMode(id){

        this.setState({"mode": id});
        Functions.setCookie("matchPageCtfMode", id);
    }

    getTeamPlayers(team){

        const found = [];

        let p = 0;

        for(let i = 0; i < this.props.players.length; i++){

            p = this.props.players[i];

            if(p.team === team) found.push(p);
        }

        return found;

    }


    render(){


        if(!this.bAnyCTFData()) return null;

        const teams = [];
        let teamPlayers = [];

        for(let i = 0; i < this.props.totalTeams; i++){

            teamPlayers = this.getTeamPlayers(i);

            if(this.state.mode === 0){
                teams.push(<MatchCTFSummaryDefault host={this.props.host} team={i} key={i} players={teamPlayers} matchId={this.props.matchId}/>);
            }else if(this.state.mode === 1){
                teams.push(<MatchCTFSummaryCovers host={this.props.host} team={i} key={i} players={teamPlayers} matchId={this.props.matchId}/>);
            }
        }


        return <div>
            <div className="default-header">Capture The Flag Summary</div>
            <div className="tabs">
                <div className={`tab ${(this.state.mode === 0) ? "tab-selected" : "" }`} onClick={(() =>{ this.changeMode(0)})}>General</div>
                <div className={`tab ${(this.state.mode === 1) ? "tab-selected" : "" }`} onClick={(() =>{ this.changeMode(1)})}>Covers</div>
            </div>

            {teams}

        </div>
    }
}

export default MatchCTFSummary;