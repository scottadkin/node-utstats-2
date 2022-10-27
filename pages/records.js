import DefaultHead from "../components/defaulthead";
import Nav from "../components/Nav/";
import Footer from "../components/Footer/";
import Players from "../api/players";
import Functions from "../api/functions";
import RecordsList from "../components/RecordsList/";
import Pagination from "../components/Pagination/";
import React from "react";
import Link from "next/link";
import Maps from "../api/maps";
import Session from "../api/session";
import SiteSettings from "../api/sitesettings";
import Analytics from "../api/analytics";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";

class Records extends React.Component{

    constructor(props){

        super(props);

        this.state = {"mode": 0, "loaded": true, "error": null};
    }


    async loadData(){


    }

    async componentDidMount(){

        await this.loadData();
    }


    renderTotalOptions(){

        
        const types = [
            {"type": "playtime", "display": "Playtime"},
            {"type": "matches", "display": "Matches"},
            {"type": "wins", "display": "Wins"},
            {"type": "losses", "display": "Losses"},
            {"type": "draws", "display": "Draws"},
            {"type": "kills", "display": "Kills"},
            {"type": "deaths", "display": "Deaths"},
            {"type": "suicides", "display": "Suicides"},
            {"type": "team_kills", "display": "Team Kills"},
            {"type": "spawn_kills", "display": "Spawn Kills"},
            {"type": "first_bloods", "display": "First Bloods"},
            {"type": "frags", "display": "Frags"},
            {"type": "score", "display": "Score"},
            {"type": "spree_best", "display": "Best Killing Spree"},
            {"type": "multi_best", "display": "Best Multi Kill"},
            {"type": "efficiency", "display": "Efficiency"},

            {"type": "flag_assist", "display": "CTF Flag Assists"},
            {"type": "flag_return", "display": "CTF Flag Returns"},
            {"type": "flag_taken", "display": "CTF Flag Grabs"},
            {"type": "flag_dropped", "display": "CTF Flag Drops"},
            {"type": "flag_capture", "display": "CTF Flag Captures"},
            {"type": "flag_pickup", "display": "CTF Flag Pickups"},
            {"type": "flag_seal", "display": "CTF Flag Seals"},
            {"type": "flag_cover", "display": "CTF Flag Covers"},
            {"type": "flag_kill", "display": "CTF Flag Kills"},
            {"type": "flag_save", "display": "CTF Flag Close Returns"},
            {"type": "flag_carry_time", "display": "CTF Flag Carry Time"},
            {"type": "flag_self_cover", "display": "CTF Kills Carrying Flag"},
            {"type": "flag_multi_cover", "display": "CTF Multi Covers"},
            {"type": "flag_spree_cover", "display": "CTF Cover Sprees"},

            {"type": "flag_cover_best", "display": "CTF Most Cover Kills"},
            {"type": "flag_self_cover_best", "display": "CTF Most Kills With Flag"},
        ];

        types.sort((a, b) =>{

            a = a.display.toLowerCase();
            b = b.display.toLowerCase();

            if(a < b){
                return -1;
            }else if(a > b){
                return 1;
            }

            return 0;
        });

        const options = [];

        for(let i = 0; i < types.length; i++){

            const {type, display} = types[i];

            options.push(<option key={type} value={type}>{display}</option>);
        }

        return <div>
            <div className="default-sub-header">Select Record Type</div>
                <div className="form">
                
                <div className="select-row">
                    <div className="select-label">Record Type</div>
                    <select className="default-select">
                        {options}
                    </select>
                </div>
                <div className="search-button">Search</div>
            </div>
        </div>
    }


    renderElems(){

        if(this.state.error !== null) return <ErrorMessage title="Records" text={this.state.error}/>
        if(!this.state.loaded) return <Loading/>;

        return <div>
            <div className="tabs">
                <Link href={`/records/?mode=0&page=0`}>
                    <a>
                        <div className={`tab ${(this.props.mode === 0) ? "tab-selected" : ""}`}>Player Total Records</div>
                    </a>
                </Link>
                <Link href={`/records/?mode=1&page=0`}>
                    <a>
                        <div className={`tab ${(this.props.mode === 1) ? "tab-selected" : ""}`}>Player Match Records</div>
                    </a>
                </Link>
                <Link href={`/records/?mode=2&page=0`}>
                    <a>
                        <div className={`tab ${(this.props.mode === 2) ? "tab-selected" : ""}`}>CTF Cap Records</div>
                    </a>
                </Link>
                <Link href={`/records/?mode=3&page=0`}>
                    <a>
                        <div className={`tab ${(this.props.mode === 3) ? "tab-selected" : ""}`}>Combogib Records</div>
                    </a>
                </Link>
            </div>
            {this.renderTotalOptions()}
        </div>
    }

    getTitle(){

        const m = this.props.mode;

        if(m === 0) return "Player Total Records";
        if(m === 1) return "Player Match Records";
        if(m === 2) return "CTF Cap Records";
        if(m === 3) return "Combogib Records";

        return "Unknown";
    }

    render(){

        return <div>
            <DefaultHead 
            title={this.getTitle()} 
            description={`records descp`} 
            host={this.props.host}
            keywords={`records,record`}/>
            <main>
                <Nav settings={this.props.navSettings} session={this.props.session}/>
                <div id="content">
                    <div className="default">
                        <div className="default-header">Records</div>
                        {this.renderElems()}
                    </div>
                </div>
                <Footer session={this.props.session}/>
            </main>
        </div>
    }
}

export async function getServerSideProps({req, query}){

    const session = new Session(req);
	await session.load();

    let mode = parseInt(query.mode) ?? 0;
    if(mode !== mode) mode = 0;

    let page = parseInt(query.page) ?? 0;
    if(page !== page) page = 0;

    let type = query.type ?? "kills";

    
   

    const settings = new SiteSettings();
    const navSettings = await settings.getCategorySettings("Navigation");
    const pageSettings = await settings.getCategorySettings("Records Page");

    await Analytics.insertHit(session.userIp, req.headers.host, req.headers["user-agent"]);

    return {
        "props": {
            "host": req.headers.host,
            "mode": mode,
            "type": type.toLowerCase(),
            "session": JSON.stringify(session.settings),
            "navSettings": JSON.stringify(navSettings),
            "pageSettings": JSON.stringify(pageSettings)
        }
    }
}

export default Records;