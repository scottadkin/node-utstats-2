import TimeStamp from '../TimeStamp/';
import styles from './HomeMostPlayedGametypes.module.css';
import Image from 'next/image';
import Functions from '../../api/functions';

const HomeMostPlayedGametypes = ({data, images}) =>{
    
    data = JSON.parse(data);

    const elems = [];

    const defaultImage = "default.jpg";

    let currentImage = "";


    for(let i = 0; i < data.length; i++){

        const d = data[i];

        const currentName = d.name.replace(/ /ig, '').toLowerCase();


        if(images[currentName] !== undefined){
            currentImage = images[currentName];
        }else{
            currentImage = defaultImage;
        }

        const originalLength = d.name.length;

        d.name = d.name.slice(0, 40);

        if(d.name.length < originalLength){
            d.name += "...";
        }

        elems.push(<div className={styles.box} key={i}>
            <div className={styles.name}>{d.name}</div>
            <div className={styles.image}><Image src={`/images/gametypes/${currentImage}`} width="400" height="225"/></div>
            <div className={styles.info}>
                <span className="yellow">Playtime</span> {(d.playtime / (60 * 60)).toFixed(2)} Hours<br/>
                {d.matches} <span className="yellow">Matches</span><br/> 
                <span className="yellow">First Match</span> {Functions.convertTimestamp(d.first, true)}<br/>
                <span className="yellow">Last Match</span> {Functions.convertTimestamp(d.last, true)}<br/>
            </div>
        </div>);
    }


    return <div className="special-table center">
        <div className="default-header">Most Played Gametypes</div>
        {elems}
    </div>
}


export default HomeMostPlayedGametypes;