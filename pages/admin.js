import React from 'react';
import Session from '../api/session';
import User from '../api/user';
import DefaultHead from '../components/defaulthead';
import Nav from '../components/Nav/';
import Footer from '../components/Footer';
import SiteSettings from '../api/sitesettings';
import styles from '../styles/Admin.module.css';
import AdminSettingsTable from '../components/AdminSettingsTable/';

class Admin extends React.Component{

    constructor(props){

        super(props);
        this.state = {"mode": 1, "files": []};

        this.changeMode = this.changeMode.bind(this);
        this.uploadImage = this.uploadImage.bind(this);
        this.onChange = this.onChange.bind(this);
    }

    onChange(e){


        console.log(e.target.files[0]);

        this.setState({"files": e.target.files[0]});
        console.log("this.state");
        console.log(this.state);
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

            console.log(e);

            console.log(e.target.files.value);

            const formData = new FormData();

            console.log(this.state.files);



            formData.append("files", this.state.files);

            console.log(formData);

            if(process.browser){
                const req = await fetch(`/api/mapimageupload`, {
                    "method": "POST",
                    "body": formData
                });

                console.log(await req.json());
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
                <input type="file" name="files" id="files" onChange={this.onChange}/>
                <input type="submit" className="search-button" value="Upload" />
            </form>
        </div>
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
                            <div className={`big-tab ${(this.state.mode === 1) ? "tab-selected" : ""}`} onClick={(() =>{
                                this.changeMode(1);
                            })}>Map Image Uploader</div>
                        </div>
                        {this.displaySettings()}
                        {this.displayMapImageUpload()}
                    </div>   
                </div>

                <Footer session={this.props.session}/>
            </main>
        </div>
    }
}



export async function getServerSideProps({req, query}){

    const user = new User();
    const session = new Session(req.headers.cookie);
    const settings = new SiteSettings();
    

    await session.load();

    //console.log(session.settings);

    const bUserAdmin = await session.bUserAdmin();

    let currentSiteSettings = [];
    let validSiteSettings = {};

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
    }
    
    const navSettings = await settings.getCategorySettings("Navigation");

    console.log(`Is this user an admin ${bUserAdmin}`);

    return {
        props: {
            "navSettings": JSON.stringify(navSettings),
            "session": JSON.stringify(session.settings),
            "bUserAdmin": bUserAdmin,
            "siteSettings": JSON.stringify(currentSiteSettings),
            "validSiteSettings": JSON.stringify(validSiteSettings)
        }
    };
}


export default Admin;