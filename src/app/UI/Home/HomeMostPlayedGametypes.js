import styles from './HomeMostPlayedGametypes.module.css';
import { toPlaytime, convertTimestamp } from '../../../../api/generic.mjs';
import Link from 'next/link';

const HomeMostPlayedGametypes = ({data, images}) =>{
    
    const elems = [];

    const defaultImage = "default.jpg";

    let currentImage = "";

    for(let i = 0; i < data.length; i++){

        const d = data[i];

        let currentName = d.name.toLowerCase();
       
        currentName = currentName.replace(/ /ig, '');
        currentName = currentName.replace(/tournament/ig, '');
      
        if(images[currentName] !== undefined){
            currentImage = images[currentName];
        }else{
            currentImage = defaultImage;
        }

        if(currentImage === null) currentImage = defaultImage;

        const originalLength = d.name.length;

        let name = d.name.slice(0, 40);

        if(name.length < originalLength){
            name += "...";
        }

        elems.push(<Link href={`/matches?gametype=${d.id}`} key={i}>
            <div className={styles.box}>
                <div className={styles.name}>{name}</div>
                <div className={styles.image}><img src={`/images/gametypes/${currentImage}`} alt="image" className="thumb-sshot"/></div>
                <div className={styles.info}>
                    Playtime <span className="playtime">{toPlaytime(d.playtime)}</span><br/>
                    {d.matches} Matches<br/> 
                    First Match {convertTimestamp(d.first, true)}<br/>
                    Last Match {convertTimestamp(d.last, true)}<br/>
                </div>
            </div>
        </Link>);
    }


    return <div className="center">
        <div className="default-header">Most Played Gametypes</div>
        <div className={`center ${styles.wrapper}`}>
            {elems}
        </div>
    </div>
}


export default HomeMostPlayedGametypes;