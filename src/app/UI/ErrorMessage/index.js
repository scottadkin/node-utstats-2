import styles from './ErrorMessage.module.css';


export default function ErrorMessage({text, title}){

    if(text == null) return null;

    return <div className={styles.wrapper}>
        <div className={styles.title}>
            <b>{title ?? "Error"}</b>
        </div>
        <div className={styles.text}>
            {text ?? "No error text supplied."}
        </div>
    </div>
}
