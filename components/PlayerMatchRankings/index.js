import Functions from '../../api/functions';

const getIcon = (value) =>{

    if(value > 0){
        return <img className="ranking-icon" src="/images/up.png" alt="icon"/>;
    }else if(value < 0){
        return <img className="ranking-icon" src="/images/down.png" alt="icon"/>;
    }

    return <img className="ranking-icon" src="/images/nochange.png" alt="icon"/>;
}

const PlayerMatchRankings = ({data, current, currentPosition}) =>{

    return <div className="m-bottom-25">
        <div className="default-header">Match Ranking Summary</div>
        <table>
            <tbody>
                <tr>
                    <th>Previous Ranking</th>
                    <th>Match Ranking</th>
                    <th>Ranking Change</th>
                    <th>Ranking After Match</th>
                    <th>Current Ranking</th>
                </tr>
                <tr>
                    <td>{(data[0].ranking - data[0].ranking_change).toFixed(2)}</td>
                    <td>{data[0].match_ranking}</td>
                    <td>{getIcon(data[0].ranking_change.toFixed(2))}{data[0].ranking_change.toFixed(2)}</td>
                    <td>{getIcon(data[0].ranking_change)}{data[0].ranking}</td>
                    <td><i className="yellow">({currentPosition}{Functions.getOrdinal(currentPosition)})</i> {getIcon(current[0].ranking_change)}{current[0].ranking}</td>
                </tr>
            </tbody>
        </table>
    </div>
}


export default PlayerMatchRankings;