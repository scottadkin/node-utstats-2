import React from 'react';
import Session from '../api/session';
import User from '../api/user';
import DefaultHead from '../components/defaulthead';
import Nav from '../components/Nav/';
import Footer from '../components/Footer';
import SiteSettings from '../api/sitesettings';
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
import AdminWeaponImageUploader from '../components/AdminWeaponImageUploader/';
import Weapons from '../api/weapons';
import AdminFTPManager from '../components/AdminFTPManager/';
import NexgenStatsViewer from '../api/nexgenstatsviewer';
import AdminNexgenStatsViewer from '../components/AdminNexgenStatsViewer';
import MonsterHunt from '../api/monsterhunt';
import AdminMonsterHunt from '../components/AdminMonsterHunt';

class Admin extends React.Component{

    constructor(props){

        super(props);

        this.state = {
            "mode": 12, 
            "files": [], 
            "mapFiles": JSON.parse(this.props.mapFiles),
            "gametypeNames": JSON.parse(this.props.gametypeNames),
            "rankingEvents": JSON.parse(this.props.rankingEvents),
            "itemList": JSON.parse(this.props.itemList),
            "weaponData": JSON.parse(this.props.weaponData),
            "ftpServers": JSON.parse(this.props.ftpServers),
            "nexgenStatsViewerSettings": JSON.parse(this.props.nexgenStatsViewerSettings),
            "lastSavedNexgenSettings": JSON.parse(this.props.nexgenStatsViewerSettings),
            "nexgenSaveInProgress": false,
            "nexgenSavePassed": null,
            "nexgenErrors": [],
            "nexgenCreateInProgress": false,
            "nexgenCreatePassed": null,
            "nexgenCreateErrors": [],
            "monsterFiles": JSON.parse(this.props.monsterImages)
        };

        this.changeMode = this.changeMode.bind(this);
        this.uploadImage = this.uploadImage.bind(this);
        this.onChange = this.onChange.bind(this);
        this.uploadSingleMap = this.uploadSingleMap.bind(this);
        this.setRankingEvents = this.setRankingEvents.bind(this);
        this.setGametypeNames = this.setGametypeNames.bind(this);
        this.setItemList = this.setItemList.bind(this);
        this.updateWeaponData = this.updateWeaponData.bind(this);
        this.updateFtpServers = this.updateFtpServers.bind(this);
        this.updateNexgenSettings = this.updateNexgenSettings.bind(this);
        this.saveNexgenSettings = this.saveNexgenSettings.bind(this);
        this.setFullNexgenList = this.setFullNexgenList.bind(this);
        this.deleteNexgenEntry = this.deleteNexgenEntry.bind(this);
        this.nexgenCreateList = this.nexgenCreateList.bind(this);
        this.addMonsterImage = this.addMonsterImage.bind(this);
    }

    addMonsterImage(file){

        const newFiles = Object.assign(this.state.monsterFiles);

        newFiles.push(file);
        
        this.setState({"monsterFiles": newFiles});
    }

    async nexgenCreateList(e){

        try{

            e.preventDefault(e);

            this.setState({
                "nexgenCreateInProgress": true,
                "nexgenCreatePassed": null,
                "nexgenCreateErrors": []
            });

            const title = e.target[0].value;
            const type = e.target[1].value;
            const gametype = e.target[2].value;
            const players = parseInt(e.target[3].value);

            const errors = [];

            if(title.length === 0) errors.push("Title can not be an empty string");
            if(type < 0) errors.push("You have not selected a list type");
            if(gametype < 0) errors.push("You have not selected a gametype");

            if(errors.length === 0){

                const req = await fetch("/api/adminnexgen", {         
                    "headers": {"Content-Type": "application/json"},
                    "method": "POST",
                    "body": JSON.stringify({"mode":"create", "data": {
                        "title": title, 
                        "type": type, 
                        "gametype": gametype, 
                        "players": players, 
                        "position": this.state.nexgenStatsViewerSettings.length
                    }})
                });

                const result = await req.json();

                if(result.message === "passed"){

                    if(result.insertId >= 0){

                        const newData = Object.assign(this.state.nexgenStatsViewerSettings);

                        newData.push(
                            {
                                "id": result.insertId,
                                "title": title, 
                                "type": parseInt(type), 
                                "gametype": parseInt(gametype), 
                                "players": players, 
                                "position": this.state.nexgenStatsViewerSettings.length,
                                "enabled": 1
                            }
                        );
                        
                        this.setFullNexgenList(newData);
                        this.setState({"lastSavedNexgenSettings": newData});

                        this.setState({
                            "nexgenCreateInProgress": false,
                            "nexgenCreatePassed": true,
                            "nexgenCreateErrors": []
                        });

                    }else{
                        errors.push("List was not inserted into the database");
                    }
                }else{

                    errors.push(result.message);
                }

            }


            if(errors.length > 0){

                console.log("THERE WHERE EREROREOREOROOS");
                console.table(errors);

                this.setState({
                    "nexgenCreateInProgress": false,
                    "nexgenCreatePassed": false,
                    "nexgenCreateErrors": errors
                });
            }

        }catch(err){
            console.trace(err);
        }   
    }

