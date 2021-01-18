import styles from './ItemsPickup.module.css';

function getData(data, item){

    let d = 0;

    const found = [];

    for(let i = 0; i < data.length; i++){

        d = data[i];

        if(d.item === item){
            found.push({"player": d.player_id, "uses": d.uses});
        }
    }

    return found;
}

function getPlayer(players, id){

    let p = 0;

    for(let i = 0; i < players.length; i++){

        p = players[i];

        if(p.id === id){
            return p;
        }

    }

    return {"name": 'Not Found', "country": 'xx'};
}


function getUses(player, data, item){

    for(let i = 0; i < data.length; i++){

        if(data[i].item === item){
            if(data[i].player_id === player){
                return data[i].uses;
            }
        }
        
    }

    return '';
}


function getTeamColor(team){

    let bgColor = "team-none";

    switch(team){
        case 0: {  bgColor = "team-red"; } break;
        case 1: {  bgColor = "team-blue"; } break;
        case 2: {  bgColor = "team-green"; } break;
        case 3: {  bgColor = "team-yellow"; } break;
    }
    
    return bgColor;
}

const ItemsPickup = ({data, names, playerNames}) =>{

    data = JSON.parse(data);
    names = JSON.parse(names);
    playerNames = JSON.parse(playerNames);

    const elems = [];

    let subElems = [];
    let current = 0;
    let currentPlayer = 0;

    subElems.push(<th key={`th-player-name--1`}>Item</th>);

    for(let i = 0; i < playerNames.length; i++){
        subElems.push(<th key={`th-player-name-${i}`}>{playerNames[i].name}</th>);
    }

    elems.push(<tr>
        {subElems}
    </tr>);

    for(let i = 0; i < names.length; i++){

        subElems = [];

        current = getData(data, names[i].id);

        subElems.push(<td key={`player-item-name-${i}`}>{names[i].name}</td>);

        for(let x = 0; x < playerNames.length; x++){

            subElems.push(<td key={`player-item-${playerNames[x].team}-${x}`} className={getTeamColor(playerNames[x].team)}>{getUses(playerNames[x].id, data, names[i].id)}</td>);
        }

        elems.push(<tr key={`items-tr-${i}`}>{subElems}</tr>);

    }

    return (<div className={styles.wrapper}>

        <div className="default-header">
            Item Pickups
        </div>
        <table className="center">
            <tbody>
            {elems}
            </tbody>
        </table>
    </div>);
}

export default ItemsPickup;