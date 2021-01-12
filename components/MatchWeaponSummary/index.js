const MatchWeaponSummary = ({data}) =>{

    data = JSON.parse(data);

    console.log(`weapon Data`);

    console.log(data);

    const elems = [];

    for(let i = 0; i < data.names.length; i++){

        elems.push(
            <div>
                <div className="default-header">
                    {data.names[i].name}
                </div>
            </div>
        );
    }

    return (
        <div>
        <div className="default-header">
            Weapon Summary
        </div>
        {elems}
        </div>
    );
}


export default MatchWeaponSummary;