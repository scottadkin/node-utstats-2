import { getPlayer } from "../../api/generic.mjs";
import CountryFlag from "../CountryFlag";

const AdminPlayerHistory = ({playerNames, selectedPlayerProfile}) =>{


    const elems = [];
    
    console.log(playerNames);
    
    if(selectedPlayerProfile === -1){
        elems.push(<div key="none">No Player Selected</div>);
    }else{

        const player = getPlayer(playerNames, selectedPlayerProfile);
        console.log(player);

        elems.push(<div key="pinfo">
            Selected player is <CountryFlag country={player.country}/><b>{player.name}</b>
        </div>);
    }

    

    return <div>
        <div className="default-header">Player History</div>
        <div className="default-box">
            {elems}
        </div>
    </div>
}


export default AdminPlayerHistory;