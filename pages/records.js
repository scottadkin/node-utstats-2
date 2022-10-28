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
import Table2 from "../components/Table2";
import CountryFlag from "../components/CountryFlag";

class Records extends React.Component{

    constructor(props){

        super(props);

        this.state = {
            "mode": 0, 
            "loaded": false, 
            "error": null, 
            "type": this.props.type, 
            "perPage": this.props.perPage
        };

        this.changeType = this.changeType.bind(this);
        this.changePerPage = this.changePerPage.bind(this);
    }

    changeType(e){

        this.setState({"type": e.target.value});
    }

    changePerPage(e){

        this.setState({"perPage": e.target.value});
    }


    async loadData(){

        let mode = this.state.mode;

        if(mode === 0){
            mode = "totals";
        }else if(mode === 1){
            mode = "match";
        }else if(mode === 2){
            mode = "ctf";
        }else if(mode === 3){
            mode = "combogib";
        }

        const req = await fetch("/api/records",{
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": mode, "type": this.state.type, "page": this.props.page, "perPage": this.state.perPage})
        });

        const res = await req.json();

        if(res.error !== undefined){
            this.setState({"error": res.error});
        }else{
            this.setState({"data": res.data});
        }

        this.setState({"loaded": true});
    }

    async componentDidMount(){

        await this.loadData();
    }

    async componentDidUpdate(prevProps){

        if(prevProps.mode !== this.props.mode || 
            prevProps.type !== this.props.type || 
            prevProps.page !== this.props.page ||
            prevProps.perPage !== this.props.perPage
        ){
            await this.loadData();
        }
    }


    renderTotalOptions(){
        
        const types = [...this.props.validTypes.totals];
        
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
                    <select value={this.state.type} onChange={this.changeType}  className="default-select">
                        {options}
                    </select>
                </div>
                <div className="select-row">
                    <div className="select-label">Results Per Page</div>
                    <select value={this.props.perPage} onChange={this.changePerPage} className="default-select">
                        <option value="25">25</option>
                        <option value="50">50</option>
                        <option value="75">75</option>
                        <option value="100">100</option>
                    </select>
                </div>
                <Link href={`/records/?mode=${this.props.mode}&type=${this.state.type}&page=0&pp=${this.state.perPage}`}>
                    <a>
                        <div className="search-button">Search</div>
                    </a>
                </Link>
            </div>
        </div>
    }


    getTypeTitle(){

        let types = [];

        if(this.props.mode === 0){
            types = this.props.validTypes.totals;
        }

        for(let i = 0; i < types.length; i++){

            const {type, display} = types[i];

            if(type === this.props.type) return display;
        }

        return "Unknown type";

    }


    renderTable(){

        const type = this.getTypeTitle();
        let title = type;

        if(this.props.mode === 0){
            title = `Player Total Records For ${title}`;
        }


        const hours = ["flag_carry_time", "playtime"];

        const rows = [];

        for(let i = 0; i < this.state.data.length; i++){

            const d = this.state.data[i];

            let place = 1 + i + (this.props.page * this.state.perPage);
            rows.push(<tr key={`${i}-${d.value}-${d.player_id}`}>
                <td>
                <span className="small-font yellow">
                        {place}{Functions.getOrdinal(place)}
                    </span>&nbsp;
                </td>
                <td className="text-left">
                    <Link href={`/player/${d.player_id}`}>
                        <a>
                            <CountryFlag country={d.country}/>
                            {d.name}
                        </a>
                    </Link>
                </td>
                <td className="small-font grey">{Functions.convertTimestamp(d.last, true, false)}</td>
                <td>{d.matches}</td>
                <td>{Functions.toHours(d.playtime)} Hours</td>
                <td>{(hours.indexOf(this.props.type) === -1) ? d.value : `${Functions.toHours(d.value)} Hours`}</td>
            </tr>);
        }

        return <div className="m-top-25">
            <Table2 width={1} header={title}>
                <tr>
                    <th>Place</th>
                    <th>Player</th>
                    <th>Last Seen</th>
                    <th>Matches</th>
                    <th>Playtime</th>
                    <th>{type}</th>
                </tr>
                {rows}
            </Table2>
        </div>
    }

    renderElems(){

        if(this.state.error !== null) return <ErrorMessage title="Records" text={this.state.error}/>
        if(!this.state.loaded) return <Loading/>;

        return <div>
            <div className="tabs">
                <Link href={`/records/?mode=0&page=0&pp=${this.state.perPage}`}>
                    <a>
                        <div className={`tab ${(this.props.mode === 0) ? "tab-selected" : ""}`}>Player Total Records</div>
                    </a>
                </Link>
                <Link href={`/records/?mode=1&page=0&pp=${this.state.perPage}`}>
                    <a>
                        <div className={`tab ${(this.props.mode === 1) ? "tab-selected" : ""}`}>Player Match Records</div>
                    </a>
                </Link>
                <Link href={`/records/?mode=2&page=0&pp=${this.state.perPage}`}>
                    <a>
                        <div className={`tab ${(this.props.mode === 2) ? "tab-selected" : ""}`}>CTF Cap Records</div>
                    </a>
                </Link>
                <Link href={`/records/?mode=3&page=0&pp=${this.state.perPage}`}>
                    <a>
                        <div className={`tab ${(this.props.mode === 3) ? "tab-selected" : ""}`}>Combogib Records</div>
                    </a>
                </Link>
            </div>
            {this.renderTotalOptions()}
            {this.renderTable()}
        </div>
    }

    getTitle(){

        const m = this.props.mode;

        if(m === 0) return `${this.getTypeTitle()} - Player Total Records`;
        if(m === 1) return `${this.getTypeTitle()} - Player Match Records`;
        if(m === 2) return `${this.getTypeTitle()} - CTF Cap Records`;
        if(m === 3) return `${this.getTypeTitle()} - Combogib Records`;

        return "Unknown";
    }

    render(){


        return <div>
            <DefaultHead 
            title={this.getTitle()} 
            description={`records descp`} 
            host={this.props.host}
            keywords={`${this.getTypeTitle().replaceAll(" ",",").toLowerCase()},player,record`}/>
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

    let perPage = parseInt(query.pp) ?? 25;
    if(perPage !== perPage) perPage = 25;

    const settings = new SiteSettings();
    const navSettings = await settings.getCategorySettings("Navigation");
    const pageSettings = await settings.getCategorySettings("Records Page");

    const playerManager = new Players();
    const validTypes = playerManager.getValidRecordTypes();

    await Analytics.insertHit(session.userIp, req.headers.host, req.headers["user-agent"]);

    return {
        "props": {
            "host": req.headers.host,
            "mode": mode,
            "page": page,
            "type": type.toLowerCase(),
            "perPage": perPage,
            "validTypes": validTypes,
            "session": JSON.stringify(session.settings),
            "navSettings": JSON.stringify(navSettings),
            "pageSettings": JSON.stringify(pageSettings)
        }
    }
}

export default Records;