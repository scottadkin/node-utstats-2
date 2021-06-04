import React from 'react';
import Session from '../api/session';
import User from '../api/user';
import DefaultHead from '../components/defaulthead';
import Nav from '../components/Nav/';
import Footer from '../components/Footer';
import SiteSettings from '../api/sitesettings';
import styles from '../styles/Admin.module.css';
import AdminSettingsTable from '../components/AdminSettingsTable/';
import AdminManager from '../api/admin';
import Functions from '../api/functions';
import AdminUserTable from '../components/AdminUserTable/';
import Faces from '../api/faces';
import AdminFaces from '../components/AdminFaces/';
import AdminMatchesManager from '../components/AdminMatchesManager/';
import AdminPlayersManager from '../components/AdminPlayersManager/';
import Players from '../api/players';
import AdminGametypeManager from '../components/AdminGametypeManager/';
import Gametypes from '../api/gametypes'
import AdminRankingManager from '../components/AdminRankingManager/';
import Rankings from '../api/rankings';
import AdminPickupsManager from '../components/AdminPickupsManager/';
import Items from '../api/items';

class Admin extends React.Component{

    constructor(props){

        super(props);

        this.state = {
            "mode": 8, 
            "files": [], 
            "mapFiles": JSON.parse(this.props.mapFiles),
            "gametypeNames": JSON.parse(this.props.gametypeNames),
            "rankingEvents": JSON.parse(this.props.rankingEvents),
            "itemList": JSON.parse(this.props.itemList)
        };

        this.changeMode = this.changeMode.bind(this);
        this.uploadImage = this.uploadImage.bind(this);
        this.onChange = this.onChange.bind(this);
        this.uploadSingleMap = this.uploadSingleMap.bind(this);
        this.setRankingEvents = this.setRankingEvents.bind(this);
        this.setGametypeNames = this.setGametypeNames.bind(this);
        this.setItemList = this.setItemList.bind(this);
    }

    setItemList(data){
        this.setState({"itemList": data});
    }

    setRankingEvents(data){

        this.setState({"rankingEvents": data});
        
    }

    setGametypeNames(data){
        console.log(`UPDATE GAMETYPENAMES`);
        this.setState({"gametypeNames": data});
    }

    async uploadSingleMap(e, name, id){

        try{

            e.preventDefault();

            const formData = new FormData();

           // e.target[`map_${id}`].files[0].name = name;

            let file = new File([e.target[`map_${id}`].files[0]], name, {
                "type": "image/jpg"
            });

      
            //undefined
            if(file.size === 9){
                console.trace("No file selected");
                return;
            }

            console.log(file);

            formData.append("files", file);

           // console.log(formData);


            const req = await fetch("/api/mapimageupload", {
                "method": "POST",
                "body": formData
            })


            const result = await req.json();
            
            if(result.bPassed !== undefined){

                if(result.bPassed){
                    this.updateMapFileStatus(name);
                }
            }

        }catch(err){
            console.trace(err);
        }
    }

    updateMapFileStatus(name){

        const previous = this.state.mapFiles;

        const files = this.state.mapFiles.files;

        files.push(name);


        this.setState({"mapFiles": {"databaseNames": previous.databaseNames, "files": files}});


    }

    onChange(e){

        const files = [];

        for(let i = 0; i < e.target.files.length; i++){

            files.push(e.target.files[i]);

        }

        this.setState({"files": files});
    }

    changeMode(id){

        this.setState({"mode": id});
    }

