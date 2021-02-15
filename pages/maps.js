import Link from 'next/link';
import DefaultHead from '../components/defaulthead';
import Nav from '../components/Nav/';
import Footer from '../components/Footer/';
import MapManager from '../api/maps';
import MapList from '../components/MapList/';
import Functions from '../api/functions';
import Pagination from '../components/Pagination';
import Option2 from '../components/Option2/';



class Maps extends React.Component{

    constructor(props){
        super(props);
        this.state = {"displayType": this.props.displayType, "perPage": this.props.perPage};

        this.defaultDisplay = this.defaultDisplay.bind(this);
        this.tableDisplay = this.tableDisplay.bind(this);
        this.changePerPage = this.changePerPage.bind(this);
    }

    defaultDisplay(){

        this.setState({"displayType": 0});
    }

    tableDisplay(){

        this.setState({"displayType": 1});
    }

    changePerPage(event){
        this.setState({"perPage": event.target.value});
    }

    render(){

        const pages = Math.ceil(this.props.results / this.props.perPage);

        const url = `/maps?displayType=${this.state.displayType}&perPage=${this.state.perPage}&page=`;

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
                    <div className="select-row">
                        <div className="select-label">Results Per Page</div>
                        <select className="default-select" value={this.state.perPage} onChange={this.changePerPage}>
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="25">25</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>
                    </div>
                    <div className="select-row">
                        <div className="select-label">Display</div>
                        <Option2 title1="Default" title2="Table" leftEvent={this.defaultDisplay} rightEvent={this.tableDisplay} value={this.state.displayType}/>
                    </div>
                    <Link href={`${url}1`}>
                        <a className="search-button">Search</a>
                    </Link>
                    <Pagination url={url} results={this.props.results} currentPage={this.props.page} pages={pages} perPage={this.props.perPage}/>
                    <MapList data={this.props.maps} images={this.props.images} displayType={this.state.displayType}/>
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
    let displayType = 0;

    page = Functions.setSafeInt(query.page, 1, 1);
    perPage = Functions.setSafeInt(query.perPage, 5, 1, 100);
    displayType = Functions.setSafeInt(query.displayType, 1);


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
            "perPage": perPage,
            "displayType": displayType
        }
    };
}


export default Maps;