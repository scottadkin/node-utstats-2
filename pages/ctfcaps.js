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
import CTFCapRecordsPlayers from "../components/CTFCapRecordsPlayers";

class CTFCaps extends React.Component{

    constructor(props){

        super(props);

        this.state = {"selectedMap": this.props.mapId, "perPage": 25, "page": 0, "newMapId": -1};

        this.changeSelected = this.changeSelected.bind(this);

    }

    changeSelected(e){

        this.setState({"newMapId": e.target.value});
        //window.history.pushState({"map": e.target.value}, "", `/ctfcaps?map=${e.target.value}`);
       // window.location = `/ctfcaps?map=${e.target.value}`;
    }

    async componentDidMount(){

        let selected = this.props.mapId;

        const maps = JSON.parse(this.props.maps);

        if(maps.length > 0 && selected === -1){
            selected = maps[0].id;
        }

        this.setState({"selectedMap": selected});
    }

    async componentDidUpdate(prevProps, prevState){

        let selected = this.props.mapId;

        const maps = JSON.parse(this.props.maps);

        if(maps.length > 0 && selected === -1){
            selected = maps[0].id;
        }

        if(prevProps.mapId !== this.props.mapId){
            this.setState({"selectedMap": this.props.mapId});
            return;
        }

        if(this.state.selectedMap === -1){

            if(maps.length > 0){
                this.setState({"selectedMap": selected});
            }
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

        if(this.props.mode !== 0) return null;

        const maps = JSON.parse(this.props.maps);

        if(maps.length === 0){
            return <>
                <div className="default-header">No Data Found</div>
            </>;
        }

        return <>
            {this.renderMapsForm()}
            <MapFastestCaps 
                host={Functions.getImageHostAndPort(this.props.host)} 
                mapId={parseInt(this.state.selectedMap)}
                perPage={this.state.perPage}
                mode={this.props.subMode}
                page={this.props.page}
                mapName={this.getMapName(parseInt(this.state.selectedMap))}
                
            />
        </>
    }

    
    renderAllMapRecords(){

        if(this.props.mode !== 1) return null;

        const maps = JSON.parse(this.props.maps);

        if(maps.length === 0){
            return <>
                <div className="default-header">No Data Found</div>
            </>;
        }

        return <CTFMapRecords 
            host={Functions.getImageHostAndPort(this.props.host)} 
            maps={JSON.parse(this.props.maps)}
            mode={this.props.subMode}
        />
    }

    renderPlayerCapRecords(){

        if(this.props.mode !== 2) return null;

        return <CTFCapRecordsPlayers mode={this.props.subMode} host={Functions.getImageHostAndPort(this.props.host)} settings={this.props.pageSettings}/>;
    }

    render(){

        let mapName = "";
        let desc = `View the fastest CTF caps for each map.`;

        let title = "";

        if(this.props.mode === 0){

            if(this.state.selectedMap !== -1){

                mapName = this.getMapName(this.state.selectedMap);
                desc = `View the fastest CTF caps for ${mapName}`

            }

            let subString = "";

            if(this.props.subMode === 1){
                subString = "Solo ";
            }else if(this.props.subMode === 2){
                subString = "Assisted ";
            }

            title = `${mapName} ${subString}Cap Records`;

        }else if(this.props.mode === 1){

            desc = `View all the current map ctf cap records.`;
            title = `CTF Map Records`;

        }else if(this.props.mode === 2){
            
            let recordSubstring = "Solo";
            
            if(this.props.subMode === 1){
                recordSubstring = "Assisted";
            }

            desc = `View a list of players with the most ${recordSubstring} CTF cap records.`;
            title = `Player ${recordSubstring} CTF Cap Records`;
        }

        return <div>
            <DefaultHead title={`${title}`} 
                description={desc} 
                host={this.props.host}
                keywords={`ctf,cap,records${(mapName !== "") ? `,${mapName}` : "" }`}
                image={this.props.image}
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
                            <Link href={`/ctfcaps/?mode=0`}>
                                <a>
                                    <div className={`tab ${(this.props.mode === 0) ? "tab-selected" : ""}`} >Map Caps</div>
                                </a>
                            </Link>
                            <Link href={`/ctfcaps/?mode=1`}>
                                <a>
                                    <div className={`tab ${(this.props.mode === 1) ? "tab-selected" : ""}`}  >Map Records</div>
                                </a>
                            </Link>
                            <Link href={`/ctfcaps/?mode=2`}>
                                <a>
                                    <div className={`tab ${(this.props.mode === 2) ? "tab-selected" : ""}`}  >Player Records</div>
                                </a>
                            </Link>
                        </div>
                        {this.renderMapCaps()}
                        {this.renderAllMapRecords()}
                        {this.renderPlayerCapRecords()}
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
    let mode = query.mode ?? 0;
    let subMode = query.submode ?? 0;
    let page = query.page ?? 1;

    mode = parseInt(mode);
    if(mode !== mode) mode = 0;

    subMode = parseInt(subMode);
    if(subMode !== subMode) subMode = 0;

    page = parseInt(page);
    if(page !== page) page = 1;

    const session = new Session(req);

    await session.load();

    const navSettings = await SiteSettings.getSettings("Navigation");
    const pageSettings = await SiteSettings.getSettings("Records Page");


    const ctfManager = new CTF();
    const validMaps = await ctfManager.getAllMapsWithCaps();

    const mapManager = new Maps();

    const mapNames = await mapManager.getNamesByIds(validMaps);

    let image = null;

    if(mapId !== -1){
        
        for(let i = 0; i < mapNames.length; i++){

            const m = mapNames[i];

            if(m.id === parseInt(mapId)){
                
                image = await mapManager.getImage(mapManager.removeUnr(m.name));

                const reg = /^.+\/(.+).jpg$/i;
                const result = reg.exec(image);
                
                if(result !== null){
                    image = `maps/${result[1]}`;
                }
                
                break;
            }
        }
        //image = await mapManager.getImage(mapManager.removeUnr(basicData[0].name));
    }else{
        image = "temp";
    }

    return {
        "props": {
            "host":  req.headers.host,
            "session": JSON.stringify(session.settings),
            "navSettings": JSON.stringify(navSettings),
            "pageSettings": JSON.stringify(pageSettings),
            "maps": JSON.stringify(mapNames),
            "mapId": mapId,
            "mode": mode,
            "subMode": subMode,
            "page": page,
            "image": image
        }
    }
}