import styles from './MapBox.module.css'

function MapBox(props){


    return (
        <div className={styles.outter}>
            <div className={styles.name}>
                {props.data.name}
            </div>
            <div className={styles.title}>
                {props.data.title}
            </div>
            <div className={styles.image}>
                <img src="images/temp.jpg" alt="image"/>
            </div>
        </div>
    );
}

export default MapBox;