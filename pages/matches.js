import DefaultHead from "../components/defaulthead";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import React from "react";
import Session from "../api/session";
import SiteSettings from "../api/sitesettings";
import Analytics from "../api/analytics";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import ErrorPage from "./ErrorPage";
import DropDown from "../components/DropDown";
import Link from "next/link";
import MatchesTableView from "../components/MatchesTableView";
import MatchesDefaultView from "../components/MatchesDefaultView";
import Pagination from "../components/Pagination";
import SearchTerms from "../components/SearchTerms";
import Functions from "../api/functions";
import Servers from "../api/servers"
import Gametypes from "../api/gametypes";
import Maps from "../api/maps";

class Matches extends React.Component{

    constructor(props){

        super(props);

        this.state = {
            "bLoadedInitial": false, 
            "error": null, 
            "serverNames": null, 
            "selectedServer": this.props.server, 
            "selectedGametype": this.props.gametype,
            "selectedMap": this.props.map,
            "perPage": this.props.perPage,
            "page": this.props.page,
            "matches": null,
            "totalMatches": 0,
            "images": [],
            "displayMode": this.props.displayMode
        };

        this.changeSelected = this.changeSelected.bind(this);
    }

    async componentDidUpdate(prevProps, prevState){

        const checks = ["page", "gametype", "server", "map", "perPage"];

        for(let i = 0; i < checks.length; i++){

            const c = checks[i];

            if(prevProps[c] !== this.props[c]){

                await this.loadData();
                return;
            }
        }
    }

    async changeSelected(type, value){

        const obj = {};

        obj[type] = value;

        this.setState(obj);
    }

    async loadTotalMatches(){

        const req = await fetch("/api/matchsearch", {
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({
                "mode": "search-count",
                "serverId": this.state.selectedServer,
                "gametypeId": this.state.selectedGametype,
                "mapId": this.state.selectedMap
            })
        });

        const res = await req.json();

        if(res.error !== undefined){

            this.setState({"error": res.error});

        }else{

            this.setState({
                "totalMatches": res.totalMatches
            });
        }
    }

    async loadNames(){

        const req = await fetch("/api/matchsearch", {
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "full-list"})
        });

        const res = await req.json();

        if(res.error !== undefined){

            this.setState({"error": res.error});

        }else{

            this.setState({
                "serverNames": res.serverNames,
                "gametypeNames": res.gametypeNames, 
                "mapNames": res.mapNames,
                "bLoadedInitial": true
            });
        }
    }

    async loadData(){


        await this.loadTotalMatches();


        const req = await fetch("/api/matchsearch", {
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({
                "mode": "search",
                "serverId": this.state.selectedServer,
                "gametypeId": this.state.selectedGametype,
                "mapId": this.state.selectedMap,
                "perPage": this.state.perPage,
                "page": this.props.page

            })
        });

        const res = await req.json();

        if(res.error !== undefined){

            this.setState({"error": res.error});
        }else{
            console.log(res);
            this.setState({"matches": res.data, "images": res.images});
        }
    }

    async componentDidMount(){

        await this.loadNames();
        await this.loadData();
    }

    getPerPageData(){

        const data = {};

        data["5"] = 5;
        data["10"] = 10;
        data["25"] = 25;
        data["50"] = 50;
        data["75"] = 75;
        data["100"] = 100;

        return data;
    }


    getDisplayModeData(){

        const data = {};

        data["0"] = "Default View";
        data["1"] = "Table View";

        return data;
    }

    renderSearchForm(){

        const s = this.state.selectedServer;
        const g = this.state.selectedGametype;
        const m = this.state.selectedMap;
        const d = this.state.displayMode;

        const url = `/matches?server=${s}&gametype=${g}&map=${m}&display=${d}&page=1&pp=${this.state.perPage}`;

        return <div className="form m-bottom-25">
            <DropDown 
                dName="Server" 
                fName="selectedServer" 
                originalValue={s.toString()} 
                data={this.state.serverNames} 
                changeSelected={this.changeSelected}
            />
            <DropDown 
                dName="Gametype" 
                fName="selectedGametype" 
                originalValue={g.toString()} 
                data={this.state.gametypeNames} 
                changeSelected={this.changeSelected}
            />
            <DropDown 
                dName="Map" 
                fName="selectedMap" 
                originalValue={m.toString()} 
                data={this.state.mapNames} 
                changeSelected={this.changeSelected}
            />
            <DropDown 
                dName="Results Per Page" 
                fName="perPage" 
                originalValue={this.state.perPage.toString()} 
                data={this.getPerPageData()} 
                changeSelected={this.changeSelected}
            />
            <DropDown 
                dName="Display Style" 
                fName="displayMode" 
                originalValue={this.state.displayMode.toString()} 
                data={this.getDisplayModeData()} 
                changeSelected={this.changeSelected}
            />
            <Link href={url}>
                <a>
                    <div className="search-button">Search</div>
                </a>
            </Link>
        </div>
    }

    createSearchTitle(){

       

        if(this.props.server === 0 && this.props.gametype === 0 && this.props.map === 0){
            return null;
        }
        
        const terms = {};

        if(this.props.server !== 0){

            const serverName = this.state.serverNames[this.props.server] ?? "Not Found";

            terms["Server"] = serverName;
        }

        if(this.props.gametype !== 0){

            const gametypeName = this.state.gametypeNames[this.props.gametype] ?? "Not Found";

            terms["Gametype"] = gametypeName;
        }

        if(this.props.map !== 0){

            const mapName = this.state.mapNames[this.props.map] ?? "Not Found";

            terms["Map"] = mapName;
        }
    
        return <div>
            <div className="default-header">Search Results</div>
            <SearchTerms data={terms}/>
        </div>
    }

    renderMatches(){

        if(this.state.matches === null) return null;

        const url = `/matches/?server=${this.props.server}&gametype=${this.props.gametype}&map=${this.props.map}&display=${this.props.displayMode}&pp=${this.props.perPage}&page=`;

        const pagination = <Pagination url={url} currentPage={this.props.page} perPage={this.state.perPage} results={this.state.totalMatches}/>;

        const imageHost = Functions.getImageHostAndPort(this.props.host);

        const displayMode = parseInt(this.state.displayMode);

        let matches = null;

        if(displayMode === 0){
            matches = <div className="center" style={{"width": "var(--width-1)"}}>
                <MatchesDefaultView data={this.state.matches} images={this.state.images} host={imageHost}/>
            </div>;
        }else{
            matches = <MatchesTableView data={this.state.matches}/>;
        }

        return <div>
            {this.createSearchTitle()}
            {pagination}
            {matches}
            {pagination}
        </div>
    }

    renderElems(){

        if(this.state.error !== null){
            return <ErrorMessage title="Recent Matches" text={this.state.error}/>
        }

        if(!this.state.bLoadedInitial){
            return <Loading />;
        }

        return <div>
            {this.renderSearchForm()}
            <div>
                {this.renderMatches()}
            </div>
        </div>

    }

    render(){

        if(this.props.pageError !== undefined){

            return <ErrorPage>{this.props.pageError}</ErrorPage>
        }

        const serverString = this.props.metaServerName;
        const gametypeString = this.props.metaGametypeName;
        const mapString = this.props.metaMapName;

        const keywords = [];

        let title = "";

        let description = "";

        if(mapString !== ""){

            title = `Matches on ${mapString}`;

            description = `Search results for matches played on the map ${mapString}`;

            keywords.push(mapString);
        }

        if(gametypeString !== ""){

            keywords.push(gametypeString);

            if(title !== ""){
                title += ` (${gametypeString})`;
            }else{
                title = `${gametypeString} games`;
            }

            if(description !== ""){
                description += `, with the gametype of ${gametypeString}`;
            }else{

                description = `Search results for matches played using the ${gametypeString} gametype`
            } 

            
        }


        if(serverString !== ""){

            keywords.push(serverString);

            if(title !== ""){
                title += " on ";
            }

            if(description !== ""){
                description += `, on the ${serverString} server`;
            }

            title += serverString;
        }

        if(description === ""){

            description = "View the latest Unreal Tournament matches from all our servers here.";
        }else{
            description += ".";
        }

        if(title === ""){
            title = "Recent Matches";
        }

        if(keywords.length === 0){
            keywords.push("recent");
        }
        


        return (<div>
            <DefaultHead 
                host={this.props.host} 
                title={title} 
                description={description} 
                keywords={`search,match,matches,history,${keywords.toString()}`}
            />
            <main>
                <Nav settings={this.props.navSettings} session={this.props.session}/>
                <div id="content">

                    <div className="default">
                        <div className="default-header">
                            Matches
                        </div>
                        {this.renderElems()}
                    </div>
                </div>
                <Footer session={this.props.session}/>
            </main>
        </div>);
    }
}


