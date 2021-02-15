import Link from 'next/link';
import DefaultHead from '../components/defaulthead';
import Nav from '../components/Nav/';
import Footer from '../components/Footer/';
import MapManager from '../api/maps';
import MapList from '../components/MapList/';
import Functions from '../api/functions';
import Pagination from '../components/Pagination';



class Maps extends React.Component{

    constructor(props){
        super(props);
    }

    render(){

        const pages = Math.ceil(this.props.results / this.props.perPage);

        const url = `/maps?page=`;

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
                    <Pagination url={url} results={this.props.results} currentPage={this.props.page} pages={pages} perPage={this.props.perPage}/>
                    <MapList data={this.props.maps} images={this.props.images}/>
                    </div>
                </div>
                <Footer />
                </main>   
            </div>
        );
    }
}


export async function getServerSideProps({query}){


    let page = 1;
    let perPage = 5;

    page = Functions.setSafeInt(query.page, 1, 1);
    perPage = Functions.setSafeInt(query.perPage, 5, 1);


    const manager = new MapManager();

    const maps = await manager.get(page, perPage);

    const names = Functions.getUniqueValues(maps, 'name');
    
    const images = await manager.getImages(names);
    const totalResults = await manager.getTotalResults();


    return {
        props: {
            "maps": JSON.stringify(maps),
            "images": JSON.stringify(images),
            "results": totalResults,
            "page": page,
            "perPage": perPage
        }
    };
}


export default Maps;