    displaySettings(){

        if(this.state.mode !== 0) return null;

        const settings = JSON.parse(this.props.siteSettings);
        const validSettings = JSON.parse(this.props.validSiteSettings);

        const categories = {};

        let s = 0;

        for(let i = 0; i < settings.length; i++){

            s = settings[i];
            //if(categories.indexOf(settings[i].category) === -1) categories.push(settings[i].category);

            if(categories[s.category] !== undefined){
                
                categories[s.category].data.push({
                    "name": s.name,
                    "value": s.value
                });

            }else{

                categories[s.category] = {
                    "data":
                        [
                            {
                            "name": s.name,
                            "value": s.value
                            }
                        ]
                    };
            }
        }


        const elems = [];

        let currentValidSettings = [];

        let fixedKey = "";

        for(const [key, value] of Object.entries(categories)){

            currentValidSettings = [];

            fixedKey = key.toLowerCase();

            if(fixedKey === "players page"){
                currentValidSettings = validSettings.playersPage;
            }else if(fixedKey === "matches page"){
                currentValidSettings = validSettings.matchesPage;
            }else if(fixedKey === "home"){
                currentValidSettings = validSettings.home;
            }else if(fixedKey === "records page"){
                currentValidSettings = validSettings.recordsPage;
            }else if(fixedKey === "maps page"){
                currentValidSettings = validSettings.mapsPage;
            }else if(fixedKey === "player pages"){
                currentValidSettings = validSettings.playerPages;
            }else if(fixedKey === "rankings"){
                currentValidSettings = validSettings.rankings;
            }else if(fixedKey === "map pages"){
                currentValidSettings = validSettings.mapPages;
            }

            elems.push(<AdminSettingsTable key={key} title={key} data={value.data} validSettings={currentValidSettings}/>);
        }

        return <div>{elems}</div>
    }
    
    async uploadImage(e){

        try{
            console.log("uploadFile");

            e.preventDefault();

            const formData = new FormData();

            console.log(this.state.files);


            let names = [];


            //formData.append("files", this.state.files);

            for(let i = 0; i < this.state.files.length; i++){

               // console.log(this.state.files[i]);

                names.push(this.state.files[i].name);

                formData.append("files", this.state.files[i]);
            }


            if(process.browser){
                const req = await fetch(`/api/mapimageupload`, {
                    "method": "POST",
                    "body": formData
                });

                const result = await req.json();

                if(result.bPassed !== undefined){

                    if(result.bPassed){

                        for(let i = 0; i < names.length; i++){
                            this.updateMapFileStatus(names[i]);
                        }

                    }
                }
            }
        }catch(err){
            console.trace(err);
        }   
    }

