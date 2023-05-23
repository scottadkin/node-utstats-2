import styles from "./RankingsExplained.module.css";
import InteractiveTable from "../InteractiveTable";

const createRow = (data) =>{

    return {
        "type": {"value": data.name, "className": "text-left"},
        "description": {"value": data.description, "className": "text-left"},
        "penalty": {"value": data.value},
    };
}

const RankingsExplained = ({settings}) =>{

    const settingsObject = {};


    const headers = {
        "type": "Type",
        "description": "Description",
        "penalty": "Penalty"
    };

    const penalites = [
        "sub_half_hour_multiplier",
        "sub_hour_multiplier",
        "sub_2hour_multiplier",
        "sub_3hour_multiplier"
    ];

    for(let i = 0; i < settings.length; i++){

        const s = settings[i];

        settingsObject[s.name] = {
            "value": (penalites.indexOf(s.name) === -1) ? s.value: `${100 - (s.value * 100)}%`,
            "name": s.display_name,
            "description": s.description
        };
    }

    return <div>
        <div className="default-header">Rankings Explained</div>

        <div className="default-sub-header">
            Penalties
        </div>

        <InteractiveTable width={1} headers={headers} data={[
            createRow(settingsObject.sub_half_hour_multiplier),
            createRow(settingsObject.sub_hour_multiplier),
            createRow(settingsObject.sub_2hour_multiplier),
            createRow(settingsObject.sub_3hour_multiplier),
        ]}/>

        <InteractiveTable width={1} headers={headers} data={[
            createRow(settingsObject.sub_half_hour_multiplier),
            createRow(settingsObject.sub_hour_multiplier),
            createRow(settingsObject.sub_2hour_multiplier),
            createRow(settingsObject.sub_3hour_multiplier)
        ]}/>

        <div className="default-sub-header">Frags</div>

        <InteractiveTable width={1} headers={headers} data={[
            createRow(settingsObject.frags),
            createRow(settingsObject.deaths),
            createRow(settingsObject.suicides),
            createRow(settingsObject.team_kills),
        ]}/>

        <div className="default-sub-header">
            Multi Kills
        </div>

        <InteractiveTable width={1} headers={headers} data={[
            createRow(settingsObject.multi_1),
            createRow(settingsObject.multi_2),
            createRow(settingsObject.multi_3),
            createRow(settingsObject.multi_4),
            createRow(settingsObject.multi_5),
            createRow(settingsObject.multi_6),
            createRow(settingsObject.multi_7),
        ]}/>

        <div className="default-sub-header">
            Killing Sprees
        </div>
        <InteractiveTable width={1} headers={headers} data={[
            createRow(settingsObject.spree_1),
            createRow(settingsObject.spree_2),
            createRow(settingsObject.spree_3),
            createRow(settingsObject.spree_4),
            createRow(settingsObject.spree_5),
            createRow(settingsObject.spree_6),
            createRow(settingsObject.spree_7)
        ]}/>
        

        <div className="default-sub-header">
            Capture the Flag
        </div>
        <InteractiveTable width={1} headers={headers} data={[
            createRow(settingsObject.flag_taken),
            createRow(settingsObject.flag_pickup),
            createRow(settingsObject.flag_return),
            createRow(settingsObject.flag_save),
            createRow(settingsObject.flag_capture),
            createRow(settingsObject.flag_seal),
            createRow(settingsObject.flag_assist),
            createRow(settingsObject.flag_kill),
            createRow(settingsObject.flag_dropped),
            createRow(settingsObject.flag_cover),
            createRow(settingsObject.flag_cover_pass),
            createRow(settingsObject.flag_cover_fail),
            createRow(settingsObject.flag_self_cover),
            createRow(settingsObject.flag_self_cover_pass),
            createRow(settingsObject.flag_self_cover_fail),
            createRow(settingsObject.flag_multi_cover),
            createRow(settingsObject.flag_spree_cover),
        ]}/>

        <div className="default-sub-header">
            Assault
        </div>
        <InteractiveTable width={1} headers={headers} data={[
            createRow(settingsObject.assault_objectives)
        ]}/>

        <div className="default-sub-header">
            Domination
        </div>
        <InteractiveTable width={1} headers={headers} data={[
            createRow(settingsObject.dom_caps)
        ]}/>

        <div className="default-sub-header">
            MonsterHunt
        </div>
        <InteractiveTable width={1} headers={headers} data={[
            createRow(settingsObject.mh_kills)
        ]}/>
        
    </div>
}


export default RankingsExplained;