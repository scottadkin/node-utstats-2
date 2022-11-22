import styles from './HomeMostPlayedGametypes.module.css';
import Functions from '../../api/functions';
import Playtime from '../Playtime';

const HomeMostPlayedGametypes = ({data, images, host}) =>{
    
    data = JSON.parse(data);

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

        d.name = d.name.slice(0, 40);

        if(d.name.length < originalLength){
            d.name += "...";
        }

        elems.push(<div className={styles.box} key={i}>
            <div className={styles.name}>{d.name}</div>
            <div className={styles.image}><img src={`${host}/images/gametypes/${currentImage}`} alt="image" className="thumb-sshot"/></div>
            <div className={styles.info}>
                Playtime <Playtime timestamp={d.playtime}/><br/>
                {d.matches} Matches<br/> 
                First Match {Functions.convertTimestamp(d.first, true)}<br/>
                Last Match {Functions.convertTimestamp(d.last, true)}<br/>
            </div>
        </div>);
    }


    return <div className="center">
        <div className="default-header">Most Played Gametypes</div>
        <div className={`center ${styles.wrapper}`}>
            {elems}
        </div>
    </div>
}


export default HomeMostPlayedGametypes;