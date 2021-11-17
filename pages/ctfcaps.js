import React from "react";
import Session from "../api/session";
import DefaultHead from "../components/defaulthead";
import Footer from "../components/Footer";
import Nav from "../components/Nav";
import SiteSettings from "../api/sitesettings";
import CTF from "../api/ctf";
import Maps from "../api/maps";
import MapFastestCaps from "../components/MapFastestCaps";
import Functions from "../api/functions";
import Link from 'next/link';
import CTFMapRecords from '../components/CTFMapRecords';

class CTFCaps extends React.Component{

    constructor(props){

        super(props);

        let selected = this.props.mapId;

        const maps = JSON.parse(this.props.maps);

        if(maps.length > 0 && selected === -1){
            selected = maps[0].id;
        }

        this.state = {"selectedMap": selected, "perPage": 25, "page": 0, "type": 0, "newMapId": -1, "mode": 1};

        this.changeSelected = this.changeSelected.bind(this);
        this.changeMode = this.changeMode.bind(this);
    }

    changeMode(id){

        this.setState({"mode": id});
    }

    changeSelected(e){

        this.setState({"newMapId": e.target.value});
        //window.history.pushState({"map": e.target.value}, "", `/ctfcaps?map=${e.target.value}`);
       // window.location = `/ctfcaps?map=${e.target.value}`;
    }

    async componentDidUpdate(prevProps){

        if(prevProps.mapId !== this.props.mapId){
            this.setState({"selectedMap": this.props.mapId});
        }
    }


    renderMapsForm(){

        const maps = JSON.parse(this.props.maps);

        const options = [];

        let selected = this.state.selectedMap;

        for(let i = 0; i < maps.length; i++){

            const m = maps[i];

            if(i === 0 && selected === -1){
                selected = m.id;
               // this.setState({"selectedMap": m.id});
            }

            options.push(<option key={i} value={m.id}>{m.name}</option>);
        }

        return <div>
            <div className="form">
                <div className="default-sub-header-alt">Choose a Map</div>
                <div className="select-row">
                    <div className="select-label">
                        Map
                    </div>
                    <div>
                        <select className="default-select" defaultValue={selected} onChange={this.changeSelected}>
                            {options}
                        </select>
                    </div>
                </div>
                <Link href={`/ctfcaps?map=${this.state.newMapId}`}><a><div className="search-button">Load Data</div></a></Link>
            </div>
        </div>
    }

    getMapName(id){

        id = parseInt(id);
        const maps = JSON.parse(this.props.maps);

        for(let i = 0; i < maps.length; i++){

            const m = maps[i];

            if(m.id === id) return m.name;
        }

        return "Not Found";
    }

    renderMapCaps(){

        if(this.state.mode !== 0) return null;

        return <>
            {this.renderMapsForm()}
            <MapFastestCaps 
                host={Functions.getImageHostAndPort(this.props.host)} 
                mapId={parseInt(this.state.selectedMap)}
                perPage={this.state.perPage}
            />
        </>
    }

    
    renderAllMapRecords(){

        if(this.state.mode !== 1) return null;

        return <CTFMapRecords host={Functions.getImageHostAndPort(this.props.host)} maps={JSON.parse(this.props.maps)}/>
    }

    render(){

        let mapName = "";
        let desc = `View the fastest CTF caps for each map.`;

        if(this.state.selectedMap !== -1){

            mapName = this.getMapName(this.state.selectedMap);
            desc = `View the fastest CTF caps for ${mapName}`
        }
        

        const title = `${mapName} CTF Cap Records`;
        

    

        return <div>
            <DefaultHead title={`${title}`} 
                description={desc} 
                host={this.props.host}
                keywords={`ctf,cap,records${(mapName !== "") ? `,${mapName}` : "" }`}
            />
            <main>
                <Nav settings={this.props.navSettings} session={this.props.session}/>
                <div id="content">
                    <div className="default">
                        <div className="default-header">Capture The Flag Cap Records</div>
                        <div className="big-tabs">
                            <Link href={`/records`}><a><div className="big-tab">General Records</div></a></Link>
                            <div className="big-tab tab-selected">CTF Cap Records</div>
                        </div>
                        <div className="tabs">
                            <div className={`tab ${(this.state.mode === 0) ? "tab-selected" : ""}`} onClick={(() =>{
                                this.changeMode(0);
                            })}>Map Caps</div>
                            <div className={`tab ${(this.state.mode === 1) ? "tab-selected" : ""}`}  onClick={(() =>{
                                this.changeMode(1);
                            })}>Map Records</div>
                        </div>
                        {this.renderMapCaps()}
                        {this.renderAllMapRecords()}
                    </div>
                </div>
            </main>
            <Footer session={this.props.session}/>
        </div>
    }
}


export default CTFCaps;

export async function getServerSideProps({req, query}){

    const mapId = query.map ?? -1;

    const session = new Session(req);

    await session.load();

    const navSettings = await SiteSettings.getSettings("Navigation");

    const ctfManager = new CTF();
    const validMaps = await ctfManager.getAllMapsWithCaps();
    // const records = await ctfManager.getMapsCapRecords(validMaps);

    //console.log(records);

    const mapManager = new Maps();

    const mapNames = await mapManager.getNamesByIds(validMaps);

    return {
        "props": {
            "host":  req.headers.host,
            "session": JSON.stringify(session.settings),
            "navSettings": JSON.stringify(navSettings),
            "maps": JSON.stringify(mapNames),
            "mapId": mapId
        }
    }
}