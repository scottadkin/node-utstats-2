import CustomGraph from "../CustomGraph";
import { convertTimestamp } from "../../../../api/generic.mjs";


function renderGraph(data){


    const labels = data.labels.map((l) =>{
        return convertTimestamp(l, true);
    })

    return <CustomGraph 
        tabs={[
            {"name": "Ping", "title": "Recent Ping History"}
        ]}
        data={[data.data]}
        labels={[labels]}
        labelsPrefix={[""]}
    />
}

export default function PlayerPingHistory({data}){


    return <>
        <div className="default-header">Player Ping History</div>
        {renderGraph(data)}
    </>
}
