import styles from './PlayerSummary.module.css';
import PlayerKillingSprees from '../PlayerKillingSprees/'
import PlayerMultiKills from '../PlayerMultiKills/'
import PlayerFragSummary from '../PlayerFragSummary'
import PlayerCTFSummary from '../PlayerCTFSummary/'
import PlayerGeneral from '../PlayerGeneral/'
import PlayerGametypeStats from '../PlayerGametypeStats'




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

            <PlayerMultiKills data={[
                summary.multi_1,
                summary.multi_2,
                summary.multi_3,
                summary.multi_4,
                summary.multi_5,
                summary.multi_6,
                summary.multi_7,
                summary.multi_best
                ]
            } />

            <PlayerKillingSprees data={[
                summary.spree_1,
                summary.spree_2,
                summary.spree_3,
                summary.spree_4,
                summary.spree_5,
                summary.spree_6,
                summary.spree_7,
                summary.spree_best
            
            ]} />

            <PlayerCTFSummary data={[
                summary.flag_taken,
                summary.flag_pickup,
                summary.flag_dropped,
                summary.flag_capture,
                summary.flag_assist,
                summary.flag_cover,
                summary.flag_kill,
                summary.flag_return,
                summary.flag_save,
            ]} />

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



    
            
        </div>
    );

}

export default PlayerSummary;