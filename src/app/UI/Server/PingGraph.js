import CustomGraph from "../../UI/CustomGraph";
import { convertTimestamp } from "../../../../api/generic.mjs";

export default function PingGraph({data}){

    let labels = data.map((d, i) =>{
        return convertTimestamp(d.date, true);
    });

    labels = [
        [...labels]
    ];


    const minData = [];
    const averageData = [];
    const maxData = [];

    const pingLimit = 999;
    
    for(let i = 0; i < data.length; i++){

        const {min, average, max} = data[i];

        minData.push((min < pingLimit) ? min.toFixed(2) : pingLimit);
        averageData.push((average < pingLimit) ? average.toFixed(2) : pingLimit);
        maxData.push((max < pingLimit) ? max.toFixed(2) : pingLimit);
    }

    const labelsPrefix = [];

    return <>
        <div className="default-header">Recent Player Ping Summary</div>
        <CustomGraph data={[
            [
                {"name": "Minimum", "color": "green", "values": minData},
                {"name": "Average", "color": "blue", "values": averageData},
                {"name": "Max", "color": "red", "values": maxData},
            ],
        ]} tabs={[
            {"name": "pings", "title": "Average Player Pings"}
        ]} labels={labels} labelsPrefix={labelsPrefix} bEnableAdvanced={false}/>
    </>
}