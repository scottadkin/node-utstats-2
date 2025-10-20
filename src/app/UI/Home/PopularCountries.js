"use client"
import { convertTimestamp } from '../../../../api/generic.mjs';
import styles from './PopularCountries.module.css';
import Image from 'next/image';
import InteractiveTable from "../InteractiveTable";
import CountryFlag from '../CountryFlag';
import Link from 'next/link';


const renderTable = (data, totalPlayers) =>{

    const headers = {
        "name": "Country",
        "first": "First Seen",
        "last": "Last Seen",
        "count": "Players",
        "percent": "Percent of Total Players"
    };

    const rows = data.map((info) =>{

        let percent = 0;

        if(totalPlayers > 0 && info.total_uses > 0){
            percent = (info.total_uses / totalPlayers) * 100;
        }

        return {
            "name": {
                "value": info.countryName.toLowerCase(), 
                "displayValue": <><CountryFlag country={info.country}/>{info.countryName}</>, 
                "className": "text-left"
            },
            "first": {
                "value": info.first_match,
                "displayValue": convertTimestamp(info.first_match, true),
                "className": "playtime"
            },
            "last": {
                "value": info.last_match,
                "displayValue": convertTimestamp(info.last_match, true),
                "className": "playtime"
            },
            "count": {
                "value": info.total_uses
            },
            "percent": {
                "value": percent,
                "displayValue": <>{percent.toFixed(2)}%</>,
            }
        }
    });

    return <InteractiveTable key="basic-table" headers={headers} data={rows} width={1}/>
}

const renderDefault = (data, totalPlayers) =>{

    const elems = data.map((d, i) =>{

        let percent = 0;

        if(totalPlayers > 0){
            percent = (d.total_uses / totalPlayers) * 100;
        }
        
        return <Link key={d.country} href={`/players?country=${d.country.toLowerCase()}`}>
            <div key={i} className={styles.country}>
                <div className={styles.name}>{d.countryName}</div>
                <div><Image src={`/images/flags/${d.country.toLowerCase()}.svg`} alt={d.country} width={190} height={100}/></div>
                <div className={styles.info}>
                    {d.total_uses} Players<br/>
                    {percent.toFixed(2)}% of all Players<br/>
                </div>
            </div>
        </Link>
    });


    return <div key="default" className="t-width-1 center">{elems}</div>;
}

const PopularCountries = ({data, totalPlayers, settings}) =>{

    if(data.length === 0) return null;
    const elems = [];

    if(settings["Popular Countries Display Type"] === "table") elems.push(renderTable(data, totalPlayers));
    if(settings["Popular Countries Display Type"] === "default") elems.push(renderDefault(data, totalPlayers));

    return <div className="default">
        <div className="default-header">Popular Countries</div>
        {elems}
    </div>
}

export default PopularCountries;