"use client"
import Countries from '../../../../api/countries';
import styles from './CountryFlag.module.css';
import { useState } from 'react';

const renderHoverElem = (bDisplay, flag, image) =>{

    if(!bDisplay) return null;

    return <div className={styles.mouse}>
        <div className={styles["country-name"]}>{flag.country}</div>
        <img src={image} alt="big-flag" />
    </div>
}

const CountryFlag = ({country, bNoHover, small}) =>{

    const [bDisplay, setBDisplay] = useState(false);

    if(bNoHover === undefined) bNoHover = false;
    if(small === undefined) small = false;

    let width = 16;
    let height = 10;

    if(small){
        width = 12;
        height = 8;
    }

    const flag = Countries(country);

    const url = `/images/flags/${flag.code.toLowerCase()}.svg`;

    const inner = <>
        {renderHoverElem(bDisplay, flag, url)}
        <img className="country-flag" src={url} alt="flag"/>
    </>;

    if(bNoHover){
        return <div className={styles.wrapper}>{inner}</div>
    }

    return <div className={styles.wrapper} onMouseOver={(() =>{
        setBDisplay(true);
    })} onMouseLeave={(() =>{
        setBDisplay(false);
    })}>
        {inner}
    </div>
}

export default CountryFlag;