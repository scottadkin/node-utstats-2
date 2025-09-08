import Link from 'next/link';
import styles from './HomeTopMaps.module.css';
import Image from 'next/image';
import { utDate, cleanMapName, removeUnr, convertTimestamp, toPlaytime } from "../../../../api/generic.mjs";

const HomeTopMaps = ({maps, images}) =>{

    const elems = [];

    for(let i = 0; i < maps.length; i++){

        const m = maps[i];

        let currentImage = "default";

        const last = (m.last !== undefined) ? m.last : utDate(m.last_match);
        const matches = (m.matches !== undefined) ? m.matches : m.total_matches ;

        const imageName = cleanMapName(m.name).toLowerCase();

        if(images[imageName] !== undefined){
            currentImage = images[imageName];
        }

        const id = (m.id !== undefined) ? m.id : removeUnr(m.name);


        elems.push(<Link key={i} href={`/map/${id}`}>
            <div className={styles.wrapper}>
                <div className={styles.name}>{removeUnr(m.name)} </div> 
                <Image src={`/images/maps/${currentImage}.jpg`} alt="image" width={350} height={196}/>
                <div className={styles.info}>
                    Playtime {toPlaytime(m.playtime)}<br/>
                    {matches} Matches<br/>
                    Last Match {convertTimestamp(last, true)}<br/>
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