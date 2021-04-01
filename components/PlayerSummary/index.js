import styles from './PlayerSummary.module.css';
import PlayerKillingSprees from '../PlayerKillingSprees/'
import PlayerMultiKills from '../PlayerMultiKills/'
import PlayerFragSummary from '../PlayerFragSummary'
import PlayerCTFSummary from '../PlayerCTFSummary/'
import PlayerGeneral from '../PlayerGeneral/'
import PlayerGametypeStats from '../PlayerGametypeStats'




const PlayerSummary = ({summary, flag, country, gametypeStats, gametypeNames, face}) =>{

    

    summary = JSON.parse(summary);
    
    console.log(summary)

    /*<PlayerGeneral data={[
                country,
                flag,
                summary.playtime,
                summary.matches,
                summary.wins,
                summary.draws,
                summary.losses
            ]} />*/

    return (
        <div>

            
            <PlayerGeneral 
                country={country}
                flag={flag}
                face={face}
            />

            <PlayerGametypeStats data={gametypeStats} names={gametypeNames}/>

            <PlayerFragSummary data={[
                summary.score,
                summary.frags,
                summary.kills,
                summary.deaths,
                summary.suicides,
                summary.team_kills,
                summary.spawn_kills,
                summary.efficiency,
                summary.first_bloods,
                summary.accuracy
            ]}/>

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