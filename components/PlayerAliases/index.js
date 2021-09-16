import styles from './PlayerAliases.module.css';
import CountryFlag from '../CountryFlag/';
import Link from 'next/link';


const PlayerAliases = ({data, faces, masterName}) =>{

    data = JSON.parse(data);
    faces = JSON.parse(faces);


    const elems = [];

    let d = 0;

    for(let i = 0; i < data.length; i++){

        d = data[i];

        if(d.name.toLowerCase() === masterName.toLowerCase()){
            continue;
        }

        elems.push(<Link key={i} href={`/player/${d.id}`}><a><div className={styles.player}>
            <img className={styles.face} src={`/images/faces/${faces[d.face].name}.png`} alt="Image"/><br/>
            <div className={styles.name}><CountryFlag country={d.country}/>{d.name}</div>
        </div>
        </a></Link>);
    }

    if(elems.length === 0) return null;

    return <div> 
        <div className="default-header">
            Possible Aliases
        </div>

        <div className={`${styles.wrapper} m-bottom-10`}>
            
            <div className={styles.players}>
                {elems}
            </div>
        </div>
    </div>

}


export default PlayerAliases;