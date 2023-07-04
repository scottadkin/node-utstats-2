import Link from "next/link";
import DefaultHead from "../components/defaulthead";
import Nav from "../components/Nav/";
import Footer from "../components/Footer/";
import MapManager from "../api/maps";
import MapList from "../components/MapList/";
import Functions from "../api/functions";
import Pagination from "../components/Pagination";
import {useState, useReducer, useEffect} from "react";
import Session from "../api/session";
import SiteSettings from "../api/sitesettings";
import Analytics from "../api/analytics";
import Router from "next/router";
import DropDown from "../components/DropDown";
import CustomTable from "../components/CustomTable";
import { removeUnr, convertTimestamp, toPlaytime } from '../api/generic.mjs';

const reducer = (state, action) =>{

    switch(action.type){

        case "loadMaps": {
            return {
                ...state,
                "bLoading": true,
                "error": null
            }
        }
        case "changePerPage": {
            return {
                ...state,
                "perPage": action.value
            }
        }
        case "changeDisplayMode": {
            return {
                ...state,
                "displayMode": action.value
            }
        }
        case "changeSearchName": {
            return {
                ...state,
                "searchName": action.value
            }
        }
        case "changeOrder": {
            return {
                ...state,
                "order": action.value
            }
        }
        case "changeSortBy": {

            let currentOrder = state.order;

            if(action.value === state.sortBy){

                if(currentOrder === 0){
                    currentOrder = 1;
                }else if(currentOrder === 1){
                    currentOrder = 0;
                }
            }

            return {
                ...state,
                "sortBy": action.value,
                "order": currentOrder
            }
        }
        case "loaded": {
            return {
                ...state,
                "bLoading": false,
                "error": null,
                "data": action.data
            }
        }
    }

    return state;
}

async function loadData(state, dispatch, page, controller){

    const url = `/api/mapsearch?name=${state.searchName}&page=${page}&order=${state.order}&perPage=${state.perPage}`;

    console.log(url);
    const req = await fetch(url, {
        "signal": controller.signal
    });

    const res = await req.json();

    if(res.error === undefined){

        console.log(res.data);
        dispatch({"type": "loaded", "data": res.data});
    }

    console.log(res);
}


