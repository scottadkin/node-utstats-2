import styles from './MatchCTFCapBox.module.css';
import Image from 'next/image';

const MatchCTFCapBox = ({title, image, value}) =>{

    return <div className={styles.box}>
        <div className={styles.title}>{title}</div>
        <div className={styles.image}>
            <Image src={`/images/${image}`} width={90} height={90} alt="image"/>
        </div>
        <div className={styles.value}>{value}</div>
    </div>;
}

export default MatchCTFCapBox;