import DefaultHead from '../components/defaulthead';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import MatchesManager from '../api/matches';
import MatchesTableView from '../components/MatchesTableView/';
import MatchesDefaultView from '../components/MatchesDefaultView/';
import Gametypes from '../api/gametypes';
import Functions from '../api/functions';
import Servers from '../api/servers';
import Maps from '../api/maps';
import Pagination from '../components/Pagination';
import Link from 'next/link';
import Option2 from '../components/Option2';
import React from 'react';
import Session from '../api/session';
import SiteSettings from '../api/sitesettings';
import Analytics from '../api/analytics';

class Matches extends React.Component{

    constructor(props){

        super(props);

        this.state = {"perPage": this.props.perPage, "gametype": this.props.gametype, "displayType": this.props.displayType};

        this.changePerPage = this.changePerPage.bind(this);
        this.changeGametype = this.changeGametype.bind(this);
        this.changeDisplay = this.changeDisplay.bind(this);

    }

    componentDidMount(){

        const settings = JSON.parse(this.props.pageSettings);
        const session = JSON.parse(this.props.session);

        if(session["matchesGametype"] === undefined){

            if(settings["Default Gametype"] !== undefined){
                this.setState({"gametype": parseInt(settings["Default Gametype"])});
            }

        }else{
            this.setState({"gametype": parseInt(session["matchesGametype"])});
        }

        if(session["matchesPerPage"] === undefined){

            if(settings["Default Display Per Page"] !== undefined){
                this.setState({"perPage": parseInt(settings["Default Display Per Page"])});
            }

        }else{
            this.setState({"perPage": parseInt(session["matchesPerPage"])});
        }


        if(session["matchesDisplay"] === undefined){

            if(settings["Default Display Type"] !== undefined){
                this.setState({"displayType": parseInt(settings["Default Display Type"])});
            }

        }else{
            this.setState({"displayType": parseInt(session["matchesDisplay"])});
        }


        
        console.log(session);
    }


    changePerPage(event){

        this.setState({"perPage": event.target.value});

        let value = parseInt(event.target.value);

        if(value !== value) value = 25;
        

        Functions.setCookie("matchesPerPage", value);

    }

    changeGametype(event){

        this.setState({"gametype": event.target.value})

        let value = parseInt(event.target.value);

        if(value !== value) value = 0;
        
        Functions.setCookie("matchesGametype", value);


    }

    createGametypeOptions(){

        const elems = [];

        const gametypes = JSON.parse(this.props.gametypes);

        for(const [key, value] of Object.entries(gametypes)){
            
            elems.push(<option key={key} value={key}>{value}</option>);
        }

        return elems;
    }

    getGametypeName(id){

        const gametypes = JSON.parse(this.props.gametypes);

        if(gametypes[id] !== undefined){
            return gametypes[id];
        }

        return "";
    }

    changeDisplay(type){

        this.setState({"displayType": type});

        if(type !== 0 && type !== 1){
            type = 0;
        }

        Functions.setCookie("matchesDisplay", type);
    }


    render(){

        const pages = Math.ceil(this.props.totalMatches / this.props.perPage);

        const url = `/matches?perPage=${this.state.perPage}&gametype=${this.state.gametype}&displayType=${this.state.displayType}&page=`;

        let matchElems = [];

        if(this.state.displayType){
            matchElems = <MatchesTableView data={this.props.matches}/>
        }else{
            matchElems = <MatchesDefaultView data={this.props.matches} images={this.props.images}/>
        }

        const start = (this.props.page <= 1) ? 1 : this.props.page * this.props.perPage;
        const end = (((this.props.page + 1) * this.props.perPage) <= this.props.totalMatches) ? (this.props.page + 1) * this.props.perPage : this.props.totalMatches;

        const gametypeName = this.getGametypeName(this.props.gametype);
        const nameString = (gametypeName !== "") ? `(${gametypeName})` : "";

        return (<div>
            <DefaultHead 
                host={this.props.host} 
                title={`Recent Matches${nameString} Page ${this.props.page} of ${pages}`} 
                description={`Viewing Recent Matches${nameString} page ${this.props.page} of ${pages}, matches ${start} to ${end} out of a possible ${this.props.totalMatches} matches.`} 
                keywords={`search,match,matches,page ${this.props.page}`}
            />
            <main>
                <Nav settings={this.props.navSettings} session={this.props.session}/>
                <div id="content">

                    <div className="default">
                        <div className="default-header">
                            Recent Matches
                        </div>
                        <div className="default-sub-header">Search for matches</div>
                        <div className="form">
                            <div className="select-row">
                                <div className="select-label">Gametype</div>
                                <select className="default-select" value={this.state.gametype} onChange={this.changeGametype}>
                                    <option value="0" key={`gametype-default`}>All</option>
                                    {this.createGametypeOptions()}
                                </select>
                            </div>
                            <div className="select-row">
                                <div className="select-label">Results Per Page</div>
        
                                    <select className="default-select" value={this.state.perPage} onChange={this.changePerPage}>
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
                            </div>
                            
                            
                            <Link href={`${url}${this.props.page}`}><a className="search-button">Search</a></Link>
                        </div>
                        <Pagination currentPage={this.props.page} 
                            perPage={this.props.perPage} 
                            pages={pages} 
                            results={this.props.totalMatches} 
                            url={url}/>
                            {matchElems}
                    </div>
                </div>
                <Footer session={this.props.session}/>
            </main>
        </div>);
    }
}


