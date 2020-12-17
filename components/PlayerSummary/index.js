import styles from './PlayerSummary.module.css';
import KillingSprees from '../KillingSprees/'
import MultiKills from '../MultiKills/'
import FragSummary from '../FragSummary'


const PlayerSummary = ({summary}) =>{

    

    summary = JSON.parse(summary);

    console.log(summary);


    //const summary = p
    return (
        <div>

            <FragSummary data={[
                summary.score,
                summary.frags,
                summary.kills,
                summary.deaths,
                summary.suicides,
                summary.team_kills,
                summary.spawn_kills,
                summary.efficiency
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

            
        </div>
    );

}

export default PlayerSummary;