import React from 'react';
import Session from '../api/session';
import DefaultHead from '../components/defaulthead';
import Nav from '../components/Nav/';
import Footer from '../components/Footer';
import SiteSettings from '../api/sitesettings';
import AdminManager from '../api/admin';
import AdminUserTable from '../components/AdminUserTable/';
import Faces from '../api/faces';
import AdminFaces from '../components/AdminFaces/';
import AdminMatchesManager from '../components/AdminMatchesManager/';
import AdminPlayersManager from '../components/AdminPlayersManager/';
import Players from '../api/players';
import AdminGametypeManager from '../components/AdminGametypeManager/';
import Gametypes from '../api/gametypes'
import AdminRankingManager from '../components/AdminRankingManager/';
import AdminPickupsManager from '../components/AdminPickupsManager/';
import Items from '../api/items';
import AdminWeaponImageUploader from '../components/AdminWeaponImageUploader/';
import Weapons from '../api/weapons';
import AdminFTPManager from '../components/AdminFTPManager/';
import AdminNexgenStatsViewer from '../components/AdminNexgenStatsViewer';
import MonsterHunt from '../api/monsterhunt';
import AdminMonsterHunt from '../components/AdminMonsterHunt';
import Analytics from '../api/analytics';
import SiteAnalytics from '../components/SiteAnalytics';
import AdminMapManager from '../components/AdminMapManager';
import AdminSiteSettings from '../components/AdminSiteSettings';
import AdminServersManager from '../components/AdminServersManager';
import AdminBackupManager from "../components/AdminBackupManager";

class Admin extends React.Component{

    constructor(props){

        super(props);

        this.state = {
            "mode": 15, 
            "files": [],
            "gametypeNames": JSON.parse(this.props.gametypeNames),
            "itemList": JSON.parse(this.props.itemList),
            "weaponData": JSON.parse(this.props.weaponData),
            "monsterFiles": JSON.parse(this.props.monsterImages),
            "monsters": JSON.parse(this.props.monsters),
            "gametypeImages": JSON.parse(this.props.gametypeImages)
        };

        this.changeMode = this.changeMode.bind(this);
        this.onChange = this.onChange.bind(this);
        this.setGametypeNames = this.setGametypeNames.bind(this);
        this.setItemList = this.setItemList.bind(this);
        this.updateWeaponData = this.updateWeaponData.bind(this);
        this.addMonsterImage = this.addMonsterImage.bind(this);
        this.renameMonster = this.renameMonster.bind(this);
        this.updateGametypeImages = this.updateGametypeImages.bind(this);
    }

    updateGametypeImages(images){
        this.setState({"gametypeImages": images});
    }

    renameMonster(id, newName){

        const newData = Object.assign(this.state.monsters);

        let n = 0;

        for(let i = 0; i < newData.length; i++){

            n = newData[i];

            if(n.id === id){
                n.display_name = newName;
            }
        }

        this.setState({"monsters": newData});
    }

    addMonsterImage(file){

        const newFiles = Object.assign(this.state.monsterFiles);

        newFiles.push(file);
        
        this.setState({"monsterFiles": newFiles});
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


    setGametypeNames(data){
        this.setState({"gametypeNames": data});
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

        return <AdminSiteSettings />;
      

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

        return <AdminMatchesManager />;
    }


    displayRanking(){

        if(this.state.mode !== 7) return null;

        return <AdminRankingManager names={this.state.gametypeNames}/>
    }

    displayPlayersManager(){

        if(this.state.mode !== 5) return null
        return <AdminPlayersManager />
    }

    displayGametypeManager(){

        if(this.state.mode !== 6) return null;

        return <AdminGametypeManager data={this.state.gametypeNames} updateParentGametypeNames={this.setGametypeNames} images={this.state.gametypeImages}
            updateImages={this.updateGametypeImages}
        />
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

        return <AdminNexgenStatsViewer gametypes={this.state.gametypeNames}/>
    }


    displayMonsterHunt(){

        if(this.state.mode !== 12) return null;

        return <AdminMonsterHunt images={this.state.monsterFiles} monsters={this.state.monsters} addMonster={this.addMonsterImage} updateMonster={this.renameMonster}/>
    }

    displayAnalytics(){

        if(this.state.mode !== 13) return null;

        return <SiteAnalytics countriesByHits={JSON.parse(this.props.countriesByHits)} ipsByHits={JSON.parse(this.props.ipsByHits)}
            generalHits={JSON.parse(this.props.hits)} visitors={JSON.parse(this.props.visitors)} userAgents={JSON.parse(this.props.userAgents)}
        />;
    }

    displayMapManager(){

        if(this.state.mode !== 1) return null;

        return <AdminMapManager />
    }

    displayServersManager(){

        if(this.state.mode !== 14) return null;

        return <AdminServersManager />;
    }

    displayBackupManager(){

        if(this.state.mode !== 15) return null;

        return <AdminBackupManager />;
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
                            <div className={`big-tab ${(this.state.mode === 13) ? "tab-selected" : ""}`} onClick={(() =>{
                                this.changeMode(13);
                            })}>Site Analytics</div>
                            <div className={`big-tab ${(this.state.mode === 10) ? "tab-selected" : ""}`} onClick={(() =>{
                                this.changeMode(10);
                            })}>Logs Importer Manager</div>
                            <div className={`big-tab ${(this.state.mode === 2) ? "tab-selected" : ""}`} onClick={(() =>{
                                this.changeMode(2);
                            })}>Manage User Accounts</div>
                            <div className={`big-tab ${(this.state.mode === 14) ? "tab-selected" : ""}`} onClick={(() =>{
                                this.changeMode(14);
                            })}>Manage Servers</div>
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
                            })}>Map Manager</div>
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
                            <div className={`big-tab ${(this.state.mode === 15) ? "tab-selected" : ""}`} onClick={(() =>{
                                this.changeMode(15);
                            })}>Backup Manager</div>

                            
                        </div>
                        {this.displaySettings()}
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
                        {this.displayAnalytics()}
                        {this.displayMapManager()}
                        {this.displayServersManager()}
                        {this.displayBackupManager()}
                    </div>   
                </div>

                <Footer session={this.props.session}/>
            </main>
        </div>
    }
}



