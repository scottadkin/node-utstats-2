import styles from './MapDefaultBox.module.css';
import Link from 'next/link';
import React from 'react';
import { convertTimestamp, toPlaytime, removeUnr, cleanMapName } from '../../api/generic.mjs';

function getImage(image, host){
        
    return `${host}/images/maps/thumbs/${image}.jpg`;
}

const MapDefaultBox = ({host, data}) =>{

    const imageUrl = getImage(data.image, host);

    return <Link href={`/map/${data.id}`}>
        <div className={styles.wrapper}>
            <div className={styles.title}>
                {removeUnr(data.name)}
            </div>
            <img className="thumb-sshot" src={imageUrl} alt="image"/>
            <div className={styles.info}>
                
                {data.matches} {(data.matches === 1) ? "Match" : "Matches"}<br/>
                Playtime {toPlaytime(data.playtime)}<br/>
                First {convertTimestamp(data.first, true)}<br/>
                Last {convertTimestamp(data.last, true)}<br/>
            </div>
        </div>
    </Link>;
}

export default MapDefaultBox;
