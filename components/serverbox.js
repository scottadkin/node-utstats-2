import Link from 'next/link';
import styles from '../styles/ServerBox.module.css'

export default function ServerBox(props){

    console.log(props);

    const d = props.data;


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
                        First {new Date(d.first * 1000).toString()}<br/>
                        Last {new Date(d.last * 1000).toString()}<br/>
                    </div>
                </div>
            </a>
        </Link>
    );
}