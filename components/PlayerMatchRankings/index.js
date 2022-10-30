import Functions from '../../api/functions';
import Table2 from '../Table2';
import Image from 'next/image';
import ErrorMessage from '../ErrorMessage';

const getIcon = (value) =>{

    if(value > 0){
        return <Image width={12} height={12} className="ranking-icon" src="/images/up.png" alt="icon"/>;
    }else if(value < 0){
        return <Image width={12} height={12} className="ranking-icon" src="/images/down.png" alt="icon"/>;
    }

    return <Image width={12} height={12} className="ranking-icon" src="/images/nochange.png" alt="icon"/>;
}

const PlayerMatchRankings = ({data, current, currentPosition}) =>{

    if(data.length === 0) return <ErrorMessage title="PlayerMatchRankings" text="data is an empty array"/>

    return <div className="m-bottom-25">
        <div className="default-header">Match Ranking Summary</div>
        <Table2 width={1}>
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
                <td><i className="yellow">({currentPosition}{Functions.getOrdinal(currentPosition)})</i> {getIcon(current[0].ranking_change)} {current[0].ranking}</td>
            </tr>
 
        </Table2>
    </div>
}


export default PlayerMatchRankings;