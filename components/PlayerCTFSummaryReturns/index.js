import InteractiveTable from "../InteractiveTable";
import Functions from "../../api/functions";

const renderData = (gametypeNames, data, selectedTab) =>{

    let headers = {   
        "returns": "Returns",
        "returnBase": "Base Returns",
        "returnMid": "Mid Returns",
        "returnEnemy": "Enemy Base Returns",
        "save": "Close Save",
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


        const current = {
            "gametype": {"value": gametypeName.toLowerCase(), "displayValue": gametypeName, "className": "text-left"},
            "returns": {"value": d.flag_return, "displayValue": Functions.ignore0(d.flag_return)},
            "returnBase": {"value": d.flag_return_base, "displayValue": Functions.ignore0(d.flag_return_base)},
            "returnMid": {"value": d.flag_return_mid, "displayValue": Functions.ignore0(d.flag_return_mid)},
            "returnEnemy": {"value": d.flag_return_enemy_base, "displayValue": Functions.ignore0(d.flag_return_enemy_base)},
            "save": {"value": d.flag_return_save, "displayValue": Functions.ignore0(d.flag_return_save)},
        };

        rows.push(current);
        
    }

    
    return <>
        <InteractiveTable width={1} headers={headers} data={rows}/>
    </>;
}

const PlayerCTFSummaryReturns = ({gametypeNames, data, recordType}) =>{

    return <div>   
        {renderData(gametypeNames, data, recordType)}
    </div>
}

export default PlayerCTFSummaryReturns;