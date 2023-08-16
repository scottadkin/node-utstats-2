import styles from "./NotificationsCluster.module.css";

const NotificationsCluster = ({notifications, hide, clearAll}) =>{

    const elems = [];

    for(let i = 0; i < notifications.length; i++){

        const {id, type, content, bDisplay} = notifications[i];

        if(!bDisplay) continue;

        let className = "";
        let title = "";

        if(type === "pass"){
            className = "team-green";
            title = "Success";
        }else if(type === "error"){
            className = "team-red";
            title = "Error";
        }else if(type === "warning"){
            className = "team-yellow";
            title = "Warning";
        }else if(type === "note"){
            className = "purple";
            title = "Note";
        }

        elems.push(<div key={i} className={`${styles.notification} ${className}`}>
            <div className={styles.close} onClick={() =>{
                hide(id);
            }}>X</div>
            <div className={styles.title}>{title}</div>
            <div className={styles.content}>{content}</div>
        </div>);
    }

    return <>  
        <div className={styles.wrapper}>
            {(elems.length === 0 || clearAll == undefined) ? null :
                <div className={`${styles["clear-all"]} hover`} onClick={clearAll}>Clear All Notifications</div>
            }
            {elems}
        </div>
    </>
}

export default NotificationsCluster;