import styles from "./MessageBox.module.css";

export default function MessageBox({children, title}){

    return <div className={styles.wrapper}>
        <div className={styles.title}>{title ?? "No title specified"}</div>
        <div className={styles.content}>
            {children}
        </div>
    </div>
}