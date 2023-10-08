import styles from "./ServerQueryStatus.module.css";
import CustomGraph from "../CustomGraph";
import { toPlaytime } from "../../api/generic.mjs";


const ServerQueryStatus = ({server, history}) =>{

    const labels = [];

    for(let i = 0; i < 60 * 24; i++){

        let start = i * 60;

        if(start === 0) start = 1;
        const end = (i + 1) * 60;
        labels.push(`${toPlaytime(start)} - ${toPlaytime(end)} ago`);
    }

    const hourData = [];

    for(let i = 0; i < 60; i++){

        hourData.push(history.data[i]);
    }

    return <>
        <div className={styles.wrapper}>
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
        <CustomGraph 
            tabs={[
                {"name": "Past Hour", "title": `${server.server_name}`},
                {"name": "Past 24 Hours", "title": `${server.server_name}`},
                
            ]} 
            data={[
                    [{"name": "Player Count", "values": hourData}],
                    [{"name": "Player Count", "values": history.data}],   
                ]} 
            bEnableAdvanced={false}
            labelsPrefix={[""]}
            labels={[labels,labels]}        
        />
    </>
}

export default ServerQueryStatus;