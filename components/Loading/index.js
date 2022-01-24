import styles from './Loading.module.css';

const Loading = ({}) =>{

    return <div className={styles.wrapper}>
        <img src={`/images/loading.png`} alt="Image"/>
        <div className={styles.text}>
            Loading Please wait...
        </div>
    </div>
}


export default Loading;