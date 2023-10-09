import styles from "./ServerQueryStatus.module.css";
import CustomGraph from "../CustomGraph";
import { toPlaytime } from "../../api/generic.mjs";


const ServerQueryStatus = ({server, history}) =>{

    const labels = [];
    const info = [];

    for(let i = 0; i < 60 * 24; i++){

        let start = i * 60;

        if(start === 0) start = 1;
        const end = (i + 1) * 60;
        labels.push(`${toPlaytime(start)} - ${toPlaytime(end)} ago`);
        info.push(history.info[i]);
    }

    const hourData = [];
    const hourInfo = [];

    const test = {};

    for(let i = 0; i < 60; i++){

        hourData.push(history.data[i]);
        hourInfo.push(history.info[i]);
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
            info={[hourInfo,
                history.info
            ]}
            data={[
                    [{"name": "Player Count", "values": hourData}],
                    [{"name": "Player Count", "values": history.data}],   
                ]} 
            bEnableAdvanced={false}
            labelsPrefix={[""]}
            labels={[labels,labels]}        
            bSkipForceWholeYNumbers={true}
        />
    </>
}

export default ServerQueryStatus;