    displayMapImageUpload(){

        if(this.state.mode !== 1) return null;

        return <div>
            <div className="default-header">Map Image Uploader</div>
            
            <form className="form"  method="POST" encType="multipart/form-data" onSubmit={this.uploadImage}>
                <div className="form-info">
                    Image names must be in all lowercase(Automatically done) without the gametype prefix. e.g CTF-Face.unr image file should be called face.jpg.<br/>
                    For best results the image should be in 16:9 aspect ratio, smaller files for icons are dynamically created by the site when needed.<br/>
                    Important: Remove the following characters from map names(Next.js doesn't seem to like them for next/image file names) [ ] ` 
                </div>
                <input type="file" 
                accept={`.jpg,.jpeg`}
                
                name="files" multiple={true} id="files" className="m-bottom-25 m-top-25" onChange={this.onChange}/>
                <input type="submit" className="search-button" value="Upload" />
            </form>
        </div>
    }

    bMapFileExist(name, files){

        
        if(files.indexOf(name) !== -1){
            return true;
        }

        return false;
    }

    displayMapImageUploadList(){

        if(this.state.mode !== 1) return null;

        const data = this.state.mapFiles;

        const files = data.files;
        const mapsData = data.databaseNames;
        const rows = [];

        let m = 0;


        let cleanName = "";
        let fileStatus = 0;
        

        const createRow = (id, name, cleanName, fileStatus, callback) => {

            rows.push(<tr key={id}>
                <td>{Functions.removeUnr(name)}</td>
                <td>{cleanName}</td>
                <td className={(fileStatus) ? "team-green" : "team-red"}>{(fileStatus) ? "Found" : "Missing"}</td>
                <td>
                    <form encType="multipart/form-data" method="POST" onSubmit={((e) =>{

                        callback(e, cleanName, id);
                    })}>
                        
                        <input type="file" id={`map_${id}`} accept=".jpg,.jpeg"/><input type="submit" value="Upload"/>
                    </form>
                </td>
            </tr>)
        }

        for(let i = 0; i < mapsData.length; i++){

            m = mapsData[i];

            cleanName = `${Functions.cleanMapName(m.name.toLowerCase())}.jpg`;
            fileStatus = this.bMapFileExist(cleanName, files);

            createRow(i, m.name, cleanName, fileStatus, this.uploadSingleMap);
       
        }

        return <div>
            <div className="default-header">Individual Map Image Upload</div>
            <div className="form m-bottom-25">
                <div className="form-info">
                    For Individual map image uploads the name of the file is automatically set for easy upload.
                </div>
            </div>
            <table className="t-width-1 td-1-left">
                <tbody>
                    <tr>
                        <th>Map Name</th>
                        <th>Required File</th>
                        <th>File Status</th>
                        <th>Upload</th>
                    </tr>
                    {rows}
                </tbody>
            </table>
        </div>
    }

    displayUserAccounts(){

        if(this.state.mode !== 2) return null; 

        return <AdminUserTable accounts={this.props.userAccounts}/>;
    }


    displayFaces(){

        if(this.state.mode !== 3) return null;

        return <AdminFaces data={this.props.faceData} files={this.props.faceFiles}/>
    }

    displayMatches(){

        if(this.state.mode !== 4) return null;

        return <AdminMatchesManager duplicates={this.props.duplicateMatches} />;
    }


    displayRanking(){

        if(this.state.mode !== 7) return null;

        return <AdminRankingManager names={this.state.gametypeNames}
        updateParentRankingValues={this.setRankingEvents} events={this.state.rankingEvents}/>
    }

    displayPlayersManager(){

        if(this.state.mode !== 5) return null
        return <AdminPlayersManager playerNames={this.props.playerNames}/>
    }

    displayGametypeManager(){

        if(this.state.mode !== 6) return null;

        return <AdminGametypeManager data={this.state.gametypeNames} updateParentGametypeNames={this.setGametypeNames}/>
    }

    displayPickupsManager(){

        if(this.state.mode !== 8) return null;

        return <AdminPickupsManager data={this.state.itemList} updateParentList={this.setItemList}/>
    }

    render(){

        if(!this.props.bUserAdmin){

            return <div>
                ACCESS DENIED.
            </div>
        }
        
        return <div>
            <DefaultHead title="Admin Control Panel"/>
            <main>
                <Nav session={this.props.session} settings={this.props.navSettings}/>

                <div id="content">
                    <div className="default">
                        <div className="default-header">Admin Control Panel</div>
                        <div className="big-tabs">
                            <div className={`big-tab ${(this.state.mode === 0) ? "tab-selected" : ""}`} onClick={(() =>{
                                this.changeMode(0);
                            })}>Site Settings</div>
                            <div className={`big-tab ${(this.state.mode === 2) ? "tab-selected" : ""}`} onClick={(() =>{
                                this.changeMode(2);
                            })}>Manage User Accounts</div>
                            <div className={`big-tab ${(this.state.mode === 4) ? "tab-selected" : ""}`} onClick={(() =>{
                                this.changeMode(4);
                            })}>Manage Matches</div>
                            <div className={`big-tab ${(this.state.mode === 5) ? "tab-selected" : ""}`} onClick={(() =>{
                                this.changeMode(5);
                            })}>Manage Players</div>
                            <div className={`big-tab ${(this.state.mode === 6) ? "tab-selected" : ""}`} onClick={(() =>{
                                this.changeMode(6);
                            })}>Manage Gametypes</div>
                            <div className={`big-tab ${(this.state.mode === 7) ? "tab-selected" : ""}`} onClick={(() =>{
                                this.changeMode(7);
                            })}>Manage Rankings</div>
                            <div className={`big-tab ${(this.state.mode === 8) ? "tab-selected" : ""}`} onClick={(() =>{
                                this.changeMode(8);
                            })}>Manage Pickups</div>
                            <div className={`big-tab ${(this.state.mode === 1) ? "tab-selected" : ""}`} onClick={(() =>{
                                this.changeMode(1);
                            })}>Map Image Uploader</div>
                            <div className={`big-tab ${(this.state.mode === 3) ? "tab-selected" : ""}`} onClick={(() =>{
                                this.changeMode(3);
                            })}>Face Image Uploader</div>
                            
                        </div>
                        {this.displaySettings()}
                        {this.displayMapImageUpload()}
                        {this.displayMapImageUploadList()}
                        {this.displayUserAccounts()}
                        {this.displayFaces()}
                        {this.displayMatches()}
                        {this.displayPlayersManager()}
                        {this.displayGametypeManager()}
                        {this.displayRanking()}
                        {this.displayPickupsManager()}
                    </div>   
                </div>

                <Footer session={this.props.session}/>
            </main>
        </div>
    }
}



export async function getServerSideProps({req, query}){

    const user = new User();
    const session = new Session(req);
    const settings = new SiteSettings();
    const faceManager = new Faces();
    

    await session.load();

    //console.log(session.settings);

    const bUserAdmin = await session.bUserAdmin();

    let currentSiteSettings = [];
    let validSiteSettings = {};

    let mapFiles = [];
    let userAccounts = [];
    let faceData = [];
    let faceFiles = [];
    let duplicateMatches = [];
    let playerNames = [];
    let gametypeNames = [];
    let rankingEvents = [];
    let itemList = [];

    if(bUserAdmin){

        currentSiteSettings = await settings.debugGetAllSettings();
       // console.log(currentSiteSettings);

        validSiteSettings.playersPage = settings.getPlayersPageValidSettings();
        validSiteSettings.matchesPage = await settings.getMatchesPageValidSettings();
        validSiteSettings.home = settings.getHomePageValidSettings();
        validSiteSettings.recordsPage = settings.getRecordsPageValidSettings();
        validSiteSettings.mapsPage = settings.getMapsPageValidSettings();
        validSiteSettings.playerPages = settings.getPlayerPagesValidSettings();
        validSiteSettings.rankings = settings.getRankingsValidSettings();
        validSiteSettings.mapPages = settings.getMapPagesValidSettings();

        const admin = new AdminManager();

        mapFiles = await admin.getMapsFolder();
        userAccounts = await admin.getAllUsers();
        faceData = await faceManager.getAll();
        
        faceFiles = faceManager.getAllFiles();

        duplicateMatches = await admin.getDuplicateMatches();

        const playerManager = new Players();

        playerNames = await playerManager.getAllNames();


        const gametypeManager = new Gametypes();

        gametypeNames = await gametypeManager.getAll();

        const rankingManager = new Rankings();

        rankingEvents = await rankingManager.getFullValues();

        const itemManager = new Items();

        itemList = await itemManager.getAll();

    }
    
    const navSettings = await settings.getCategorySettings("Navigation");

    console.log(`Is this user an admin ${bUserAdmin}`);


    
    return {
        props: {
            "navSettings": JSON.stringify(navSettings),
            "session": JSON.stringify(session.settings),
            "bUserAdmin": bUserAdmin,
            "siteSettings": JSON.stringify(currentSiteSettings),
            "validSiteSettings": JSON.stringify(validSiteSettings),
            "mapFiles": JSON.stringify(mapFiles),
            "userAccounts": JSON.stringify(userAccounts),
            "faceData": JSON.stringify(faceData),
            "faceFiles": JSON.stringify(faceFiles),
            "duplicateMatches": JSON.stringify(duplicateMatches),
            "playerNames": JSON.stringify(playerNames),
            "gametypeNames": JSON.stringify(gametypeNames),
            "rankingEvents": JSON.stringify(rankingEvents),
            "itemList": JSON.stringify(itemList)
        }
    };
}


export default Admin;