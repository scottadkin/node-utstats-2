"use client"
import InteractiveTable from "../InteractiveTable";
import {MMSS, toPlaytime, scalePlaytime, getSmartCTFReturnString} from "../../../../api/generic.mjs";

function renderData(returnData, matchStart, bHardcore){

    const headers = {
        "grabbed": "Taken Timestamp",
        "returnTime": "Return Timestamp",
        "travel": "Total Time Taken",
        "carry": "Carry Time",
        "dropped": "Time Dropped",
        "distance": "Distance To Cap"
    };

    const data = returnData.map((currentReturn) =>{

        const returnTime = scalePlaytime(currentReturn.return_time - matchStart, bHardcore);
        const takenTime = scalePlaytime(currentReturn.grab_time - matchStart, bHardcore);
        const distance = currentReturn.distance_to_cap;

        return {
            "grabbed": {"value": takenTime, "displayValue": MMSS(takenTime)},
            "returnTime": {"value": returnTime, "displayValue": MMSS(returnTime)},
            "carry": {
                "value": currentReturn.carry_time, 
                "displayValue": toPlaytime(scalePlaytime(currentReturn.carry_time, bHardcore)),
                "className": "playtime"
            },
            "travel": {
                "value": currentReturn.travel_time,
                "displayValue": toPlaytime(scalePlaytime(currentReturn.travel_time, bHardcore)),
                "className": "playtime"
            },
            "dropped": {
                "value": currentReturn.drop_time,
                "displayValue": toPlaytime(scalePlaytime(currentReturn.drop_time, bHardcore)),
                "className": "playtime"
            },
            "distance": {
                "value": distance, 
                "displayValue": `${distance.toFixed(2)} (${getSmartCTFReturnString(currentReturn.return_string)})`
            }
        }
    });

    return <>
        <InteractiveTable width={1} headers={headers} data={data}/>
    </>
}


export default function PlayerMatchCTFReturns({players, data, matchStart, bHardcore}){

    if(players.length === 0) return null;
    if(players[0].ctfData === undefined) return null;

    return <>
        <div className="default-header">Capture The Flag Returns</div>
        {renderData(data, matchStart, bHardcore)}   
    </>
}