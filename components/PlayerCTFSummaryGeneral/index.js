import InteractiveTable from "../InteractiveTable";
import Functions from "../../api/functions";

const renderData = (gametypeNames, data, selectedTab) =>{

    let headers = {   
        "grabs": "Grab",
        "pickups": "Pickup",
        "drops": "Dropped",
        "caps":"Capture",
        "soloCaps":"Solo Capture",
        "assists":"Assist",
        "covers":"Cover",
        "seals":"Seal",
        "kills":"Kill",
        "suicides": "Suicides",
        "return":"Return",
        "save":"Close Save"
    };

    if(selectedTab > 2){
        delete headers.suicides;
    }

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

        rows.push({
            "gametype": {"value": gametypeName.toLowerCase(), "displayValue": gametypeName, "className": "text-left"},
            "grabs": {"value": d.flag_taken, "displayValue": Functions.ignore0(d.flag_taken)},
            "pickups": {"value": d.flag_pickup, "displayValue": Functions.ignore0(d.flag_pickup)},
            "drops": {"value": d.flag_dropped, "displayValue": Functions.ignore0(d.flag_dropped)},
            "caps": {"value": d.flag_capture, "displayValue": Functions.ignore0(d.flag_capture)},
            "soloCaps": {"value": d.flag_solo_capture, "displayValue": Functions.ignore0(d.flag_solo_capture)},
            "assists": {"value": d.flag_assist, "displayValue": Functions.ignore0(d.flag_assist)},
            "covers": {"value": d.flag_cover, "displayValue": Functions.ignore0(d.flag_cover)},
            "seals": {"value": d.flag_seal, "displayValue": Functions.ignore0(d.flag_seal)},
            "kills": {"value": d.flag_kill, "displayValue": Functions.ignore0(d.flag_kill)},
            "suicides": {"value": d.flag_suicide, "displayValue": Functions.ignore0(d.flag_suicide)},
            "return": {"value": d.flag_return, "displayValue": Functions.ignore0(d.flag_return)},
            "save": {"value": d.flag_return_save, "displayValue": Functions.ignore0(d.flag_return_save)}
        });        
    }

    
    return <>
        <InteractiveTable width={1} headers={headers} data={rows}/>
    </>;
}

const PlayerCTFSummaryGeneral = ({gametypeNames, data, recordType}) =>{

    return <div>   
        {renderData(gametypeNames, data, recordType)}
    </div>
}

export default PlayerCTFSummaryGeneral;