import CustomGraph from "../CustomGraph";

const renderGraph = (data) =>{

    const labels = [[],[],[],[]];

    for(let i = 0; i < 365; i++){

        if(i < 24) labels[0].push(`${i}-${i + 1} Hours ago`);
        if(i < 7) labels[1].push(`${i}-${i + 1} Days ago`);
        if(i < 28) labels[2].push(`${i}-${i + 1} Days ago`);
        if(i < 365) labels[3].push(`${i}-${i + 1} Days ago`);
    }

    return <>
        <CustomGraph 
            tabs={[
                {"name": "Past 24 Hours", "title": "Matches Played In The Past 24 Hours"},
                {"name": "Past 7 Days", "title": "Matches Played In The Past 7 Days"},
                {"name": "Past 28 Days", "title": "Matches Played In The Past 28 Days"},
                {"name": "Past Year", "title": "Matches Played In The Past Year"},
            ]}
            labels={labels}
            labelsPrefix={["","","",""]}
            data={data}
        />    
    </>
}

export default function MapHistoryGraph({data}){
    
    return <>
        <div className="default-header">Games Played</div>
        {renderGraph(data)}
    </>
}