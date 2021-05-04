import Link from 'next/link';
import CountryFlag from '../CountryFlag/';

const MatchRankingChanges = ({changes, playerNames}) =>{

    changes = JSON.parse(changes);
   // playerNames = JSON.parse(playerNames);

    const rows = [];

    let c = 0;

    for(let i = 0; i < changes.length; i++){

        c = changes[i];

        rows.push(<tr>
            <td>PlayerName</td>
            <td>Potatoes</td>
            <td>{c.ranking}</td>
            <td>{c.match_ranking}</td>
            <td>ranking change</td>
            <td>Current ranking</td>
        </tr>);
    }

    return <div>
        <div className="default-header">
            Match Ranking Changes
        </div>
        <table>
            <tbody>
                <tr>
                    <th>Player</th>
                    <th>Previous Ranking</th>
                    <th>Ranking After Match</th>
                    <th>Match Difference</th>
                    <th>Match Ranking</th>
                    <th>Current Ranking</th>
                </tr>
                {rows}
            </tbody>
        </table>
    </div>
}

export default MatchRankingChanges;