import styles from './HomeRecentPlayers.module.css';
import CountryFlag from '../../CountryFlag';
import Link from 'next/link';
import Image from 'next/image';

const HomeRecentPlayers = ({data, faces}) =>{

    if(data.length === 0) return null;


    const elems = [];

    for(const [k, v] of Object.entries(data)){

        const face = `/images/faces/${faces[Math.floor(Math.random() * faces.length)]}`;

        elems.push(
            <Link href={`/classic/player/${k}`} key={k}>
                <a>
                    <div className={styles.outter}>
                        <div className={styles.inner} >      
                            <div className={styles.left}>
                                <Image width={64} height={64} src={face} alt="face"/><br/>
                                <CountryFlag country={v.country}/>
                            </div>
                            <div className={styles.right}>
                                <div className={styles.name}>{v.name}</div>
                                <div className={styles.info}>
                                    <table className={styles.table}>
                                        <tbody>
                                            <tr>
                                                <td>Matches</td>
                                                <td>{v.matches}</td>
                                            </tr>
                                            <tr>
                                                <td>Playtime</td>
                                                <td>{v.gametime} Hours</td>
                                            </tr>
                                            <tr>
                                                <td>Score</td>
                                                <td>{v.gamescore}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </a>
            </Link>
        );

    }

    

    return <div className="m-bottom-25 t-width-1 center">
        <div className="default-header">Recent Players</div>
        {elems}
    </div>
}


export default HomeRecentPlayers;