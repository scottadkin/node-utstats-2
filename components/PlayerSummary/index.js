import styles from './PlayerSummary.module.css';
import KillingSprees from '../KillingSprees/'
import MultiKills from '../MultiKills/'
import FragSummary from '../FragSummary/'
import CTFSummary from '../CTFSummary/'
import PlayerGeneral from '../PlayerGeneral/'
import GametypeStats from '../GametypeStats/'


const tempGetWeapon = (id, weaponNames) =>{

    for(let i = 0; i < weaponNames.length; i++){

        if(weaponNames[i].id === id) return weaponNames[i].name;
    }
    return 'Not Found';
}

const PlayerSummary = ({summary, flag, country, gametypeStats, gametypeNames, weaponStats, weaponNames}) =>{

    

    summary = JSON.parse(summary);
    
    //console.log(summary);

    weaponStats = JSON.parse(weaponStats);

    weaponNames = JSON.parse(weaponNames);

    console.log(weaponNames);

    const tempElems = [];

    for(let i = 0; i < weaponStats.length; i++){
        tempElems.push(
            <tr>
                <td>{tempGetWeapon(weaponStats[i].weapon, weaponNames)}</td>
                <td>{weaponStats[i].gametype}</td>
                <td>{weaponStats[i].matches}</td>
                <td>{weaponStats[i].kills}</td>
                <td>{weaponStats[i].deaths}</td>
                <td>{weaponStats[i].efficiency}%</td>
                <td>{weaponStats[i].shots}</td>
                <td>{weaponStats[i].hits}</td>
                <td>{weaponStats[i].accuracy}%</td>
                <td>{weaponStats[i].damage}</td>
            </tr>
        );
    }

    return (
        <div>

            <PlayerGeneral data={[
                country,
                flag,
                summary.playtime,
                summary.matches,
                summary.wins,
                summary.draws,
                summary.losses
            ]} />

            <GametypeStats data={gametypeStats} names={gametypeNames}/>

            <FragSummary data={[
                summary.score,
                summary.frags,
                summary.kills,
                summary.deaths,
                summary.suicides,
                summary.team_kills,
                summary.spawn_kills,
                summary.efficiency,
                summary.first_bloods
            ]}/>

            <MultiKills data={[
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

            <KillingSprees data={[
                summary.spree_1,
                summary.spree_2,
                summary.spree_3,
                summary.spree_4,
                summary.spree_5,
                summary.spree_6,
                summary.spree_7,
                summary.spree_best
            
            ]} />

            <CTFSummary data={[
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

            <div className="special-table">
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

            <div className="special-table">
                <div className="default-header">Weapon Stats</div>
                <table>
                    <tbody>
                        <tr>
                            <th>Weapon</th>
                            <th>Gametype</th>
                            <th>Matches</th>
                            <th>Kills</th>
                            <th>Deaths</th>
                            <th>Efficiency</th>
                            <th>Shots</th>
                            <th>Hits</th>
                            <th>Accuracy</th>
                            <th>Damage</th>
                        </tr>
                        {tempElems}
                    </tbody>
                </table>
            </div>

    
            
        </div>
    );

}

export default PlayerSummary;