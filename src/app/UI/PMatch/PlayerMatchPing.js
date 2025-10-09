"use client"
import CustomGraph from "../CustomGraph";
import InteractiveTable from "../InteractiveTable";
import {MMSS, scalePlaytime} from "../../../../api/generic.mjs";

function renderTable(basicInfo){

    const headers = {"min": "Minimum", "average": "Average", "max": "Max"};
    const data = {
        "min": {"value": basicInfo.min},
        "average": {"value": basicInfo.average},
        "max": {"value": basicInfo.max},
    };

    return <InteractiveTable width={2} headers={headers} data={[data]}/>;
}

export default function PlayerMatchPing({data, matchStart, bHardcode}){

    if(data === null) return null;

    const graphLabels = data.graphData.graphText.map((d) =>{
        return MMSS(scalePlaytime(d - matchStart, bHardcode));
    });

    return <>
        <div className="default-header">Ping Summary</div>
        {renderTable(data.basicInfo)}
        <CustomGraph 
            tabs={[{"name": "Ping", "title": "Player Ping Over Time"}]}
            labels={[graphLabels]}
            labelsPrefix={[]}
            data={[[{"name":"Ping", "values": data.graphData.graphData[0].data}]]}
        />
    </>
}
