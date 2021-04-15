import Functions from '../../api/functions';
import Link from 'next/link';
import Image from 'next/image';
import styles from './HomeTopMaps.module.css';
import TimeStamp from '../TimeStamp/';

const HomeTopMaps = ({maps, images}) =>{

    maps = JSON.parse(maps);
    images = JSON.parse(images);

    const elems = [];

    let currentImage = 0;
    let currentImageIndex = 0;
    let m = 0;

    for(let i = 0; i < maps.length; i++){

        m = maps[i];

        currentImageIndex = images.indexOf(Functions.cleanMapName(m.name).toLowerCase());

        if(currentImageIndex === -1){
            currentImage = "default";
        }else{
            currentImage = images[currentImageIndex];
        }


        elems.push(<Link href={`/map/${m.id}`}><a>
            <div className={styles.wrapper}>
                <div className={styles.name}>{Functions.removeUnr(m.name)} </div> 
                <Image src={`/images/maps/${currentImage}.jpg`} width="480" height="270"/>
                <div className={styles.info}>
                    <span className="yellow">Playtime</span> {(m.playtime / (60 * 60)).toFixed(2)} Hours<br/>
                    {m.matches} <span className="yellow">Matches</span><br/>
                    <span className="yellow">First</span> <TimeStamp timestamp={m.first}/><br/>
                    <span className="yellow">Last</span> <TimeStamp timestamp={m.last}/><br/>
                </div>
            </div>    
        </a></Link>);
    }

    return <div>
        <div className="default-header">Most Played Maps</div>

        {elems}
    </div>
}


export default HomeTopMaps;