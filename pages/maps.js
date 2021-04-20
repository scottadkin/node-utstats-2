import Link from 'next/link';
import DefaultHead from '../components/defaulthead';
import Nav from '../components/Nav/';
import Footer from '../components/Footer/';
import MapManager from '../api/maps';
import MapList from '../components/MapList/';
import Functions from '../api/functions';
import Pagination from '../components/Pagination';
import Option2 from '../components/Option2/';
import React from 'react';



class Maps extends React.Component{

    constructor(props){

        super(props);

        this.state = {"displayType": this.props.displayType, "perPage": this.props.perPage, "name": this.props.name};

        this.changeDisplay = this.changeDisplay.bind(this);
        this.changePerPage = this.changePerPage.bind(this);
        this.updateName = this.updateName.bind(this);
    }

    changeDisplay(id){
        this.setState({"displayType": id});
    }


    changePerPage(event){
        this.setState({"perPage": event.target.value});
    }

    updateName(event){
        this.setState({"name": event.target.value});
    }

    render(){

        let pages = Math.ceil(this.props.results / this.props.perPage);

        if(pages < 1) pages = 1;

        let url = '';

        if(this.state.name !== ""){
            url = `/maps?displayType=${this.state.displayType}&perPage=${this.state.perPage}&name=${this.state.name}&page=`;
        }else{
            url = `/maps?displayType=${this.state.displayType}&perPage=${this.state.perPage}&page=`;
        }

        let notFound = '';

        if(this.props.results === 0){
            notFound = <div className="not-found">There are no matching results.</div>
        }

        const start = (this.props.page <= 1) ? 1 : this.props.perPage * (this.props.page - 1);
        const end = (this.props.page * this.props.perPage <= this.props.results) ? this.props.page * this.props.perPage : this.props.results;
        
        const nameString = (this.props.name !== "") ? `search for name ${this.props.name}` : "";

        return (
            <div>
                <DefaultHead host={this.props.host} title={`Maps ${nameString} - Page ${this.props.page} of ${pages}`}  
                description={`Search for a map in the database. 
                Currently viewing ${nameString} page ${this.props.page} of ${pages}, maps ${start} to ${end} out of ${this.props.results}`} 
                keywords={`search,map,maps,page ${this.props.page}`}/>
                <main>
                <Nav />
                <div id="content">
                    <div className="default">
                    <div className="default-header">
                        Maps
                    </div>
                    <form>
                        <input type="text" name="name" className="default-textbox center" placeholder="map name..." value={this.state.name} onChange={this.updateName}/>
                        <div className="select-row">
                            <div className="select-label">Results Per Page</div>
                            <select className="default-select" name="perPage" value={this.state.perPage} onChange={this.changePerPage}>
                                <option value="5">5</option>
                                <option value="10">10</option>
                                <option value="25">25</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                            </select>
                        </div>
                        <div className="select-row">
                            <div className="select-label">Display</div>
                            <Option2 title1="Default" title2="Table" changeEvent={this.changeDisplay} value={this.state.displayType}/>
                            <input type="hidden" name="displayType" value={this.state.displayType} />
                        </div>
                        <Link href={`${url}1`}>
                            <a className="search-button">Search</a>
                        </Link>
                    </form>
                    {notFound}
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


export async function getServerSideProps({req, query}){


    let page = 1;
    let perPage = 25;
    let displayType = 0;
    let name = "";

    page = Functions.setSafeInt(query.page, 1, 1);
    perPage = Functions.setSafeInt(query.perPage, 25, 1, 100);
    displayType = Functions.setSafeInt(query.displayType, 0);

    if(query.name !== undefined){

        name = query.name;
    }


    const manager = new MapManager();

    const maps = await manager.get(page, perPage, name);

    const names = Functions.getUniqueValues(maps, 'name');
    
    const images = await manager.getImages(names);
    const totalResults = await manager.getTotalResults(name);


    return {
        props: {
            "host": req.headers.host,
            "maps": JSON.stringify(maps),
            "images": JSON.stringify(images),
            "results": totalResults,
            "page": page,
            "perPage": perPage,
            "displayType": displayType,
            "name": name
        }
    };
}


export default Maps;