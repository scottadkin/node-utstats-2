import React from 'react';
import Session from '../api/session';
import User from '../api/user';
import DefaultHead from '../components/defaulthead';
import Nav from '../components/Nav/';
import Footer from '../components/Footer';
import SiteSettings from '../api/sitesettings';
import styles from '../styles/Admin.module.css';

class Admin extends React.Component{

    constructor(props){

        super(props);
    }

    debugShowSettings(){

        const settings = JSON.parse(this.props.siteSettings);

        const categories = [];

        let elems = [];

        let s = 0;

        let previousCategory = null;

        for(let i = 0; i < settings.length; i++){

            s = settings[i];

            if(previousCategory === null || s.category !== previousCategory){

                if(previousCategory !== null){
                    categories.push({
                        "title": previousCategory,
                        "elems": elems
                    });

                    elems = [];
                }
                previousCategory = s.category;
            }

            elems.push(<tr key={i}>
                <td>{s.name}</td>
                <td>{s.value}</td>
                <td>change here</td>
            </tr>);
        }

        if(elems.length > 0){

            categories.push({
                "title": previousCategory,
                "elems": elems
            });
        }

        const tables = [];

        
        for(let i = 0; i < categories.length; i++){

            tables.push(<div key={i}>
                <div className="default-header">
                    {categories[i].title} Settings
                </div>
                <table className={`t-width-1 ${styles.stable}`}>
                    <tbody>
                        <tr>
                            <th>Name</th>
                            <th>Current Value</th>
                            <th>New Value</th>
                        </tr>
                        {categories[i].elems}
                    </tbody>
                </table>
            </div>);
        }


        return <div>
            {tables}
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
                <Nav session={this.props.session}/>

                <div id="content">
                    <div className="default">
                        <div className="default-header">Admin Control Panel</div>

                        {this.debugShowSettings()}
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