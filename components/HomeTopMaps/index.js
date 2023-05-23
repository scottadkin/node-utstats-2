import Functions from '../../api/functions';
import Link from 'next/link';
import styles from './HomeTopMaps.module.css';
import Playtime from '../Playtime';

const HomeTopMaps = ({maps, images, classic, host}) =>{

    maps = JSON.parse(maps);
    images = JSON.parse(images);
    
    if(classic === undefined) classic = false;

    const elems = [];

    for(let i = 0; i < maps.length; i++){

        const m = maps[i];

        let currentImage = "default";

        const last = (m.last !== undefined) ? m.last : Functions.utDate(m.last_match);
        const matches = (m.matches !== undefined) ? m.matches : m.total_matches ;

        const imageName = Functions.cleanMapName(m.name).toLowerCase();

        if(images[imageName] !== undefined){
            currentImage = images[imageName];
        }

        const id = (m.id !== undefined) ? m.id : Functions.removeUnr(m.name);


        elems.push(<Link key={i} href={`${(classic) ? "/classic" : "" }/map/${id}`}>
            <div className={styles.wrapper}>
                <div className={styles.name}>{Functions.removeUnr(m.name)} </div> 
                <img className="thumb-sshot" src={`${host}/images/maps/thumbs/${currentImage}.jpg`} alt="image" />
                <div className={styles.info}>
                    Playtime <Playtime timestamp={m.playtime}/><br/>
                    {matches} Matches<br/>
                    Last Match {Functions.convertTimestamp(last, true)}<br/>
                </div>
            </div>    
        </Link>);
    }

    return <div className="m-bottom-10">
        <div className="default-header">Most Played Maps</div>
        {elems}
    </div>
}


export default HomeTopMaps;