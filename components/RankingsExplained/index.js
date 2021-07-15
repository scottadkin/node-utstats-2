import styles from './RankingsExplained.module.css';

const createRow = (data) =>{
    return <tr>
        <td>{data.name}</td>
        <td>{data.description}</td>
        <td>{data.value}</td>
    </tr>
}

const RankingsExplained = ({settings}) =>{

    const settingsObject = {};

    let s = 0;

    for(let i = 0; i < settings.length; i++){

        s = settings[i];

        settingsObject[s.name] = {
            "value": s.value,
            "name": s.display_name,
            "description": s.description
        };
    }

    return <div>
        <div className="default-header">Rankings Explained</div>

        <div className="default-sub-header">Frags</div>

        <table className={`t-width-1 ${styles.table}`}>
            <tbody>
                <tr>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Points Per Event</th>
                </tr>
                {createRow(settingsObject.frags)}
                {createRow(settingsObject.deaths)}
                {createRow(settingsObject.suicides)}
                {createRow(settingsObject.team_kills)}
            </tbody>
        </table>

        <div className="default-sub-header">
            Multi Kills
        </div>

        <table className={`t-width-1 ${styles.table}`}>
            <tbody>
                <tr>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Points Per Event</th>
                </tr>
                {createRow(settingsObject.multi_1)}
                {createRow(settingsObject.multi_2)}
                {createRow(settingsObject.multi_3)}
                {createRow(settingsObject.multi_4)}
                {createRow(settingsObject.multi_5)}
                {createRow(settingsObject.multi_6)}
                {createRow(settingsObject.multi_7)}
                
            </tbody>
        </table>

        <div className="default-sub-header">
            Killing Sprees
        </div>
        <table className={`t-width-1 ${styles.table}`}>
            <tbody>
                <tr>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Points Per Event</th>
                </tr>
                {createRow(settingsObject.spree_1)}
                {createRow(settingsObject.spree_2)}
                {createRow(settingsObject.spree_3)}
                {createRow(settingsObject.spree_4)}
                {createRow(settingsObject.spree_5)}
                {createRow(settingsObject.spree_6)}
                {createRow(settingsObject.spree_7)}
                
            </tbody>
        </table>

        <div className="default-sub-header">
            Capture the Flag
        </div>
        <table className={`t-width-1 ${styles.table}`}>
            <tbody>
                <tr>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Points Per Event</th>
                </tr>
                {createRow(settingsObject.flag_taken)}
                {createRow(settingsObject.flag_pickup)}
                {createRow(settingsObject.flag_return)}
                {createRow(settingsObject.flag_save)}
                {createRow(settingsObject.flag_capture)}
                {createRow(settingsObject.flag_seal)}
                {createRow(settingsObject.flag_assist)}
                {createRow(settingsObject.flag_kill)}
                {createRow(settingsObject.flag_dropped)}
                {createRow(settingsObject.flag_cover)}
                {createRow(settingsObject.flag_cover_pass)}
                {createRow(settingsObject.flag_cover_fail)}
                {createRow(settingsObject.flag_self_cover)}
                {createRow(settingsObject.flag_self_cover_pass)}
                {createRow(settingsObject.flag_self_cover_fail)}
                {createRow(settingsObject.flag_multi_cover)}
                {createRow(settingsObject.flag_spree_cover)}
  
                
            </tbody>
        </table>

        <div className="default-sub-header">
            Assault
        </div>
        <table className={`t-width-1 ${styles.table}`}>
            <tbody>
                <tr>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Points Per Event</th>
                </tr>
                {createRow(settingsObject.assault_objectives)}
            </tbody>
        </table>

        <div className="default-sub-header">
            Domination
        </div>
        <table className={`t-width-1 ${styles.table}`}>
            <tbody>
                <tr>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Points Per Event</th>
                </tr>
                {createRow(settingsObject.dom_caps)}
            </tbody>
        </table>

        <div className="default-sub-header">
            MonsterHunt
        </div>
        <table className={`t-width-1 ${styles.table}`}>
            <tbody>
                <tr>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Points Per Event</th>
                </tr>
                {createRow(settingsObject.mh_kills)}
            </tbody>
        </table>
        
    </div>
}


export default RankingsExplained;