export async function getServerSideProps({req, query}){


    const session = new Session(req);

	await session.load();

    const matchManager = new MatchesManager();
    const gametypeManager = new Gametypes();
    const serverManager = new Servers();
    const mapManager = new Maps();

    const settings = new SiteSettings();
    const navSettings = await settings.getCategorySettings("Navigation");

    const pageSettings = await settings.getCategorySettings("Matches Page");

    const defaultPerPage = pageSettings["Default Display Per Page"];
    let perPage = defaultPerPage;
    let page = 1;
    let gametype = 0;
    let displayType = 0;

    if(query.perPage !== undefined){

        perPage = parseInt(query.perPage);

    }else{

        if(session.settings.matchesPerPage !== undefined){

            perPage = parseInt(session.settings.matchesPerPage);
        }
    }

    if(perPage !== perPage){
        perPage = defaultPerPage;
    }

    if(perPage > 100 || perPage < 1){
        perPage = defaultPerPage;
    }

    if(query.page !== undefined){

        page = parseInt(query.page);

        if(page !== page){
            page = 1;
        }

        if(page < 1){
            page = 1;
        }
    }

    
    if(query.gametype !== undefined){

        gametype = parseInt(query.gametype);

    }else{

        if(session.settings.matchesGametype !== undefined){
            
            gametype = parseInt(session.settings.matchesGametype);
        }
    }

    if(gametype !== gametype) gametype = 0;

    if(query.displayType !== undefined){

        displayType = parseInt(query.displayType);

    }

    if(displayType !== displayType){
        displayType = 0;
    }else{
        if(displayType !== 0 && displayType !== 1){
            displayType = 0;
        }
    }

    let gametypeNames = {};

    gametypeNames = await gametypeManager.getAllNames();

    const testGametypeIds = Object.keys(gametypeNames);

    if(testGametypeIds.indexOf(`${gametype}`) === -1){
        gametype = 0;
    }

    const totalMatches = await matchManager.getTotal(gametype);

    if(totalMatches > 0){

        if(page > Math.ceil(totalMatches / perPage)){
            page = Math.ceil(totalMatches / perPage);
        }

    }else{
        page = 1;
    }

    const matches = await matchManager.getRecent(page - 1, perPage, gametype);
    const uniqueServers = Functions.getUniqueValues(matches, 'server');
    const uniqueMaps = Functions.getUniqueValues(matches, 'map');



    let serverNames = {};

    if(uniqueServers.length > 0){
        serverNames = await serverManager.getNames(uniqueServers);
    }

    let mapNames = {};

    if(uniqueMaps.length > 0){
        mapNames = await mapManager.getNames(uniqueMaps);
    }


    Functions.setIdNames(matches, gametypeNames, 'gametype', 'gametypeName');
    Functions.setIdNames(matches, serverNames, 'server', 'serverName');
    Functions.setIdNames(matches, mapNames, 'map', 'mapName');

    let justMapNames = [];

    for(const [key,value] of Object.entries(mapNames)){
        justMapNames.push(value);
    }   

    const mapImages = await mapManager.getImages(justMapNames);

    await Analytics.insertHit(session.userIp, req.headers.host, req.headers['user-agent']);

    return {
        "props": {
            "host": req.headers.host,
            "matches": JSON.stringify(matches),
            "page": page,
            "perPage": perPage,
            "totalMatches": totalMatches,
            "gametypes": JSON.stringify(gametypeNames),
            "gametype": gametype,
            "displayType": displayType,
            "images": JSON.stringify(mapImages),
            "session": JSON.stringify(session.settings),
            "navSettings": JSON.stringify(navSettings),
            "pageSettings": JSON.stringify(pageSettings)
        }
    };
}


export default Matches;