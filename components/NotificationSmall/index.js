import styles from "./NotificationSmall.module.css";

const NotificationSmall = ({type, children}) =>{

    let colorClass = "team-red";
    let title = "Error";

    if(type === "warning"){
        colorClass = "team-yellow";
        title = "Warning";
    }

    if(type === "pass"){
        colorClass = "team-green";
        title = "Success";
    }

    return <div className={`${styles.wrapper} ${colorClass}`}>
        <div className={styles.title}>{title}</div>
        <div className={styles.content}>
            {children}
        </div>
    </div>
}

export default NotificationSmall;