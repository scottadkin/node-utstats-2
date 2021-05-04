const RankingsExplained = ({settings}) =>{

    const titles = {
        "multi_1": "Double Kill",
        "multi_2": "Multi Kill",
        "multi_3": "Mega Kill",
        "multi_4": "Ultra Kill",
        "multi_5": "Monster Kill",
        "multi_6": "Ludicrous Kill",
        "multi_7": "Holy Shit",
        "spree_1": "Killing Spree",
        "spree_2": "Rampage",
        "spree_3": "Dominating",
        "spree_4": "Unstoppable",
        "spree_5": "Godlike",
        "spree_6": "Too Easy",
        "spree_7": "Brutalizing the Competition",
        "frags": "Kills",
        "deaths": "Deaths",
        "suicides": "Suicides",
        "team_kills": "Team Kills",
        "flag_taken": "Flag Taken",
        "flag_pickup": "Flag Pickup",
        "flag_return": "Flag Return",
        "flag_capture": "Flag Capture",
        "flag_cover": "Flag Cover",
        "flag_seal": "Flag Seal",
        "flag_dropped": "Flag Dropped",
        "flag_assist": "Flag Assist",
        "flag_kill": "Flag Kill",
        "flag_save": "Flag Close Return",
        "flag_cover_pass": "Successful Flag Cover",
        "flag_self_cover": "Kills With Flag",
        "flag_self_cover_pass": "Successful Kills With Flag",
        "flag_self_cover_fail": "Failed Kills With Flag",
        "flag_cover_fail": "Failed Flag Cover",
        "flag_multi_cover": "Multi Cover",
        "flag_spree_cover": "Cover Spree",
        "dom_caps": "Domination Control Points",
        "assault_objectives": "Assault Objectives",
        "sub_half_hour_multiplier": "Less than 30 minutes playtime penalty",
        "sub_hour_multiplier": "Less than 1 Hour playtime penalty",
        "sub_2hour_multiplier": "Less than 2 Hours playtime penalty",
        "sub_3hour_multiplier": "Less than 3 Hours playtime penalty",
  
    }

    const rows = [];

    let currentTitle = "";

    let s = 0;

    for(let i = 0; i < settings.length; i++){

        s = settings[i];

        currentTitle = (titles[s.name] !== undefined) ? titles[s.name] : s.name;

        rows.push(<tr key={i}>
            <td>{currentTitle}</td>
            <td>{s.value}</td>
        </tr>);
    }

    return <div>
        <div className="default-header">Rankings Explained</div>

        <table className="td-1-left t-width-2">
            <tbody>
                <tr>
                    <th>Name</th>
                    <th>Value</th>
                </tr>
                {rows}
            </tbody>
        </table>
    </div>
}


export default RankingsExplained;