    async deleteNexgenEntry(id){

        try{


            this.setState({"nexgenSaveInProgress": true, "nexgenSavePassed": null, "nexgenErrors": []});

            const req = await fetch("/api/adminnexgen", {
                "headers": {"Content-Type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({"mode": "delete", "id": parseInt(id)})
            });

            const result = await req.json();

            if(result.message === "passed"){

                const newList = [];

                let s = 0;

                for(let i = 0; i < this.state.nexgenStatsViewerSettings.length; i++){

                    s = this.state.nexgenStatsViewerSettings[i];

                    if(s.id !== id){
                        newList.push(s);
                    }
                }

                this.setState({
                    "nexgenStatsViewerSettings": newList, 
                    "lastSavedNexgenSettings": newList, 
                    "nexgenSaveInProgress": false, 
                    "nexgenSavePassed": true, 
                    "nexgenErrors": []
                });
            }else{

                this.setState({"nexgenSaveInProgress": false, "nexgenSavePassed": false, "nexgenErrors": [result.message]});
            }

        }catch(err){
            console.trace(err);
        }
    }

    setFullNexgenList(data){

        this.setState({"nexgenStatsViewerSettings": data});
    }

    async saveNexgenSettings(){


        try{


            this.setState({"nexgenSaveInProgress": true, "nexgenSavePassed": null, "nexgenErrors": []});

            const errors = [];
            

            const req = await fetch("/api/adminnexgen", {
                "headers": {"Content-type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({"mode": "update", "settings": this.state.nexgenStatsViewerSettings})
            });
            
            const result = await req.json();

            if(result.message === "passed"){

                this.setState({"lastSavedNexgenSettings": this.state.nexgenStatsViewerSettings, "nexgenSaveInProgress": false, "nexgenSavePassed": true});
                return;

            }else{

                errors.push(result.message);
            }

            this.setState({
                "nexgenSaveInProgress": false, 
                "nexgenSavePassed": false,
                "nexgenErrors": errors
            });



        }catch(err){
            console.trace(err);
        }
    }

    updateNexgenSettings(id, type, value){

        const oldSettings = this.state.nexgenStatsViewerSettings;

        const newSettings = [];

        for(let i = 0; i < oldSettings.length; i++){

            if(oldSettings[i].id !== id){
                newSettings.push(oldSettings[i]);
            }else{
                newSettings.push({
                    "id": oldSettings[i].id,
                    "title": (type === "title") ? value : oldSettings[i].title,
                    "type": (type === "type") ? value : oldSettings[i].type,
                    "gametype":(type === "gametype") ? value : oldSettings[i].gametype,
                    "players": (type === "players") ? value : oldSettings[i].players,
                    "enabled": (type === "enabled") ? value : oldSettings[i].enabled,
                    "position": (type === "position") ? value : oldSettings[i].position

                });
            }
        }

        this.setState({"nexgenStatsViewerSettings": newSettings, "nexgenSavePassed": null});
    }

    updateFtpServers(newData){

        
        console.log("update ftpservers");

        console.log(newData);

        this.setState({"ftpServers": newData});
    }

    updateWeaponData(file){


        const newFiles = [file];

        let w = 0;

        for(let i = 0; i < this.state.weaponData.files.length; i++){

            w = this.state.weaponData.files[i];

            newFiles.push(w);
        }


        this.setState({"weaponData": {"files": newFiles, "names": this.state.weaponData.names}});
        
    }

    setItemList(data){
        this.setState({"itemList": data});
    }

    setRankingEvents(data){

        this.setState({"rankingEvents": data});
        
    }

    setGametypeNames(data){
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

    displayWeaponImageUploader(){

        if(this.state.mode !== 9) return null;

        return <AdminWeaponImageUploader updateParent={this.updateWeaponData} data={this.state.weaponData}/>
    }

    displayFtpManager(){

        if(this.state.mode !== 10) return null;

        return <AdminFTPManager servers={this.state.ftpServers} updateParent={this.updateFtpServers}/>
    }

    displayNexgenStatsViewer(){

        if(this.state.mode !== 11) return null;

        return <AdminNexgenStatsViewer 
            settings={this.state.nexgenStatsViewerSettings} 
            validTypes={JSON.parse(this.props.nexgenValidTypes)}
            gametypeNames={this.state.gametypeNames}
            updateSettings={this.updateNexgenSettings}
            lastSavedSettings={this.state.lastSavedNexgenSettings}
            save={this.saveNexgenSettings}
            saveInProgress={this.state.nexgenSaveInProgress}
            savePassed={this.state.nexgenSavePassed}
            errors={this.state.nexgenErrors}
            setFullList={this.setFullNexgenList}
            delete={this.deleteNexgenEntry}
            createList={this.nexgenCreateList}
            createInProgress={this.state.nexgenCreateInProgress}
            createPassed={this.state.nexgenCreatePassed}
            createErrors={this.state.nexgenCreateErrors}
        />
    }


    displayMonsterHunt(){

        if(this.state.mode !== 12) return null;

        return <AdminMonsterHunt images={this.state.monsterFiles} monsters={JSON.parse(this.props.monsters)} addMonster={this.addMonsterImage}/>
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
                            <div className={`big-tab ${(this.state.mode === 10) ? "tab-selected" : ""}`} onClick={(() =>{
                                this.changeMode(10);
                            })}>FTP Manager</div>
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
                            <div className={`big-tab ${(this.state.mode === 9) ? "tab-selected" : ""}`} onClick={(() =>{
                                this.changeMode(9);
                            })}>Weapon Image Uploader</div>
                            <div className={`big-tab ${(this.state.mode === 11) ? "tab-selected" : ""}`} onClick={(() =>{
                                this.changeMode(11);
                            })}>NexgenStatsViewer</div>
                            <div className={`big-tab ${(this.state.mode === 12) ? "tab-selected" : ""}`} onClick={(() =>{
                                this.changeMode(12);
                            })}>MonsterHunt</div>

                            
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
                        {this.displayWeaponImageUploader()}
                        {this.displayFtpManager()}
                        {this.displayNexgenStatsViewer()}
                        {this.displayMonsterHunt()}
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
    let weaponData = {
        "names": [],
        "files": []
    };

    let ftpServers = [];
    let nexgenStatsViewerSettings = [];
    let nexgenValidTypes = [];
    let monsterImages = [];
    let monsters = [];


    if(bUserAdmin){

        currentSiteSettings = await settings.debugGetAllSettings();


        validSiteSettings.playersPage = settings.getPlayersPageValidSettings();
        validSiteSettings.matchesPage = await settings.getMatchesPageValidSettings();
        validSiteSettings.home = settings.getHomePageValidSettings();
        validSiteSettings.recordsPage = settings.getRecordsPageValidSettings();
        validSiteSettings.mapsPage = settings.getMapsPageValidSettings();
        validSiteSettings.playerPages = settings.getPlayerPagesValidSettings();
        validSiteSettings.rankings = settings.getRankingsValidSettings();
        validSiteSettings.mapPages = settings.getMapPagesValidSettings();

        const admin = new AdminManager();

        ftpServers = await admin.getAllFTPServers();

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

        const weaponManager = new Weapons();

        weaponData.names = await weaponManager.getAllNames();
        weaponData.files = await weaponManager.getImageList();

        const nexgenStatsManager = new NexgenStatsViewer();

        nexgenStatsViewerSettings = await nexgenStatsManager.getCurrentSettings();

        nexgenValidTypes = nexgenStatsManager.validTypes;

        const monsterHuntManager = new MonsterHunt();

        monsterImages = await monsterHuntManager.getAllMonsterImages();
        monsters = await monsterHuntManager.getAllMonsters();


    }
    
    const navSettings = await settings.getCategorySettings("Navigation");




    
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
            "itemList": JSON.stringify(itemList),
            "weaponData": JSON.stringify(weaponData),
            "ftpServers": JSON.stringify(ftpServers),
            "nexgenStatsViewerSettings": JSON.stringify(nexgenStatsViewerSettings),
            "nexgenValidTypes": JSON.stringify(nexgenValidTypes),
            "monsterImages": JSON.stringify(monsterImages),
            "monsters": JSON.stringify(monsters)
        }
    };
}


export default Admin;