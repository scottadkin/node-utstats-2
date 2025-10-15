import InteractiveTable from "../InteractiveTable";
import { convertTimestamp, toPlaytime, ignore0 } from "../../../../api/generic.mjs";

function renderData(data){

    if(data === null) return null;

    const headers = {
        "name": "Name",
        "last": "Last Played",
        "matches": "Matches",
        "wins": "Wins",
        "playtime": "Playtime",
        "spec": "Spectime",
        "acc": "Last Accuracy",
        "kills": "Kills",
        "deaths": "Deaths",
        "eff": "Efficiency"
    };

    const tableData = data.map((d) =>{
        return {
            "name": {
                "value": d.gametypeName.toLowerCase(), 
                "displayValue": d.gametypeName,
                "className": "text-left"
            },
            "last": {
                "value": d.last,
                "displayValue": convertTimestamp(d.last, true),
                "className": "date"
            },
            "matches": {
                "value": d.matches
            },
            "wins": {
                "value": d.wins,
                "displayValue": ignore0(d.wins),
            },
            "playtime": {
                "value": d.playtime,
                "displayValue": toPlaytime(d.playtime),
                "className": "playtime"
            },
            "spec": {
                "value": d.spec_playtime,
                "displayValue": toPlaytime(d.spec_playtime),
                "className": "playtime"
            },
            "acc": {
                "value": d.accuracy,
                "displayValue": `${d.accuracy.toFixed(2)}%`
            },
            "kills": {
                "value": d.kills
            },
            "deaths": {
                "value": d.deaths
            },
            "eff": {
                "value": d.efficiency,
                "displayValue": `${d.efficiency.toFixed(2)}%`
            }
        }
    });

    return <InteractiveTable headers={headers} data={tableData} width={1} defaultOrder={"name"}/>
}

export default function PlayerGametypeStats({data}){

    return <>
        <div className="default-header">Gametypes Summary</div>
        {renderData(data)}
    </>
}