import {React, useState} from 'react';
import styles from './AdminMatchControl.module.css';
import CountryFlag from '../CountryFlag/';
import Table2 from '../Table2';
import Functions from '../../api/functions';
import ErrorMessage from '../ErrorMessage';
import Loading from '../Loading';


const AdminMatchControl = ({players, matchId, mapId, gametypeId}) =>{

    const [deletedPlayers, setDeletedPlayers] = useState([]);
    const [error, setError] = useState(null);
    const [bLoading, setbLoading] = useState(false);


    const deletePlayer = async (playerId) =>{

        setbLoading(true);

        const req = await fetch("/api/matchadmin", {
            "headers": {"Content-Type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({
                "type": "deletePlayer", 
                "matchId": matchId,
                "playerId": playerId,
                "mapId": mapId,
                "gametypeId": gametypeId
            })
        });

        const res = await req.json();

        if(res.message === "passed"){
            setDeletedPlayers([...deletedPlayers, playerId]);
        }
        
        if(res.error !== undefined){
            setError(res.error);
        }

        setbLoading(false);

    }

    const deleteMatch = async () =>{

        setbLoading(true);

        const req = await fetch("/api/adminmatches", {
            "headers": {"Content-Type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "delete", "id": matchId})
        });

        const result = await req.json();

        if(result.message === "passed"){

            setTimeout(() =>{
                window.location = "/";
            }, 2000);     
        }

        
    }

    const renderPlayerList = () =>{

        const rows = [];

        for(const [playerId, playerData] of Object.entries(players)){

            if(deletedPlayers.indexOf(playerId) !== -1) continue;

            rows.push(<tr key={playerId}>
                <td className={`player ${Functions.getTeamColor(playerData.team)}`}>
                    <CountryFlag country={playerData.country}/>{playerData.name}
                </td>
                <td>
                    <div className={`${styles.button} team-red`} onClick={(() =>{
                        deletePlayer(playerId);
                    })}>Remove From Match
                    </div>
                </td>
            </tr>);
        }

        return <Table2 width={2}>
            <tr>
                <th>Player</th>
                <th>Delete From Match</th>
            </tr>
            {rows}
        </Table2>
    }

    return <div>
        <div className="default-header">Admin Match Control</div>
        <div className="default-header">Manage Players</div>
        {renderPlayerList()}
        <div className="default-header">Delete Match</div>
        <div className={`${styles.button} team-red`} onClick={() => deleteMatch()}>Delete Match</div>
        <Loading value={!bLoading}/>
        <ErrorMessage title="Admin Match Controll" text={error}/>
    </div>
}

export default AdminMatchControl;

