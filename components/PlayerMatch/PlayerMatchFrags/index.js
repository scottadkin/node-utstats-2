import InteractiveTable from "../../InteractiveTable";
import ErrorMessage from "../../ErrorMessage";

const getTargetPlayerData = (playerId, playersData) =>{

    for(let i = 0; i < playersData.length; i++){

        const p = playersData[i];
        if(p.player_id === playerId) return p;
    }

    return null;
}


const PlayerMatchFrags = ({playerId, playersData}) =>{

    const targetData = getTargetPlayerData(playerId, playersData);


    if(targetData === null) return <ErrorMessage title="Frags Performance" text="targetData is null"/>


    return <div>
        <div className="default-header">Frags Performance</div>
    </div>
}

export default PlayerMatchFrags;
