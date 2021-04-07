import styles from './PlayerAliases.module.css';
import CountryFlag from '../CountryFlag/';
import Link from 'next/link';


const PlayerAliases = ({data, faces}) =>{

    data = JSON.parse(data);
    faces = JSON.parse(faces);

    const elems = [];

    let d = 0;

    for(let i = 0; i < data.length; i++){

        d = data[i];

        elems.push(<Link href={`/player/${d.id}`}><a><div className={styles.player} key={i}>
            <img src={`/images/faces/${faces[d.face].name}.png`} alt="Image"/><br/>
            <CountryFlag country={d.country}/>{d.name}
        </div>
        </a></Link>);
    }

    return <div className={`${styles.wrapper} m-bottom-10`}>
        <div className="default-header">
            Possible Aliases
        </div>
        <div className={styles.players}>
            {elems}
        </div>
    </div>

}


export default PlayerAliases;