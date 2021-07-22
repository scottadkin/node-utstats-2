import TimeStamp from '../TimeStamp/';
import styles from './HomeMostPlayedGametypes.module.css';
import Image from 'next/image';

const HomeMostPlayedGametypes = ({data, images}) =>{
    
    data = JSON.parse(data);

    const elems = [];

    let d = 0;

    const defaultImage = "default.jpg";

    let currentImage = "";
    let currentName = "";

    for(let i = 0; i < data.length; i++){

        d = data[i];

        currentName = d.name.replace(/ /ig, '').toLowerCase();


        if(images[currentName] !== undefined){
            currentImage = images[currentName];
        }else{
            currentImage = defaultImage;
        }

        elems.push(<div className={styles.box} key={i}>
            <div className={styles.name}>{d.name}</div>
            <div className={styles.image}><Image src={`/images/gametypes/${currentImage}`} width="384" height="216"/></div>
            <div className={styles.info}>
                <span className="yellow">Playtime</span> {(d.playtime / (60 * 60)).toFixed(2)} Hours<br/>
                {d.matches} <span className="yellow">Matches</span><br/> 
                <span className="yellow">First</span> <TimeStamp timestamp={d.first}/><br/>
                <span className="yellow">Last</span> <TimeStamp timestamp={d.last}/><br/>
            </div>
        </div>);
    }


    return <div className="special-table center">
        <div className="default-header">Most Played Gametypes</div>
        {elems}
    </div>
}


export default HomeMostPlayedGametypes;