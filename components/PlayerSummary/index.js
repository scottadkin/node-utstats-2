import styles from './PlayerSummary.module.css';
import PlayerFragSummary from '../PlayerFragSummary';
import PlayerCTFSummary from '../PlayerCTFSummary/';
import PlayerGeneral from '../PlayerGeneral/';
import PlayerGametypeStats from '../PlayerGametypeStats/';
import PlayerSpecialEvents from '../PlayerSpecialEvents/';



const PlayerSummary = ({summary, flag, country, gametypeStats, gametypeNames, face}) =>{   

    summary = JSON.parse(summary);

    return (
        <div>

            
            <PlayerGeneral 
                country={country}
                flag={flag}
                face={face}
                first={summary.first}
                last={summary.last}
                matches={summary.matches}
                playtime={summary.playtime}
                winRate={summary.winrate}
                wins={summary.wins}
                losses={summary.losses}
                draws={summary.draws}
            />

            <PlayerGametypeStats data={gametypeStats} names={gametypeNames}/>

            <PlayerCTFSummary data={summary} />

            <div className={`${styles.table} special-table`}>
                <div className="default-header">Assault & Domination</div>
                <table>
                    <tbody>
                        <tr>
                            <th>Assault Objectives Captured</th>
                            <th>Domination Control Point Caps</th>
                        </tr>
                        <tr>
                            <td>{summary.assault_objectives}</td>
                            <td>{summary.dom_caps}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <PlayerFragSummary 
                score={summary.score}
                frags={summary.frags}
                kills={summary.kills}
                deaths={summary.deaths}
                suicides={summary.suicides}
                teamKills={summary.team_kills}
                spawnKills={summary.spawn_kills}
                efficiency={summary.efficiency}
                firstBlood={summary.first_bloods}
                accuracy={summary.accuracy}
                close={summary.k_distance_normal}
                long={summary.k_distance_long}
                uber={summary.k_distance_uber}
                headshots={summary.headshots}
                spawnKillSpree={summary.best_spawn_kill_spree}
            />

            <PlayerSpecialEvents 
                data={summary}
            />

            

    



    
            
        </div>
    );

}

export default PlayerSummary;