import MatchCTFSummaryTeam from '../MatchCTFSummaryTeam/';

const getPlayersInTeam = (players, team) =>{

    const found = [];

    for(let i = 0; i < players.length; i++){

        if(players[i].team === team){
            found.push(players[i]);
        }
    }

    return JSON.stringify(found);
}

const MatchCTFSummary = ({players, totalTeams}) =>{


    players = JSON.parse(players);

    const teams = [];

    for(let i = 0; i < totalTeams; i++){

        teams.push(<MatchCTFSummaryTeam players={getPlayersInTeam(players, i)} team={i}/>);
    }

    return (
        <div className="special-table">
            <div className="default-header">
                Capture The Flag Summary
            </div>

            {teams}
        </div>
    );
}

export default MatchCTFSummary;