import InteractiveTable from "../InteractiveTable";
import Functions from "../../api/functions";

const renderData = (gametypeNames, data, selectedTab) =>{

    let headers = {   
        "time": "Carry Time",
        "kills": "Kills With Flag",
        "bestKills": "Most Kills With Flag",
        "good": {"title": "Good Kills With Flag", "content": "Kills the player got while carrying the flag, and the flag was captured."},
        "bad": {"title": "Failed Kills With Flag", "content": "Kills the player got while carrying the flag, but the flag was returned by the enemy team."},
        "eff": {"title": "Kills Efficiency", "content": "What percentage of the player's kills while carrying the flag were the flag was captured."}
    };

    if(selectedTab !== 0){
        headers = Object.assign({"gametype": "Gametype"}, headers);
    }

    const rows = [];
    
    for(let i = 0; i < data.length; i++){

        const d = data[i];

        if(selectedTab === 0){
            if(d.gametype_id !== 0) continue;
        }else{
            if(d.gametype_id === 0) continue;
        }
        
        const gametypeName = gametypeNames[d.gametype_id] ?? "Not Found";

        let eff = 0;

        if(d.flag_self_cover > 0){

            if(d.flag_self_cover_pass > 0){
                eff = (d.flag_self_cover_pass / d.flag_self_cover) * 100;
            }
        }

        const current = {
            "gametype": {"value": gametypeName.toLowerCase(), "displayValue": gametypeName, "className": "text-left"},
            "time": {"value": d.flag_carry_time, "displayValue": Functions.toPlaytime(d.flag_carry_time), "className": "playtime"},
            "kills": {"value": d.flag_self_cover, "displayValue": Functions.ignore0(d.flag_self_cover)},
            "bestKills": {"value": d.best_single_self_cover, "displayValue": Functions.ignore0(d.best_single_self_cover)},
            "bad": {"value": d.flag_self_cover_fail, "displayValue": Functions.ignore0(d.flag_self_cover_fail)},
            "good": {"value": d.flag_self_cover_pass, "displayValue": Functions.ignore0(d.flag_self_cover_pass)},
            "eff": {"value": eff, "displayValue": `${eff.toFixed(2)}%`}

        };

        rows.push(current);
        
    }

    
    return <>
        <InteractiveTable width={1} headers={headers} data={rows}/>
    </>;
}

const PlayerCTFSummaryCarry = ({gametypeNames, data, recordType}) =>{

    return <div>   
        {renderData(gametypeNames, data, recordType)}
    </div>
}

export default PlayerCTFSummaryCarry;