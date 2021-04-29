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

        console.log(categories);

        const elems = [];

        for(const [key, value] of Object.entries(categories)){

            elems.push(<AdminSettingsTable key={key} title={key} data={value.data}/>);
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
                <Nav session={this.props.session}/>

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

    if(bUserAdmin){

        currentSiteSettings = await settings.debugGetAllSettings();
        console.log(currentSiteSettings);
    }

    console.log(`Is this user an admin ${bUserAdmin}`);

    return {
        props: {
            "session": JSON.stringify(session.settings),
            "bUserAdmin": bUserAdmin,
            "siteSettings": JSON.stringify(currentSiteSettings)
        }
    };
}


export default Admin;