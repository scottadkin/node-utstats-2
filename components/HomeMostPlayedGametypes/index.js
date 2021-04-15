import TimeStamp from '../TimeStamp/';

const HomeMostPlayedGametypes = ({data}) =>{
    
    data = JSON.parse(data);

    const elems = [];

    let d = 0;

    for(let i = 0; i < data.length; i++){

        d = data[i];

        elems.push(<tr key={i}>
            <td>{d.name}</td>
            <td><TimeStamp timestamp={d.first} noDayName={true}/></td>
            <td><TimeStamp timestamp={d.last} noDayName={true}/></td>
            <td>{(d.playtime / (60 * 60)).toFixed(2)} Hours</td>
            <td>{d.matches}</td>
        </tr>);
    }

    let table = null;

    if(elems.length > 0){

        table = <table className="t-width-1">
            <tbody>
                <tr>
                    <th>Name</th>
                    <th>First</th>
                    <th>Last</th>
                    <th>Playtime</th>
                    <th>Matches</th>
                </tr>
                {elems}
            </tbody>
        </table>
    }else{
        return null;
    }

    return <div className="special-table">
        <div className="default-header">Most Played Gametypes</div>
        {table}
    </div>
}


export default HomeMostPlayedGametypes;