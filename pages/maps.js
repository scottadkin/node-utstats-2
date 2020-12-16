import Link from 'next/link';
import DefaultHead from '../components/defaulthead'
import Nav from '../components/Nav/'
import Footer from '../components/Footer/'
import MapManager from '../api/maps'
import MapList from '../components/maplist'

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
                <MapList data={props.maps}/>
                </div>
            </div>
            <Footer />
            </main>   
        </div>
    );
}


export async function getServerSideProps(){

    const Manager = new MapManager();

    const maps = JSON.stringify(await Manager.getAll());

    //console.log(await Manager.getAll());

    return {
        props: {
            maps
        }
    };
}


export default Maps;