const Maps = ({session, navSettings, pageSettings, host, page, pages, results, perPage, maps, images, name, displayType, bAsc, sortBy}) =>{

    const [state, dispatch] = useReducer(reducer, {
        "bLoading": true,
        "error": null,
        "page": page,
        "perPage": perPage,
        "mapList": [],
        "data": [],
        "pages": pages,
        "displayMode": displayType,
        "searchName": name,
        "order": bAsc,
        "sortBy": sortBy
    });

    useEffect(() =>{

        const controller = new AbortController();

        console.log("horse noise", page);
        loadData(state, dispatch, page, controller);

        return () =>{
            controller.abort();
        }

    }, [state.searchName, page, state.perPage, state.order]);

    useEffect(() =>{
        //console.log(page);
    }, [page]);

    let start = (page - 1) * state.perPage;
    if(start < 0) start = 0;
    let end = start + state.perPage;
    
    maps = JSON.parse(maps);
    images = JSON.parse(images);

    let title = "Maps";
    let description = "View all the maps that have been played on our servers.";

    if(state.searchName !== ""){

        title = `Search result for "${state.searchName}"`;
        description = `Search results for "${state.searchName}", page ${page} of ${state.pages}.`;
    }

    let url = "";

    if(state.searchName !== ""){
        url = `/maps?displayType=${state.displayMode}&perPage=${state.perPage}&bAsc=${state.order}&name=${state.searchName}&page=`;
    }else{
        url = `/maps?displayType=${state.displayMode}&perPage=${state.perPage}&bAsc=${state.order}&page=`;
    }

    const pageinationElem = <Pagination url={url} results={results} currentPage={page} pages={state.pages} perPage={state.perPage}/>;

    const headers = {
        "name": {
            "display": "Name",
            "mouseOver": {
                "title": "test title",
                "content": "This is some content"
            },
            "onClick": () =>{
                dispatch({"type": "changeSortBy", "value": "name"});
            }
        },
        "first": {
            "display": "First",
            "mouseOver": {
                "title": "First Match Date",
                "content": "The date of the first match played for this map."
            },
            "onClick": () =>{
                dispatch({"type": "changeSortBy", "value": "first"});
            }
        },
        "last": {
            "display": "Last",
            "mouseOver": {
                "title": "Last Match Date",
                "content": "The date of the most recent match played for this map."
            },
            "onClick": () =>{
                dispatch({"type": "changeSortBy", "value": "last"});
            }
        },
        "playtime": {
            "display": "Playtime",
            "onClick": () =>{
                dispatch({"type": "changeSortBy", "value": "playtime"});
            }
        },
        "matches": {
            "display": "Matches",
            "onClick": () =>{
                dispatch({"type": "changeSortBy", "value": "matches"});
            }
        }
    };

    const testData = state.data.map((d) =>{

        return {
            "name": {
                "value": d.name.toLowerCase(), 
                "displayValue": removeUnr(d.name), 
                "className": "text-left"
            },
            /*"author": {
                "value": map.author.toLowerCase(),
                "displayValue": map.author
            }*/
            "first": {
                "value": d.first,
                "displayValue": convertTimestamp(d.first, true),
                "className": "playtime"
            },
            "last": {
                "value": d.last,
                "displayValue": convertTimestamp(d.last, true),
                "className": "playtime"
            },
            "matches": {
                "value": d.matches
            },
            "playtime": {
                "value": d.playtime,
                "displayValue": toPlaytime(d.playtime),
                "className": "playtime"
            }
        }
    });

    return <div>
        <DefaultHead host={host} title={`${title} - Page ${page} of ${state.pages}`}  
        description={description} 
        keywords={`search,map,maps`}/>
        <main>
        <Nav settings={navSettings} session={session}/>
        <div id="content">
            <div className="default">
                <div className="default-header" onClick={() =>{
                    Router.push({
                        pathname: "/maps",
                        query: { sortBy: "price" }
                      }, 
                      undefined/*optional decorator */, { shallow: true }
                      )
                }}>
                    Maps
                </div>
                <div className="form m-bottom-25">
                    <div className="default-sub-header-alt">Search For A Map</div>
                    <div className="form-row">
                        <div className="form-label">Map Name</div>
                        <input type="text" className="default-textbox" placeholder="name..." onKeyDown={((e) =>{
                            dispatch({"type": "changeSearchName", "value": e.target.value});
                        })} onKeyUp={((e) =>{
                            dispatch({"type": "changeSearchName", "value": e.target.value});
                        })}/>   
                    </div>

                    <DropDown dName="Sort By" 
                        fName="sort"
                        data={[
                            {"value": "name", "displayValue": "Name"},
                            {"value": "first", "displayValue": "First"},
                            {"value": "last", "displayValue": "Last"},
                            {"value": "matches", "displayValue": "Matches"},
                            {"value": "playtime", "displayValue": "Playtime"},
                        ]}
                        changeSelected={(name, value) =>{
                            dispatch({"type": "changeSortBy", "value": value});
                        }}
                        originalValue={state.sortBy}  
                    />
      
                    <DropDown dName="Order" 
                        fName="order"
                        data={[
                            {"value": 1, "displayValue": "Ascending"},
                            {"value": 0, "displayValue": "Descending"},
                        ]}
                        changeSelected={(name, value) =>{
                            dispatch({"type": "changeOrder", "value": value});
                        }}
                        originalValue={state.order}  
                    />
                    <DropDown dName="Results Per Page"
                        data={[
                            {"value": 5, "displayValue": 5},
                            {"value": 10, "displayValue": 10},
                            {"value": 25, "displayValue": 25},
                            {"value": 50, "displayValue": 50},
                            {"value": 100, "displayValue": 100}
                        ]} 
                        fName="order"
                        changeSelected={(name, value) =>{
                            dispatch({"type": "changePerPage", "value": value});
                        }}
                        originalValue={state.perPage}
                    />
                
                </div>
                perPage = {state.perPage} sortBy {state.sortBy}
                {pageinationElem}
                <CustomTable headers={headers} data={testData}/>
                <MapList maps={state.data} images={images} displayType={state.displayMode}/>
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

        let url = "";

        if(this.state.name !== ""){
            url = `/maps?displayType=${this.state.displayType}&perPage=${this.state.perPage}&name=${this.state.name}&page=`;
        }else{
            url = `/maps?displayType=${this.state.displayType}&perPage=${this.state.perPage}&page=`;
        }

        let notFound = "";

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
    let bAsc = 0;
    let sortBy = (query.sortBy !== undefined) ? query.sortBy : "name";


    page = (query.page !== undefined) ? parseInt(query.page) : 1;
    perPage = (query.perPage !== undefined) ? parseInt(query.perPage) : 5;
    displayType = (query.displayType !== undefined) ? parseInt(query.displayType) : 0;
    if(query.name !== undefined) name = query.name;
    bAsc = (query.bAsc !== undefined) ? parseInt(query.bAsc) : 1;
    if(bAsc !== bAsc) bAsc = 1;
    
    if(page !== page) page = 1;
    if(perPage !== perPage) perPage = 5;//25;


    console.log(`page = ${page}`);
    const manager = new MapManager();

    const maps = []//await manager.defaultSearch(page, perPage, name, bAsc);

    //console.log(maps);

    const names = Functions.getUniqueValues(maps, "name");
    
    const images = await manager.getImages(names);
    const totalResults = await manager.getTotalResults(name);

    let pages = 1;

    if(totalResults !== 0){
        pages = Math.ceil(totalResults / perPage);
    }
    

    await Analytics.insertHit(session.userIp, req.headers.host, req.headers["user-agent"]);


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
            "bAsc": bAsc,
            "sortBy": sortBy,
            "session": JSON.stringify(session.settings),
            "navSettings": JSON.stringify(navSettings),
            "pageSettings": JSON.stringify(pageSettings)
        }
    };
}


export default Maps;