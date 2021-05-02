import MatchDominationSummaryTable from '../MatchDominationSummaryTable/';

const getPlayersOnTeam = (players, team) =>{

    const found = [];

    for(let i = 0; i < players.length; i++){

        if(players[i].team === team){
            found.push(players[i]);
        }
    }
    return JSON.stringify(found);
}

const MatchDominationSummary = ({players, totalTeams, controlPointNames, capData}) =>{

    players = JSON.parse(players);
    const teams = [];

    if(capData === "[]") return null;

    for(let i = 0; i < totalTeams; i++){

        teams.push(<MatchDominationSummaryTable key={i} team={i} players={getPlayersOnTeam(players, i)} controlPointNames={controlPointNames} capData={capData}/>);
    }

    return (<div className="special-table">
        <div className="default-header">
            Domination Summary
        </div>
        {teams}
    </div>);
}


export default MatchDominationSummary;