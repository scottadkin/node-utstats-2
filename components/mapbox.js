import styles from '../styles/MapBox.module.css'

function MapBox(props){


    return (
        <div class={styles.outter}>
            <div class={styles.name}>
                {props.data.name}
            </div>
            <div class={styles.title}>
                {props.data.title}
            </div>
            <div class={styles.image}>
                <img src="images/temp.jpg" alt="image"/>
            </div>
        </div>
    );
}

export default MapBox;