export async function getServerSideProps({req, query}){

    try{

        const session = new Session(req);
        await session.load();

        const settings = new SiteSettings();
        const navSettings = await settings.getCategorySettings("Navigation");

        const pageSettings = await settings.getCategorySettings("Matches Page");

        const defaultPerPage = pageSettings["Default Display Per Page"];

        let perPage = defaultPerPage;
        let page = 1;
        let gametype = 0;
        let displayType = 0;
        let server = 0;
        let map = 0;
        let displayMode = pageSettings["Default Display Type"];

        if(query.pp !== undefined){

            perPage = parseInt(query.pp);

            if(perPage !== perPage){
                perPage = defaultPerPage;
            }else{
                if(perPage < 5 || perPage > 100){
                    perPage = defaultPerPage;
                }
            }
        }

        if(query.gametype !== undefined){

            gametype = parseInt(query.gametype);
            if(gametype !== gametype) gametype = 0;

        }

        if(query.server !== undefined){

            server = parseInt(query.server);
            if(server !== server) server = 0;
        }

        if(query.map !== undefined){

            map = parseInt(query.map);
            if(map !== map) map = 0;
        }

        if(query.page !== undefined){

            page = parseInt(query.page);

            if(page !== page) page = 1;
        }

        if(query.display !== undefined){

            displayMode = parseInt(query.display);

            if(displayMode !== displayMode) displayMode = pageSettings["Default Display Type"];
        }

        await Analytics.insertHit(session.userIp, req.headers.host, req.headers["user-agent"]);


        let metaServerName = "";

        if(server !== 0){

            const serverManager = new Servers();
            metaServerName = await serverManager.getName(server);

        }

        let metaGametypeName = "";

        if(gametype !== 0){

            const gametypeManager = new Gametypes();
            metaGametypeName = await gametypeManager.getName(gametype);
        }

        let metaMapName = "";

        if(map !== 0){

            const mapManager = new Maps();
            metaMapName = await mapManager.getName(map);
        }

        return {
            "props": {
                "host": req.headers.host,
                "page": page,
                "perPage": perPage,
                "displayType": displayType,
                "session": JSON.stringify(session.settings),
                "navSettings": JSON.stringify(navSettings),
                "pageSettings": JSON.stringify(pageSettings),
                "perPage": perPage,
                "gametype": gametype,
                "server": server,
                "map": map,
                "displayMode": displayMode,
                "metaServerName": metaServerName,
                "metaGametypeName": metaGametypeName,
                "metaMapName": metaMapName
            }
        };

    }catch(err){

        return {
            "props": {
                "pageError": err.toString()
            }
        }
    }
}


export default Matches;