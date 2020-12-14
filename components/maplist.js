import MapBox from './mapbox'

function MapList(props){

    const maps = JSON.parse(props.data);
    console.log(maps);

    const elems = [];

    for(let i = 0; i < maps.length; i++){

        elems.push(
            <MapBox data={maps[i]}/>
        );
    }

    return (
        <div>
            {elems}
        </div>    
    );
}


export default MapList;