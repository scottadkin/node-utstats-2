import MatchFragTable from '../MatchFragTable/';

const getPlayersInTeam = (players, team) =>{

    const foundPlayers = [];

    for(let i = 0; i < players.length; i++){

        //console.log(players[i].team);
        if(players[i].team === team || team === -1){
            foundPlayers.push(players[i]);
        }
    }

    return JSON.stringify(foundPlayers);
}

const MatchFragSummary = ({bTeamGame, totalTeams, playerData}) =>{

    playerData = JSON.parse(playerData);
    
    const teams = [];

    if(!bTeamGame){
        teams.push(<MatchFragTable key={1} players={getPlayersInTeam(playerData, -1)} team={-1}/>);
    }else{

        for(let i = 0; i < totalTeams; i++){
            teams.push(<MatchFragTable key={i} players={getPlayersInTeam(playerData, i)} team={i}/>);
        }
    }


    return (
        <div>
            <div className="default-header">Frag Summary</div>
            <div className="special-table">
            {teams}
            </div>
        </div>
    );
}


export default MatchFragSummary;