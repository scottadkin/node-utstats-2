import styles from "./Info.module.css";

const Info = (props) =>{

    return <div className={`${styles.wrapper} center t-width-${props.width}`}>
        <div className={styles.header}>Info</div>
        <div className={styles.content}>
            {props.children}
        </div>
    </div>
}

export default Info;