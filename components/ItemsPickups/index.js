import styles from './ItemsPickup.module.css';
import CountryFlag from '../CountryFlag/'

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

const ItemsPickup = ({data, names, playerNames}) =>{

    data = JSON.parse(data);
    names = JSON.parse(names);
    playerNames = JSON.parse(playerNames);

    //console.log(playerNames);

    const elems = [];

    let subElems = [];

    let current = [];

    data.sort((a, b) =>{

        a = a.uses;
        b = b.uses;

        if(a < b){
            return 1;
        }else if(a > b){
            return -1;
        }

        return 0;

    });

    let currentPlayer = 0;

    for(let i = 0; i < names.length; i++){

        subElems = [];

        current = getData(data, names[i].id);
 
        for(let x = 0; x < playerNames.length; x++){

            if(x < current.length){
                console.log(current);
                currentPlayer = getPlayer(playerNames, current[x].player);

                subElems.push(<tr>
                    <td><CountryFlag country={currentPlayer.country}/>{currentPlayer.name}</td>
                    <td>{current[x].uses}</td>
                </tr>);
            }else{
                subElems.push(<tr>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                </tr>);
            }
        }

        elems.push(
            <div className={`${styles.wrapper}`}>
                <div className={styles.header}>
                    {names[i].name}
                </div>
                <img className={styles.image} src="/images/temp.jpg" alt="image" />
            <table>
                <tbody>
                    <tr>
                        <th>Player</th>
                        <th>Uses</th>
                    </tr>
                    {subElems}
                </tbody>
            </table>
            </div>
        );
    }

    return (
        <div>
            <div className="default-header">Item Pickups</div>
            {elems}
        </div>
    );

}

export default ItemsPickup;