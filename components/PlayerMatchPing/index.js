import Graph from '../Graph';
import Functions from '../../api/functions';

const createTable = (data) =>{

    let total = 0;
    let average = 0;

    let min = null;
    let max = 0;

    for(let i = 0; i < data.length; i++){

        if(min === null) min = data[i].ping;
        if(data[i].ping < min) min = data[i].ping;
        if(data[i].ping > max) max = data[i].ping;

        
        total += data[i].ping;
    }

    if(total > 0 && data.length > 0){

        average = (total / data.length).toFixed(2);
    }

    return <div className="m-bottom-25">
        <table className="t-width-2">
            <tbody>
                <tr>
                    <th>Min Ping</th>
                    <th>Average Ping</th>
                    <th>Max Ping</th>
                </tr>
                <tr>
                    <td>{min}</td>
                    <td>{average}</td>
                    <td>{max}</td>
                </tr>
            </tbody>
        </table>
    </div>
}

const createGraphData = (data) =>{

    const graphData = [];
    const graphText = [];

    let d = 0;

    for(let i = 0; i < data.length; i++){

        d = data[i];
        graphData.push(d.ping);
        graphText.push(`Timestamp ${Functions.MMSS(d.timestamp)}`);
    }

    return {"data": graphData, "text": graphText };
}

//{title, data, text, minValue, maxValue}

const PlayerMatchPing = ({data}) =>{

    if(data.length === 0) return null;
 
    let graphData = createGraphData(data);

    return <div className="m-bottom-25">
        <div className="default-header">Ping Summary</div>
        {createTable(data)}
        <Graph title="Ping Over Time" data={
            JSON.stringify([{"name": "Ping", "data": graphData.data}])
        }
        text={JSON.stringify(graphData.text)}
        />
    </div>
}

export default PlayerMatchPing;