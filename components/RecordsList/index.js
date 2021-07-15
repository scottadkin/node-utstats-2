import styles from './RecordsList.module.css';
import Functions from '../../api/functions';
import CountryFlag from '../CountryFlag/';
import Link from 'next/link';

const RecordsList = ({mode, type, title, data, page, perPage, record}) =>{

    if(data === "[]"){
        return <div>
            There is currently no data for this record type.
        </div>
    }
    data = JSON.parse(data);
    record = JSON.parse(record);

    mode = parseInt(mode);

    const rows = [];

    if(record.length === 0) return null;

    const recordValue = record[0].value;
    
    page--;

    let currentOffset = 0;
    let offsetClassName = "";
    let d = 0;
    let place = 0;
    let currentValue = 0;

    

    for(let i = 0; i < data.length; i++){

        d = data[i];

        place = (perPage * page) + i + 1;

        if(type !== "playtime" && type !== "flag_carry_time"){
            currentOffset = recordValue - d.value;
        }else{
            if(mode === 0){
                currentOffset = (recordValue / (60 * 60)) - (d.value / (60 * 60));
            }else{
                currentOffset = (recordValue / 60 ) - (d.value / 60);
            }
        }

        if(currentOffset % 1 !== 0){
            currentOffset = currentOffset.toFixed(2);

            if(type === "playtime" || type === "flag_carry_time"){
                if(mode === 0){
                    currentOffset = `${currentOffset} Hours`;
                }else{
                    currentOffset = `${currentOffset} Minutes`;
                }
            }
        }

        if(currentOffset <= 0){
            currentOffset = "";
            offsetClassName = "team-green";
        }else{
            currentOffset = `-${currentOffset}`
            offsetClassName = "team-red";
        }

        currentValue = d.value;

        if(type === "playtime" || type === "flag_carry_time"){

            if(mode === 0){

           
                currentValue = `${(currentValue / (60 * 60)).toFixed(2)} Hours`;
               

            }else{
                currentValue = `${(currentValue / 60).toFixed(2)} Minutes`;
            }

        }else{

            if(currentValue % 1 !== 0){
                currentValue = currentValue.toFixed(2);
            }

            if(type === "winrate" || type === "efficiency" || type === "accuracy"){
                currentValue = `${currentValue}%`;
            }
        }



        if(mode === 0){

            rows.push(<tr key={i}>
                <td>{place}{Functions.getOrdinal(place)}</td>
                <td><Link href={`/player/${d.id}`}><a><CountryFlag country={d.country}/>{d.name}</a></Link></td>
                <td>{d.matches}</td>
                {(type !== "playtime") ? <td>{(d.playtime / (60 * 60)).toFixed(2)} Hours</td> : null}
                <td>{currentValue}</td>
                <td className={offsetClassName}>{currentOffset}</td>
            </tr>);

        }else{

            rows.push(<tr key={i}>
                <td>{place}{Functions.getOrdinal(place)}</td>
                <td><Link href={`/player/${d.player_id}`}><a><CountryFlag country={d.country}/>{d.name}</a></Link></td>
                <td><Link href={`/match/${d.match_id}`}><a>{d.map}</a></Link></td>
                {(type !== "playtime") ? <td>{(d.playtime / (60 * 60)).toFixed(2)} Hours</td> : null}
                <td>{currentValue}</td>
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
        title,
        "Offset",
    ];

    const playerTitles = [
        "Place",
        "Player",
        "Map",
        "Playtime",
        title,
        "Offset"
    ];

    if(type === "playtime"){
        totalTitles.splice(3,1);
        playerTitles.splice(3,1);
    }

    const titles = (mode === 0) ? totalTitles : playerTitles;


    for(let i = 0; i < titles.length; i++){

        headers.push(<th key={i}>
            {titles[i]}
        </th>);
    }
    
    return <div className="special-table m-bottom-25">
        <table className={`${styles.table} t-width-1`}>
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