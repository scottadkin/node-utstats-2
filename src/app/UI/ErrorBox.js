import styles from "./ErrorBox.module.css";

export default function ErrorBox({children, title}){

    console.log(`children = ${children}`);

    if(children == null) return null;

    return <div className={styles.wrapper}>
        <div className={styles.title}>{title ?? "No title supplied"}</div>
        <div className={styles.content}>
            {children}
        </div>
    </div>
}