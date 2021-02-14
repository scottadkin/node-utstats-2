import Link from 'next/link';
import DefaultHead from '../components/defaulthead';
import Nav from '../components/Nav/';
import Footer from '../components/Footer/';
import MapManager from '../api/maps';
import MapList from '../components/MapList/';
import Functions from '../api/functions'

function Maps(props){

    return (
        <div>
            <DefaultHead />

            
            <main>
            <Nav />
            <div id="content">
                <div className="default">
                <div className="default-header">
                    Maps
                </div>
                <MapList data={props.maps} images={props.images}/>
                </div>
            </div>
            <Footer />
            </main>   
        </div>
    );
}


export async function getServerSideProps({query}){

    const manager = new MapManager();

    const maps = await manager.getAll();

    const names = Functions.getUniqueValues(maps, 'name');
    const images = await manager.getImages(names);


    return {
        props: {
            "maps": JSON.stringify(maps),
            "images": JSON.stringify(images)
        }
    };
}


export default Maps;