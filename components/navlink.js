import styles from '../styles/Home.module.css';
import Link from 'next/link';

export default function NavLink(props){

    return (
        <Link href={props.url}>
        <a className={styles.ni}>
            {props.text}
        </a>
        </Link>
    );
}
