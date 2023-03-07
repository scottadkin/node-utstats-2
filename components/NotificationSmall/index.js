import styles from "./NotificationSmall.module.css";

const NotificationSmall = ({type, title, children}) =>{

    let colorClass = "team-red";

    const bSetTitle = title === undefined;

    if(bSetTitle){
        title = "Error";
    }

    if(type === "warning"){

        colorClass = "team-yellow";
        if(bSetTitle) title = "Warning";
    }

    if(type === "pass"){

        colorClass = "team-green";
        if(bSetTitle) title = "Success";     
    }

    return <div className={`${styles.wrapper} ${colorClass}`}>
        <div className={styles.title}>{title}</div>
        <div className={styles.content}>
            {children}
        </div>
    </div>
}

export default NotificationSmall;