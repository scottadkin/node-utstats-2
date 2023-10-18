import styles from "./ServerQueryStatus.module.css";
import CustomGraph from "../CustomGraph";
import { toPlaytime, getTeamColor } from "../../api/generic.mjs";
import Tabs from "../Tabs";
import { useState } from "react";
import InteractiveTable from "../InteractiveTable";

const renderGraph = (selectedTab, history) =>{

    if(selectedTab !== 1) return null;

    const hourData = [];
    const hourInfo = [];

    for(let i = 0; i < 60; i++){

        hourData.push(history.data[i]);
        hourInfo.push(history.info[i]);
    }

    const labels = [];
    const info = [];

    for(let i = 0; i < 60 * 24; i++){

        let start = i * 60;

        if(start === 0) start = 1;
        const end = (i + 1) * 60;
        labels.push(`${toPlaytime(start)} - ${toPlaytime(end)} ago`);
        info.push(history.info[i]);
    }

    return <>
        <CustomGraph 
            tabs={[
                {"name": "Past Hour", "title": `Player History Past Hour`},
                {"name": "Past 24 Hours", "title": `Player History Past 24 Hours`},
                
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
        />
    </>
}

const renderMapImage = (selectedTab, image) =>{

    if(selectedTab !== 2) return null;

    return <div className={styles.mimage}>
        <img src={`/images/maps/thumbs/${image}.jpg`} alt="image" />
    </div>;
}

const renderPlayers = (selectedTab, players) =>{

    if(selectedTab !== 0) return null;

    const headers = {
        "name": "Player",
        "frags": "Frags"
    };

    const data = players.map((p) =>{

        return {
            "name": {
                "value": p.name.toLowerCase(), 
                "displayValue": p.name,
                "className": getTeamColor(p.team)
            },
            "frags": {
                "value": p.frags,
                "className": getTeamColor(p.team)
            }
        }
    });
    return <InteractiveTable headers={headers} data={data}/>
}

const ServerQueryStatus = ({server, history, players}) =>{

    const [selectedTab, setSelectedTab] = useState(0);


    console.log(server);
    return <>
        
        <div className={styles.wrapper}>
            <div className={styles.title}>{server.server_name}</div>
            <div className={styles.map}>Playing {server.map_name} </div>
            <div className={styles.pcount}>Players {server.current_players}/{server.max_players}</div>
            <div className={styles.address}>
                <a href={`unreal://${server.ip}:${server.port}`}>unreal://{server.ip}:{server.port}</a>
            </div>
           
            <Tabs 
                options={[
                    {"name": "Current Players", "value": 0},
                    {"name": "Player History", "value": 1},
                    {"name": "Map Image", "value": 2},
                    
                ]}
                selectedValue={selectedTab}
                changeSelected={setSelectedTab}
            />
            {renderPlayers(selectedTab, players)}
            {renderMapImage(selectedTab, server.image)}
            {renderGraph(selectedTab, history)}
            
        </div>
        
    </>
}

export default ServerQueryStatus;