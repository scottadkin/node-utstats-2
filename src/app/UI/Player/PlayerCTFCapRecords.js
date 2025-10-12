import { toPlaytime } from "../../../../api/generic.mjs";
import InteractiveTable from "../InteractiveTable";

export default function PlayerCTFCapRecords({data}){

    if(data === null || data.length === 0) return null;


    const headers = {
        "gametype": "Gametype",
        "map": "Map",
        "time": "Cap Time"
    };

    const rows = data.map((d) =>{
        return {
            "gametype": {"value": d.gametypeName.toLowerCase(), "displayValue": d.gametypeName},
            "map": {"value": d.mapName.toLowerCase(), "displayValue": d.mapName},
            "time": {"value": d.travel_time, "displayValue": toPlaytime(d.travel_time, true), "className": "playtime purple"}
        };
    });

    return <>
        <div className="default-header">Capture The Flag Solo Cap Records</div>
        <InteractiveTable width={4} headers={headers} data={rows} />
    </>
}
