import InteractiveTable from "../InteractiveTable";
import { getTeamColor } from "../../api/generic.mjs";

const ServerQueryAllOnlinePlayers = ({state}) =>{


    if(state.bLoading) return null;

    console.log(state);
    const headers = {
        "name": "Player",
        "server": "Server",
        "frags": "Frags"
    };

    const data = state.currentPlayers.map((p) =>{

        const serverName = state.serverNames[p.server] ?? "Not Found";

        return {
            "name": { "className": getTeamColor(p.team), "value": p.name.toLowerCase(), "displayValue": p.name},
            "server": { "value": serverName.toLowerCase(), "displayValue": serverName},
            "frags": { "value": p.frags},
        };
    });

    return <>
        <div className="default-header">Online Players</div>
        <InteractiveTable width={1} headers={headers} data={data}/>
    </>;

}

export default ServerQueryAllOnlinePlayers;