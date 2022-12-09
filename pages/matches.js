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

class Matches extends React.Component{

    constructor(props){

        super(props);

        this.state = {
            "bLoadedInitial": false, 
            "error": null, 
            "serverNames": null, 
            "selectedServer": props.server, 
            "selectedGametype": props.gametype,
            "selectedMap": props.map,
            "perPage": props.perPage
        };

        this.changeSelected = this.changeSelected.bind(this);
    }

    async changeSelected(type, value){

        const obj = {};

        obj[type] = value;

        this.setState(obj);
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

    async componentDidMount(){

        await this.loadNames();
    }

    getPerPageData(){

        const data = {};

        data["5"] = 5;
        data["10"] = 10;
        data["25"] = 25;
        data["50"] = 50;
        data["100"] = 100;

        return data;
    }


    renderSearchForm(){

        const url = `/matches/?server=${this.state.selectedServer}&gametype=${this.state.selectedGametype}&map=${this.state.selectedMap}&page=1&pp=${this.state.perPage}`;

        return <div className="form">
            <DropDown dName="Server" fName="selectedServer" originalValue={this.state.selectedServer.toString()} data={this.state.serverNames} changeSelected={this.changeSelected}/>
            <DropDown dName="Gametype" fName="selectedGametype" originalValue={this.state.selectedGametype.toString()} data={this.state.gametypeNames} changeSelected={this.changeSelected}/>
            <DropDown dName="Map" fName="selectedMap" originalValue={this.state.selectedMap.toString()} data={this.state.mapNames} changeSelected={this.changeSelected}/>
            <DropDown dName="Results Per Page" fName="perPage" originalValue={this.state.perPage.toString()} data={this.getPerPageData()} changeSelected={this.changeSelected}/>
            <Link href={url}>
                <a>
                    <div className="search-button">Search</div>
                </a>
            </Link>
        </div>
    }

    renderElems(){

        if(this.state.error !== null){
            return <ErrorMessage title="Recent Matches" text={this.state.error}/>
        }

        if(!this.state.bLoadedInitial){
            return <Loading />;
        }

        return this.renderSearchForm();
    }

    render(){

        if(this.props.pageError !== undefined){

            return <ErrorPage>{this.props.pageError}</ErrorPage>
        }


        return (<div>
            <DefaultHead 
                host={this.props.host} 
                /*title={`Recent Matches${nameString} Page ${this.props.page} of ${pages}`} 
                description={`Viewing Recent Matches${nameString} page ${this.props.page} of ${pages}, matches ${start} to ${end} out of a possible ${this.props.totalMatches} matches.`} 
                keywords={`search,match,matches,page ${this.props.page}`}*/
            />
            <main>
                <Nav settings={this.props.navSettings} session={this.props.session}/>
                <div id="content">

                    <div className="default">
                        <div className="default-header">
                            Recent Matches
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

        await Analytics.insertHit(session.userIp, req.headers.host, req.headers["user-agent"]);

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
                "map": map
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