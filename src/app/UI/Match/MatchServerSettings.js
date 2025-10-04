import { BasicTable } from "../Tables"

export default function MatchServerSettings({info}){

    const rows = [
        ["Admin", info.admin, "Email", info.email],
        ["Version", info.version, "Min Client Version", info.min_version],
        ["Max Players", info.max_players, "Max Spectators", info.max_spectators],
        ["Target Score", info.target_score, "Time Limit", info.time_limit],
        ["Tournament", (info.tournament) ? 'True' : 'False', "Gamespeed", `${info.game_speed}%`],
        ["Air Control", `${info.air_control * 100}%`, "Translocatior", (info.use_translocator) ? 'True' : 'False'],
        ["Friendly Fire Scale", `${info.friendly_fire_scale}%`, "Net Mode", info.net_mode],
        ["End Reason", info.end_type, null, null]   
    ];

    const styles = ["text-right team-none", "text-left", "text-right team-none", "text-left"];

    return <>
        <div className="default-header">Server Settings</div>
        <BasicTable rows={rows} headers={["Setting", "Value", "Setting", "Value"]} columnStyles={styles}/>
    </>

}
