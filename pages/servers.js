import React from "react";
import DefaultHead from "../components/defaulthead";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import Session from "../api/session";
import SiteSettings from "../api/sitesettings";
import Analytics from "../api/analytics";
import Servers from "../api/servers";
import Table2 from "../components/Table2";
import Loading from "../components/Loading";
import Functions from "../api/functions";
import InteractiveTable from "../components/InteractiveTable";
import ServerDefaultView from "../components/ServerDefaultView";
import Maps from "../api/maps";

class ServersPage extends React.Component{

    constructor(props){

        super(props);
        this.state = {"bLoading": true, "displayMode": 0};
    }

    changeMode(id){
        this.setState({"displayMode": id});
    }

    async componentDidMount(){

        this.setState({"bLoading": false});
    }


    renderBasic(){

        const rows = [];

        const servers = JSON.parse(this.props.serverList);

        for(let i = 0; i < servers.length; i++){

            const s = servers[i];

            rows.push(<tr key={s.id}>
                <td className="text-left">{s.name}</td>
                <td>{s.ip}:{s.port}</td>
                <td>{Functions.convertTimestamp(s.first, true)}</td>
                <td>{Functions.convertTimestamp(s.last, true)}</td>
                <td>{s.matches}</td>
                <td className="playtime">{Functions.toPlaytime(s.playtime)}</td>
            </tr>);
        }

        return <Table2 width={1} key="basic">
            <tr>
                <th>Name</th>
                <th>IP:Port</th>
                <th>First Match</th>
                <th>Last Match</th>
                <th>Total Matches</th>
                <th>Total Playtime</th>
            </tr>
            {rows}
        </Table2>
    }


    renderTable(){

        if(this.state.bLoading) return <Loading/>;

        const elems = [];

        elems.push(<InteractiveTable key="servers" width={1} data={this.createTableData()} headers={{
                "name": "Name",
                "address": "Address",
                "first": "First Match",
                "last": "Last Match",
                "matches": "Total Matches",
                "playtime": "Playtime"
            }}/>
        );

        return elems;
    }


    createTableData(){

        const data = [];

        const servers = JSON.parse(this.props.serverList);

        for(let i = 0; i < servers.length; i++){

            const s = servers[i];

            const url = `/matches/?server=${s.id}`;

            data.push({
                "name": {"value": s.name, "className": "text-left", "url": url},
                "address": {"value": `${s.ip}:${s.port}`},
                "first": {"displayValue": Functions.convertTimestamp(s.first, true), "value": s.first, "className": "playtime"},
                "last": {"displayValue": Functions.convertTimestamp(s.first, true), "value": s.last, "className": "playtime"},
                "matches": {"value": s.matches},
                "playtime": {"displayValue": Functions.toPlaytime(s.playtime), "value": s.playtime, "className": "playtime"},
            });
        }

        return data;
    }

    renderDefaultView(){

        const elems = [];

        const servers = JSON.parse(this.props.serverList);

        for(let i = 0; i < servers.length; i++){

            const s = servers[i];
            elems.push(<ServerDefaultView key={s.id} mapNames={JSON.parse(this.props.mapNames)} mapImages={JSON.parse(this.props.mapImages)} data={s}/>);
        }

        return elems;
    }

    renderServerList(){

        if(this.state.displayMode === 0) return this.renderDefaultView();
        if(this.state.displayMode === 1) return this.renderTable();

        return null;
    }

    render(){

        return <div>
		<DefaultHead host={this.props.host} title={"Servers"} description="View information about our servers" keywords="server"/>	
		<main>
			<Nav settings={this.props.navSettings} session={this.props.session}/>
			<div id="content">
				<div className="default">
			
                <div className="default-header">Servers</div>
                <div className="tabs">
                    <div className={`tab ${(this.state.displayMode === 0) ? "tab-selected" : ""}`} onClick={(() =>{
                        this.changeMode(0);
                    })}>
                        Default View
                    </div>
                    <div className={`tab ${(this.state.displayMode === 1) ? "tab-selected" : ""}`} onClick={(() =>{
                        this.changeMode(1);
                    })}>
                        Table View
                    </div>
                </div>
                {this.renderServerList()}
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

    const siteSettings = new SiteSettings();

	const pageSettings = await siteSettings.getCategorySettings("Servers");
	const pageOrder = await siteSettings.getCategoryOrder("Servers");
	const navSettings = await siteSettings.getCategorySettings("Navigation");

    await Analytics.insertHit(session.userIp, req.headers.host, req.headers["user-agent"]);


    const serverManager = new Servers();

    const serverList = await serverManager.getAll();

    const mapIds = new Set();
    
    for(let i = 0; i < serverList.length; i++){

        const s = serverList[i];
        mapIds.add(s.last_map_id);
    }

    const mapManager = new Maps();
    const mapNames = await mapManager.getNames([...mapIds]);

    const mapNamesArray = [];

    for(const value of Object.values(mapNames)){
        mapNamesArray.push(value);
    }

    const mapImages = await mapManager.getImages(mapNamesArray);

    return {
        "props": {
            "navSettings": JSON.stringify(navSettings),
            "pageSettings": JSON.stringify(pageSettings),
            "pageOrder": pageOrder,
            "session": JSON.stringify(session.settings),
            "host": req.headers.host,
            "serverList": JSON.stringify(serverList),
            "mapNames": JSON.stringify(mapNames),
            "mapImages": JSON.stringify(mapImages)
        }
    }
}

export default ServersPage;