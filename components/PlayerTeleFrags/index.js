import InteractiveTable from "../InteractiveTable";
import Functions from "../../api/functions";
import {useState} from "react";
import Tabs from "../Tabs";

const PlayerTeleFrags = ({teleFrags, discKills}) =>{

    const [selectedTab, setSelectedTab] = useState(0);

    const data = (selectedTab === 0) ? teleFrags : discKills;

    const headers = {
        "kills": "Kills",
        "deaths": "Deaths",
        "eff": "Efficiency",
        "mostKills": {"title": "Most Kills", "content": "The most amount of kills a player had in a single match."},
        "mostDeaths": {"title": "Most Deaths", "content": "The most amount of deaths a player had in a single match."},
        "bestMulti": {
            "title": "Best Multi Kill", 
            "content": `The player's best multi kill of type ${(selectedTab === 0) ? "Telefrag Kill" : "Disc Kill"} in a short amount of time`
        },
        "bestSpree": {"title": "Best Spree", "content": `The most amount of ${(selectedTab === 0) ? "Telefrag" : "Disc"} kills in a single life`},
    };

    let eff = 0;

    if(data.kills > 0){
        if(data.deaths === 0){
            eff = 100;
        }else{

            eff = (data.kills / (data.kills + data.deaths)) * 100;
        }
    }

    const tableData = [
        {
            "kills": {"value": data.kills, "displayValue": Functions.ignore0(data.kills)},
            "deaths": {"value": data.deaths, "displayValue": Functions.ignore0(data.deaths)},
            "eff": {"value": eff, "displayValue": `${eff.toFixed(2)}%`},
            "mostKills": {"value": data.mostKills, "displayValue": Functions.ignore0(data.mostKills)},
            "mostDeaths": {"value": data.deathsWorst, "displayValue": Functions.ignore0(data.deathsWorst)},
            "bestMulti": {"value": data.bestMutli, "displayValue": data.bestMulti},
            "bestSpree": {"value": data.bestSpree, "displayValue": data.bestSpree},
        }
    ];

    const options = [
        {"name": "Telefrags", "value": 0},
        {"name": "Disc Kills", "value": 1}
    ];

    return <div>
        <div className="default-header">Telefrag Summary</div>
        <Tabs options={options} selectedValue={selectedTab} changeSelected={setSelectedTab}/>
        <InteractiveTable width={1} headers={headers} data={tableData}/>
    </div>
}

export default PlayerTeleFrags;