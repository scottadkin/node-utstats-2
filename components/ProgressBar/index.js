import styles from './ProgressBar.module.css';

const ProgressBar = ({percent}) =>{

    return <div className={`${styles.outter} center`}>
            <div className={styles.inner} style={{"width": `${percent}%`}}></div>
            <div className={styles.text}>{percent.toFixed(2)}% Complete</div>
        </div>
   
}


export default ProgressBar;