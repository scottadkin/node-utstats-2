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
    }


    displaySettings(){

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
            }

            elems.push(<AdminSettingsTable key={key} title={key} data={value.data} validSettings={currentValidSettings}/>);
        }

        return <div>{elems}</div>
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

                        {this.displaySettings()}
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

    console.log(session.settings);

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