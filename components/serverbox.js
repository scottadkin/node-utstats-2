import Link from 'next/link';
import styles from '../styles/ServerBox.module.css'



function removeDateJunk(string){

    const reg = /^(.+?\d\d:\d\d:\d\d).*$/i;

    const result = reg.exec(string);

    if(result !== null){

        return result[1];
    }

    return string;
}

export default function ServerBox(props){

    console.log(props);

    const d = props.data;

    let playtime = d.playtime;

    if(playtime !== 0){

        playtime = playtime / (60 * 60);
    }



    return (
        <Link href={`server/${d.id}`} passHref>
            <a>
                <div className={styles.default}>
                    <div className={styles.title}>
                        {d.name}
                    </div>
                    <div className={styles.image}>
                        <img src="images/temp.jpg" />
                    </div>
                    <div className={styles.info}>
                        Matches {d.matches}<br/>
                        Playtime {playtime.toFixed(2)} Hours<br/>
                        First {removeDateJunk(new Date(d.first * 1000).toString())}<br/>
                        Last {removeDateJunk(new Date(d.last * 1000).toString())}<br/>
                    </div>
                </div>
            </a>
        </Link>
    );
}