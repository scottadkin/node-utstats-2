import MapBox from './MapBox'

function MapList(props){

    const maps = JSON.parse(props.data);
    console.log(maps);

    const elems = [];

    for(let i = 0; i < maps.length; i++){

        elems.push(
            <MapBox key={i} data={maps[i]}/>
        );
    }

    return (
        <div>
            {elems}
        </div>    
    );
}


export default MapList;