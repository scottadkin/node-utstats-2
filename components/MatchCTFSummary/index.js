import MatchCTFSummaryTeam from '../MatchCTFSummaryTeam/';
import MatchCTFSummaryDefault from '../MatchCTFSummaryDefault/';
import React from 'react';

const getPlayersInTeam = (players, team) =>{

    const found = [];

    for(let i = 0; i < players.length; i++){

        if(players[i].team === team){
            found.push(players[i]);
        }
    }

    return JSON.stringify(found);
}

/*const MatchCTFSummary = ({players, totalTeams}) =>{


    players = JSON.parse(players);

    const teams = [];

    for(let i = 0; i < totalTeams; i++){

        teams.push(<MatchCTFSummaryTeam key={i} players={getPlayersInTeam(players, i)} team={i}/>);
    }

    return (
        <div className="special-table">
            <div className="default-header">
                Capture The Flag Summary
            </div>

            {teams}
        </div>
    );
}*/

class MatchCTFSummary extends React.Component{

    constructor(props){

        super(props);

        this.state = {"mode": 0};
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


        const teams = [];
        let teamPlayers = [];

        for(let i = 0; i < this.props.totalTeams; i++){

            teamPlayers = this.getTeamPlayers(i);

            teams.push(<MatchCTFSummaryDefault team={i} players={teamPlayers}/>);
        }


        return <div>
            <div className="default-header">Capture The Flag Summary</div>
            <div className="tabs">
                <div className="tab tab-selected">General</div>
                <div className="tab">Covers</div>
            </div>

            {teams}

        </div>
    }
}

export default MatchCTFSummary;