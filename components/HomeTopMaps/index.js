import Functions from '../../api/functions';
import Link from 'next/link';
import styles from './HomeTopMaps.module.css';
import Image from 'next/image';

const HomeTopMaps = ({maps, images, classic, host}) =>{

    maps = JSON.parse(maps);
    images = JSON.parse(images);

    if(classic === undefined) classic = false;

    const elems = [];

    for(let i = 0; i < maps.length; i++){

        const m = maps[i];

        let currentImage = 0;

        const first = (m.first !== undefined) ? m.first : Functions.utDate(m.first_match);
        const last = (m.last !== undefined) ? m.last : Functions.utDate(m.last_match);
        const matches = (m.matches !== undefined) ? m.matches : m.total_matches ;

        const currentImageIndex = images.indexOf(Functions.cleanMapName(m.name).toLowerCase());

        const playtime = (m.playtime !== undefined) ? m.playtime : m.gametime;

        const hours = (playtime > 0) ? playtime / (60 * 60) : 0;

        if(currentImageIndex === -1){
            currentImage = "default";
        }else{
            currentImage = images[currentImageIndex];
        }

        const id = (m.id !== undefined) ? m.id : Functions.removeUnr(m.name);


        elems.push(<Link key={i} href={`${(classic) ? "/classic" : "" }/map/${id}`}><a>
            <div className={styles.wrapper}>
                <div className={styles.name}>{Functions.removeUnr(m.name)} </div> 
                <Image src={`/images/maps/thumbs/${currentImage}.jpg`} height={225} width={400} alt="image" />
                <div className={styles.info}>
                    Playtime {hours.toFixed(2)} Hours<br/>
                    {matches} Matches<br/>
                    First Match {Functions.convertTimestamp(first, true)}<br/>
                    Last Match {Functions.convertTimestamp(last, true)}<br/>
                </div>
            </div>    
        </a></Link>);
    }

    return <div className="m-bottom-10">
        <div className="default-header">Most Played Maps</div>

        {elems}
    </div>
}


export default HomeTopMaps;