export async function getServerSideProps({req, query}){

    const session = new Session(req);
    const settings = new SiteSettings();
    const faceManager = new Faces();
    

    await session.load();

    //console.log(session.settings);

    const bUserAdmin = await session.bUserAdmin();

    let userAccounts = [];
    let faceData = [];
    let faceFiles = [];
    let gametypeNames = [];
    let itemList = [];
    let weaponData = {
        "names": [],
        "files": []
    };

    let monsterImages = [];
    let monsters = [];
    let gametypeImages = [];


    if(bUserAdmin){

        const admin = new AdminManager();

        userAccounts = await admin.getAllUsers();
        faceData = await faceManager.getAll();
        
        faceFiles = faceManager.getAllFiles();

        const playerManager = new Players();

        const gametypeManager = new Gametypes();

        gametypeNames = await gametypeManager.getAll();
        gametypeImages = gametypeManager.getImages();

        const itemManager = new Items();

        itemList = await itemManager.getAll();

        const weaponManager = new Weapons();

        weaponData.names = await weaponManager.getAllNames();
        weaponData.files = await weaponManager.getImageList();

        const monsterHuntManager = new MonsterHunt();

        monsterImages = await monsterHuntManager.getAllMonsterImages();
        monsters = await monsterHuntManager.getAllMonsters();


    }
    
    const navSettings = await settings.getCategorySettings("Navigation");



    const analytics = new Analytics();

    const countriesByHits = await analytics.getCountriesByHits();
    const ipsByHits = await analytics.getIpsByHits(50);

    const hitsPast24Hours = await analytics.getTotalHitsPastXDays(1);
    const visitorsPast24Hours = await analytics.getVisitorsCountPastXDays(1);

    const hitsPast7Days = await analytics.getTotalHitsPastXDays(7);
    const visitorsPast7Days = await analytics.getVisitorsCountPastXDays(7);

    const hitsPast28Days = await analytics.getTotalHitsPastXDays(28);
    const visitorsPast28Days = await analytics.getVisitorsCountPastXDays(28);

    const hitsPastYear = await analytics.getTotalHitsPastXDays(365);
    const visitorsPast365Days = await analytics.getVisitorsCountPastXDays(365);

    const hitsAllTime = await analytics.getTotalHitsPastXDays();
    const visitorsAllTime = await analytics.getVisitorsCountPastXDays();

    const userAgents = await analytics.getUserAgents();

    return {
        props: {
            "navSettings": JSON.stringify(navSettings),
            "session": JSON.stringify(session.settings),
            "bUserAdmin": bUserAdmin,
            "userAccounts": JSON.stringify(userAccounts),
            "faceData": JSON.stringify(faceData),
            "faceFiles": JSON.stringify(faceFiles),
            "gametypeNames": JSON.stringify(gametypeNames),
            "itemList": JSON.stringify(itemList),
            "weaponData": JSON.stringify(weaponData),
            "monsterImages": JSON.stringify(monsterImages),
            "monsters": JSON.stringify(monsters),
            "gametypeImages": JSON.stringify(gametypeImages),
            "countriesByHits": JSON.stringify(countriesByHits),
            "ipsByHits": JSON.stringify(ipsByHits),
            "hits": JSON.stringify({
                "day": hitsPast24Hours,
                "week": hitsPast7Days,
                "month": hitsPast28Days,
                "year": hitsPastYear,
                "allTime": hitsAllTime
            }),
            "visitors": JSON.stringify(
                {
                    "day": visitorsPast24Hours,
                    "week": visitorsPast7Days,
                    "month": visitorsPast28Days,
                    "year": visitorsPast365Days,
                    "allTime": visitorsAllTime
                }
            ),
            "userAgents": JSON.stringify(userAgents)
        }
    };
}


export default Admin;