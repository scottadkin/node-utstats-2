import styles from './Loading.module.css';
import Image from 'next/image';

const Loading = ({}) =>{

    return <div className={styles.wrapper}>
        <Image src={`/images/loading.png`} width={50} height={50} alt="Image"/>
        <div className={styles.text}>
            Loading Please wait...
        </div>
    </div>
}


export default Loading;