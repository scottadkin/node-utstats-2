import styles from './RecordsList.module.css';
import Functions from '../../api/functions';
import CountryFlag from '../CountryFlag/';
import Link from 'next/link';

const RecordsList = ({data, page, perPage, record}) =>{

    data = JSON.parse(data);
    record = JSON.parse(record);

    const rows = [];

    const recordValue = record[0].value;
    
    page--;

    let currentOffset = 0;
    let offsetClassName = "";
    let d = 0;
    let place = 0;

    for(let i = 0; i < data.length; i++){

        d = data[i];

        place = (perPage * page) + i + 1;

        currentOffset = recordValue - d.value;

        if(currentOffset <= 0){
            currentOffset = "";
            offsetClassName = "team-green";
        }else{
            currentOffset = `-${currentOffset}`
            offsetClassName = "team-red";
        }

        rows.push(<tr key={i}>
            <td>{place}{Functions.getOrdinal(place)}</td>
            <td><Link href={`/player/${d.id}`}><a><CountryFlag country={d.country}/>{d.name}</a></Link></td>
            <td>{d.matches}</td>
            <td>{(d.playtime / (60 * 60)).toFixed(2)} Hours</td>
            <td>{d.value}</td>
            <td className={offsetClassName}>{currentOffset}</td>
        </tr>);
    }
    
    return <div className="special-table">
        <table className={`${styles.table}`}>
            <tbody>
                <tr>
                    <th>Place</th>
                    <th>Player</th>
                    <th>Matches</th>
                    <th>Playtime</th>
                    <th>Value</th>
                    <th>Offset</th>
                </tr>
                {rows}
            </tbody>
        </table>
    </div>
}

export default RecordsList;