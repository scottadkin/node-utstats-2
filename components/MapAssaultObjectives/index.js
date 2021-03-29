import Image from 'next/image';
import styles from './MapAssaultObjectives.module.css';

const MapAssaultObjectives = ({objects, mapPrefix}) =>{

    if(mapPrefix !== "as") return null;

    const elems = [];

    objects = JSON.parse(objects);

    let o = 0;


    for(let i = 0; i < objects.length; i++){

        o = objects[i];

        elems.push(<div className={styles.box}>
            <div>
                <Image src="/images/temp.jpg" width="200" height="112" />
            </div>
            <div>
                <span className={styles.name}>{o.name}</span><br/>
                Taken {o.taken} Times<br/><br/>
                Taken {((o.matches / o.taken) * 100).toFixed(2)}% of {o.matches} Matches
            </div>
        </div>);
    }

    return <div>
        <div className="default-header">Map Objectives</div>
        {elems}
    </div>

}

export default MapAssaultObjectives;