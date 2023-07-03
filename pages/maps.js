import Link from 'next/link';
import DefaultHead from '../components/defaulthead';
import Nav from '../components/Nav/';
import Footer from '../components/Footer/';
import MapManager from '../api/maps';
import MapList from '../components/MapList/';
import Functions from '../api/functions';
import Pagination from '../components/Pagination';
import React from 'react';
import Session from '../api/session';
import SiteSettings from '../api/sitesettings';
import Analytics from '../api/analytics';
import Router from 'next/router';



const Maps = ({session, navSettings, pageSettings, host, page, pages, results, perPage, maps, images, name, dropDownOptions}) =>{

    let start = (page - 1) * perPage;
    if(start < 0) start = 0;
    let end = start + perPage;
    
    maps = JSON.parse(maps);
    images = JSON.parse(images);

    let title = "Maps";
    let description = "View all the maps that have been played on our servers.";

    if(name !== ""){

        title = `Search result for "${name}"`;
        description = `Search results for "${name}", page ${page} of ${pages}.`;
    }

    return <div>
        <DefaultHead host={host} title={`${title} - Page ${page} of ${pages}`}  
        description={description} 
        keywords={`search,map,maps`}/>
        <main>
        <Nav settings={navSettings} session={session}/>
        <div id="content">
            <div className="default">
                <div className="default-header" onClick={() =>{
                    Router.push({
                        pathname: '/maps',
                        query: { sortBy: 'price' }
                      }, 
                      undefined/*optional decorator */, { shallow: true }
                      )
                }}>
                    Maps
                </div>
                <MapList maps={maps} images={images}/>
            </div>
        </div>
        <Footer session={session}/>
        </main>   
    </div>
}
/*
class Maps extends React.Component{

    constructor(props){

        super(props);

        this.state = {"displayType": this.props.displayType, "perPage": this.props.perPage, "name": this.props.name};

        this.changeDisplay = this.changeDisplay.bind(this);
        this.changePerPage = this.changePerPage.bind(this);
        this.updateName = this.updateName.bind(this);
    }

    componentDidMount(){

        const settings = JSON.parse(this.props.pageSettings);
        const session = JSON.parse(this.props.session);

        if(settings["Default Display Per Page"] !== undefined){

            if(session["mapsPerPage"] === undefined){
                this.setState({"perPage": parseInt(settings["Default Display Per Page"])});
            }else{
                this.setState({"perPage": parseInt(session["mapsPerPage"])});
            }
        }

        if(settings["Default Display Type"] !== undefined){

            if(session["mapsDisplayType"] === undefined){
                this.setState({"displayType": parseInt(settings["Default Display Type"])});
            }else{
                this.setState({"displayType": parseInt(session["mapsDisplayType"])});
            }
        }
    }

    changeDisplay(id){

        id = parseInt(id);

        if(id !== id) id = 0;

        this.setState({"displayType": id});

        Functions.setCookie("mapsDisplayType", id);
    }


    changePerPage(event){

        let value = parseInt(event.target.value);
        if(value !== value) value = 25;

        this.setState({"perPage": value});

        Functions.setCookie("mapsPerPage", value);
    }

    updateName(event){
        this.setState({"name": event.target.value});
    }


    render(){

        const imageHost = Functions.getImageHostAndPort(this.props.host);

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

        const paginationElem = <Pagination url={url} results={this.props.results} currentPage={this.props.page} pages={pages} perPage={this.props.perPage}/>;

        return (
            <div>
                <DefaultHead host={this.props.host} title={`Maps ${nameString} - Page ${this.props.page} of ${pages}`}  
                description={`Search for a map in the database. 
                Currently viewing ${nameString} page ${this.props.page} of ${pages}, maps ${start} to ${end} out of ${this.props.results}`} 
                keywords={`search,map,maps,page ${this.props.page}`}/>
                <main>
                <Nav settings={this.props.navSettings} session={this.props.session}/>
                <div id="content">
                    <div className="default">
                    <div className="default-header">
                        Maps
                    </div>
                    <div className="default-sub-header">Search for a map</div>
                    <form className="form">
                        <input type="text" name="name" className="default-textbox center m-bottom-10" placeholder="map name..." value={this.state.name} onChange={this.updateName}/>
                        <div className="select-row">
                            <div className="select-label">Results Per Page</div>
                            <select className="default-select" name="perPage" value={this.state.perPage} onChange={this.changePerPage}>
                                <option value="5">5</option>
                                <option value="10">10</option>
                                <option value="25">25</option>
                                <option value="50">50</option>
                                <option value="75">75</option>
                                <option value="100">100</option>
                            </select>
                        </div>
                        <div className="select-row">
                            <div className="select-label">Display</div>
                            <Option2 title1="Default" title2="Table" changeEvent={this.changeDisplay} value={this.state.displayType}/>
                            <input type="hidden" name="displayType" value={this.state.displayType} />
                        </div>
                        <Link href={`${url}1`}>
                            <span className="search-button">Search</span>
                        </Link>
                    </form>
                    {notFound}
                    {paginationElem}
                    <MapList host={imageHost} data={this.props.maps} images={this.props.images} displayType={this.state.displayType}/>
                    {paginationElem}
                    </div>
                </div>
                <Footer session={this.props.session}/>
                </main>   
            </div>
        );
    }
}*/


export async function getServerSideProps({req, query}){

    const session = new Session(req);

	await session.load();

    const settings = new SiteSettings();

    const navSettings = await settings.getCategorySettings("Navigation");
    const pageSettings = await settings.getCategorySettings("Maps Page");


    let page = 1;
    let perPage = parseInt(pageSettings["Default Display Per Page"]);

    if(session.cookies["mapsPerPage"] !== undefined){

        perPage = parseInt(session.cookies["mapsPerPage"]);

        if(perPage !== perPage) perPage = parseInt(pageSettings["Default Display Per Page"]);
    }

    let displayType = 0;
    let name = "";
    let bAsc = 1;


    page = (query.page !== undefined) ? parseInt(query.page) : 1;
    perPage = (query.perPage !== undefined) ? parseInt(query.perPage) : 25;
    displayType = (query.displayType !== undefined) ? parseInt(query.displayType) : 0;
    if(query.name !== undefined) name = query.name;
    bAsc = (query.bAsc !== undefined) ? parseInt(query.bAsc) : 1;
    if(bAsc !== bAsc) bAsc = 1;
    
    if(page !== page) page = 1;
    if(perPage !== perPage) perPage = 25;

    console.log(`page = ${page}`);
    const manager = new MapManager();

    const maps = await manager.defaultSearch(page, perPage, name, bAsc);

    console.log(maps);

    const names = Functions.getUniqueValues(maps, 'name');

    const dropDownOptions = await manager.getAllDropDownOptions();
    
    const images = await manager.getImages(names);
    const totalResults = await manager.getTotalResults(name);

    let pages = 1;

    if(totalResults !== 0){
        pages = Math.ceil(totalResults / perPage);
    }
    

    await Analytics.insertHit(session.userIp, req.headers.host, req.headers['user-agent']);


    return {
        props: {
            "host": req.headers.host,
            "maps": JSON.stringify(maps),
            "images": JSON.stringify(images),
            "results": totalResults,
            "page": page,
            "pages": pages,
            "perPage": perPage,
            "displayType": displayType,
            "name": name,
            "session": JSON.stringify(session.settings),
            "navSettings": JSON.stringify(navSettings),
            "pageSettings": JSON.stringify(pageSettings),
            "dropDownOptions": dropDownOptions
        }
    };
}


export default Maps;