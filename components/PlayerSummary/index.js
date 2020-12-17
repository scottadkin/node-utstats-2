import styles from './PlayerSummary.module.css';
import KillingSprees from '../KillingSprees/'
import MultiKills from '../MultiKills/'
import FragSummary from '../FragSummary/'
import CTFSummary from '../CTFSummary/'
import PlayerGeneral from '../PlayerGeneral/'
import GametypeStats from '../GametypeStats/'


const PlayerSummary = ({summary, flag, country, gametypeStats, gametypeNames}) =>{

    

    summary = JSON.parse(summary);
    

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

            <GametypeStats data={gametypeStats} names={gametypeNames}/>
            
        </div>
    );

}

export default PlayerSummary;