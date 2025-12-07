import CountryFlag from '../CountryFlag';
import Image from 'next/image';
import { convertTimestamp, toPlaytime } from '../../../../api/generic.mjs';
import {BasicTable} from "../Tables";
import React from 'react';

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

        <Image key="image" src={`/images/faces/${face}.png`} alt="face" width={46} height={46}/>,
        <React.Fragment key={"flag"}><CountryFlag country={data.country}/>{country}</React.Fragment>,
        {"className": "date", "value": convertTimestamp(data.first,true)},
        {"className": "date", "value": convertTimestamp(data.last,true)},
        data.matches,
        data.wins,
        data.draws,
        data.losses,
        <React.Fragment key={"wr"}>{data.winrate}%</React.Fragment>,
        {"className": "playtime", "value": toPlaytime(data.playtime)}
    ];

    return <>
        <div className="default-header">Basic Summary</div>
        <BasicTable width={1} headers={headers} rows={[row]}/>
    </>;
}
