import MatchDominationSummaryTable from '../MatchDominationSummaryTable/';

const MatchDominationSummary = ({players, totalTeams, controlPointNames, capData}) =>{

    const teams = [];

    for(let i = 0; i < totalTeams; i++){

        teams.push(<MatchDominationSummaryTable team={i} players={players} controlPointNames={controlPointNames} capData={capData}/>);
    }

    return (<div className="special-table">
        <div className="default-header">
            Domination Summary
        </div>
        {teams}
    </div>);
}


export default MatchDominationSummary;