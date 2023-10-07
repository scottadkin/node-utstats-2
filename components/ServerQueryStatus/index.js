import styles from "./ServerQueryStatus.module.css";

const ServerQueryStatus = ({server}) =>{

    return <div className={styles.wrapper}>
        <div className={styles.title}>{server.server_name}</div>
        <div className={styles.address}>
            <a href={`unreal://${server.ip}:${server.port}`}>{server.ip}:{server.port}</a>
        </div>
        <div className={styles.pcount}>Players {server.current_players}/{server.max_players}</div>
        <div className={styles.map}>{server.map_name}</div>
        <div className={styles.mimage}>
            <img src={`/images/maps/thumbs/${server.image}.jpg`} alt="image" />
        </div>
        
    </div>
}

export default ServerQueryStatus;