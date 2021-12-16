import styles from './MatchCTFCapBox.module.css';

const MatchCTFCapBox = ({title, image, value}) =>{

    return <div className={styles.box}>
        <div className={styles.title}>{title}</div>
        <div className={styles.image}>
            <img src={`/images/${image}`} alt="image"/>
        </div>
        <div className={styles.value}>{value}</div>
    </div>;
}

export default MatchCTFCapBox;