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

    console.log(mapName);

    for(let i = 0; i < objects.length; i++){

        o = objects[i];

        if(mapName === "rook"){

            if(i === 1){

                elems.push(<div key={"rook-1"} className={styles.box}>
                    <div>
                        <Image src={getObjectImage(images, mapName, 1)} width="200" height="112" />
                    </div>
                    <div>
                        <span className={styles.name}>Gatehouse Chains</span><br/>
                        N/A
                    </div>
                </div>);

            }
        }
        
        percent = ((o.taken / o.matches) * 100).toFixed(2);

        if(o.taken === 0) percent = 0;

        elems.push(<div key={i} className={styles.box}>
            <div>
                <Image src={getObjectImage(images, mapName, o.obj_id)} width="200" height="112" />
            </div>
            <div>
                <span className={styles.name}>{o.name}</span><br/>
                Taken {o.taken} Times<br/><br/>
                Taken in {percent}% of Matches
            </div>
        </div>);

        
        if(i == objects.length - 1){

            if(mapName === "rook"){

                elems.push(<div key={"rook-end"} className={styles.box}>
                    <div>
                        <Image src={getObjectImage(images, mapName, 5)} width="200" height="112" />
                    </div>
                    <div>
                        <span className={styles.name}>End</span><br/>
                        N/A
                    </div>
                </div>);

            }else if(mapName === "overlord"){
                elems.push(<div key={"rook-end"} className={styles.box}>
                    <div>
                        <Image src={getObjectImage(images, mapName, 3)} width="200" height="112" />
                    </div>
                    <div>
                        <span className={styles.name}>End</span><br/>
                        N/A
                    </div>
                </div>);
            }
            
        }
        

        
    }

    return <div className="m-bottom-10">
        <div className="default-header">Map Objectives</div>
        {elems}
    </div>

}

export default MapAssaultObjectives;