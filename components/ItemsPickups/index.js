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

const ItemsPickup = ({data, names}) =>{

    data = JSON.parse(data);
    names = JSON.parse(names);

    //console.log(names);
    console.log(data);

    const elems = [];

    let subElems = [];

    let current = [];

    for(let i = 0; i < names.length; i++){

        subElems = [];

        current = getData(data, names[i].id);
        console.log(current);

        for(let x = 0; x < current.length; x++){

           /* subElems.push(<tr>
                <td>{current[x].player}</td>
                <td>{current[x].uses}</td>
            </tr>);*/
        }

        elems.push(
            <div className="special-table">
                <div className="default-header">
                    {names[i].name}
                </div>
            <table>
                <tbody>
                    <tr>
                        <th>Player</th>
                        <th>Picked Up</th>
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