import styles from './Loading.module.css';
import Image from 'next/image';


export default function Loading({value, children}){

    if(value !== undefined){
        if(value) return null;
    }

    return <div className={styles.wrapper}>
        <Image src={`/images/loading.png`} width={32} height={32} alt="Image"/>
        <div className={styles.text}>
            {(children !== undefined) ? children : "Loading Please wait..."}
        </div>
    </div>;
}
