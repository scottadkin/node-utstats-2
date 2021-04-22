const MatchServerSettings = ({info}) =>{

    return <div>
        <div className="default-header">Server Settings</div>
        <table>
            <tbody>
                <tr>
                    <th>Setting</th>
                    <th>Value</th>
                </tr>
                <tr>
                    <td>Admin</td>
                    <td>{info.admin}</td>
                </tr>
                <tr>
                    <td>Email</td>
                    <td>{info.email}</td>
                </tr>
                <tr>
                    <td>Version</td>
                    <td>{info.version}</td>
                </tr>
                <tr>
                    <td>Min Client Version</td>
                    <td>{info.min_version}</td>
                </tr>
                <tr>
                    <td>Max Players</td>
                    <td>{info.max_players}</td>
                </tr>
                <tr>
                    <td>Max Spectators</td>
                    <td>{info.max_spectators}</td>
                </tr>
                <tr>
                    <td>Target Score</td>
                    <td>{info.target_score}</td>
                </tr>
                <tr>
                    <td>Time Limit</td>
                    <td>{info.time_limit}</td>
                </tr>
                <tr>
                    <td>Tournament</td>
                    <td>{(info.tournament) ? 'True' : 'False'}</td>
                </tr>
                <tr>
                    <td>Gamespeed</td>
                    <td>{info.game_speed}%</td>
                </tr>
                <tr>
                    <td>Air Control</td>
                    <td>{info.air_control * 100}%</td>
                </tr>
                <tr>
                    <td>Translocator</td>
                    <td>{(info.use_translocator) ? 'True' : 'False'}</td>
                </tr>
                <tr>
                    <td>Friendly Fire Scale</td>
                    <td>{info.friendly_fire_scale}%</td>
                </tr>
                <tr>
                    <td>Net Mode</td>
                    <td>{info.net_mode}</td>
                </tr>
                <tr>
                    <td>End Reason</td>
                    <td>{info.end_type}</td>
                </tr>
            </tbody>
        </table>
    </div>
}


export default MatchServerSettings;