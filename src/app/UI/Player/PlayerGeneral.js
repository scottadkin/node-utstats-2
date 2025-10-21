import Table2 from '../Table2';
import CountryFlag from '../CountryFlag';
import Image from 'next/image';
import { convertTimestamp, toPlaytime } from '../../../../api/generic.mjs';
import {BasicTable} from "../Tables";

export default function PlayerGeneral({country, face, data}){

    let flag = (data.flag === "") ? "xx" : data.flag;

    const headers = [
        "Face",
        "Country",
        "First Seen",
        "Last Seen",
        "Matches",
        "Wins",
        "Draws",
        "Losses",
        "Win Rate",
        "Playtime",
    ];

    const row = [

        <Image src={`/images/faces/${face}.png`} alt="face" width={46} height={46}/>,
        <><CountryFlag country={data.country}/>{country}</>,
        {"className": "date", "value": convertTimestamp(data.first,true)},
        {"className": "date", "value": convertTimestamp(data.last,true)},
        data.matches,
        data.wins,
        data.draws,
        data.losses,
        <>{data.winrate}%</>,
        {"className": "playtime", "value": toPlaytime(data.playtime)}
    ];

    return <>
        <div className="default-header">Basic Summary</div>
        <BasicTable width={1} headers={headers} rows={[row]}/>
    </>;
}
