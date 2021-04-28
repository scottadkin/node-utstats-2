import React from 'react';
import Session from '../api/session';
import User from '../api/user';
import DefaultHead from '../components/defaulthead';
import Nav from '../components/Nav/';
import Footer from '../components/Footer';

class Admin extends React.Component{

    constructor(props){

        super(props);
    }

    render(){
        
        return <div>
            <DefaultHead title="Admin Control Panel"/>
            <main>
                <Nav session={this.props.session}/>

                <div id="content">
                    <div className="default">
                        <div className="default-header">Admin Control Panel</div>
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

    await session.load();

    console.log(session.settings);

    console.log(await session.bUserAdmin());

    return {
        props: {
            "session": JSON.stringify(session.settings)
        }
    };
}


export default Admin;