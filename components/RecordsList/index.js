import styles from './RecordsList.module.css';
import Functions from '../../api/functions';
import CountryFlag from '../CountryFlag/';
import Link from 'next/link';

const RecordsList = ({mode, data, page, perPage, record}) =>{

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

        if(mode === 0){

            rows.push(<tr key={i}>
                <td>{place}{Functions.getOrdinal(place)}</td>
                <td><Link href={`/player/${d.id}`}><a><CountryFlag country={d.country}/>{d.name}</a></Link></td>
                <td>{d.matches}</td>
                <td>{(d.playtime / (60 * 60)).toFixed(2)} Hours</td>
                <td>{d.value}</td>
                <td className={offsetClassName}>{currentOffset}</td>
            </tr>);

        }else{

            rows.push(<tr key={i}>
                <td>{place}{Functions.getOrdinal(place)}</td>
                <td><Link href={`/player/${d.player_id}`}><a><CountryFlag country={d.country}/>{d.name}</a></Link></td>
                <td><Link href={`/match/${d.match_id}`}><a>{d.map}</a></Link></td>
                <td>{(d.playtime / (60 * 60)).toFixed(2)} Hours</td>
                <td>{d.value}</td>
                <td className={offsetClassName}>{currentOffset}</td>
            </tr>);
        }
    }

    const headers = [];

    const totalTitles = [
        "Place",
        "Player",
        "Matches",
        "Playtime",
        "Value",
        "Offset",
    ];

    const playerTitles = [
        "Place",
        "Player",
        "Map",
        "Playtime",
        "Value",
        "Offset"
    ];

    const titles = (mode === 0) ? totalTitles : playerTitles;


    for(let i = 0; i < titles.length; i++){

        headers.push(<th key={i}>
            {titles[i]}
        </th>);
    }
    
    return <div className="special-table">
        <table className={`${styles.table}`}>
            <tbody>
                <tr>
                    {headers}
                </tr>
                {rows}
            </tbody>
        </table>
    </div>
}

export default RecordsList;