import styles from '../PlayerSummary/PlayerSummary.module.css';

const PlayerFragSummary = ({
    score, frags, kills, deaths, suicides, teamKills, spawnKills, efficiency,
    firstBlood, accuracy, close, long, uber
}) =>{


    return (
        <div className={`${styles.table} special-table`}>
            <div className="default-header">
                Frag Performance
            </div>       
            <table className="t-width-1 m-bottom-10">

                <tbody>
                    <tr>
                        <th>Score</th>
                        <th>Frags</th>
                        <th>Suicides</th>
                        <th>Team Kills</th>
                        <th>Spawn Kills</th>
                        <th>Kills</th>
                        <th>Deaths</th>  
                        <th>Efficiency</th>
                        <th>Last Accuracy</th>
                        <th>First Bloods</th>
                    </tr>
                    <tr>
                        <td>{score}</td>
                        <td>{frags}</td>
                        <td>{suicides}</td>
                        <td>{teamKills}</td>
                        <td>{spawnKills}</td>
                        <td>{kills}</td>
                        <td>{deaths}</td>  
                        <td>{efficiency.toFixed(2)}%</td>
                        <td>{accuracy.toFixed(2)}%</td>
                        <td>{firstBlood}</td>
                    </tr>
                </tbody>
            </table>      
        </div>
    );
}

/**
 * <div className="default-header">
                Frag Distances
            </div>
            <table className="t-width-1 m-bottom-10">
                <tbody>
                    <tr>
                        <th>Close Range</th>
                        <th>Long Range</th>
                        <th>Uber Long Range</th>
                    </tr>
                    <tr>
                        <td>{close}</td>
                        <td>{long}</td>
                        <td>{uber}</td>
                    </tr>
                </tbody>
            </table>
 */

export default PlayerFragSummary;