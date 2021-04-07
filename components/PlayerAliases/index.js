import styles from './PlayerAliases.module.css';
import CountryFlag from '../CountryFlag/';
import Link from 'next/link';

const PlayerAliases = ({data}) =>{

    data = JSON.parse(data);

    const elems = [];

    let d = 0;

    for(let i = 0; i < data.length; i++){

        d = data[i];

        elems.push(<div className={styles.player} key={i}>
            <Link href={`/player/${d.id}`}><a><CountryFlag country={d.country}/>{d.name}</a></Link>
        </div>);
    }

    return <div className={styles.wrapper}>
        <div className="default-header">
            Possible Aliases
        </div>
        <div className={styles.players}>
            {elems}
        </div>
    </div>

}


export default PlayerAliases;