import Image from 'next/image';
import styles from './MapAssaultObjectives.module.css';

const getObjectImage = (images, mapName, name) =>{
    console.log(`name = ${name}`);

    /*name = name.toLowerCase();
    name = name.replace(/\s/ig, '');*/
    name = `/images/assault/${mapName}/${name}.jpg`

    for(let i = 0; i < images.length; i++){

        if(images[i] === name) return name;
    }

    return "/images/temp.jpg";
}

const MapAssaultObjectives = ({objects, mapPrefix, mapName, images}) =>{

    if(mapPrefix !== "as") return null;

    mapName = mapName.toLowerCase();

    const elems = [];

    objects = JSON.parse(objects);
    images = JSON.parse(images);

    let o = 0;

    let percent = 0;

    for(let i = 0; i < objects.length; i++){

        o = objects[i];
        
        percent = ((o.taken / o.matches) * 100).toFixed(2);

        if(o.taken === 0) percent = 0;

        elems.push(<div className={styles.box}>
            <div>
                <Image src={getObjectImage(images, mapName, o.obj_id)} width="200" height="112" />
            </div>
            <div>
                <span className={styles.name}>{o.name}</span><br/>
                Taken {o.taken} Times<br/><br/>
                Taken in {percent}% of Matches
            </div>
        </div>);
    }

    return <div className="m-bottom-10">
        <div className="default-header">Map Objectives</div>
        {elems}
    </div>

}

export default MapAssaultObjectives;