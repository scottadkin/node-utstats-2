import DefaultHead from '../defaulthead';
import Nav from '../Nav';
import Footer from '../Footer';

const AccessDenied = ({host, session, navSettings}) => {

    return <div>
            <DefaultHead host={host} title={`Access Denied`}  
            description={`Access Denied, you do not have permission to view this page.`} 
            keywords={`access,denied`}/>
            <main>
            <Nav settings={navSettings} session={session}/>
            <div id="content">
                <div className="default">
                    <div className="default-header">
                        Access Denied
                    </div>
                    <div id="welcome">
                        You do not have permission to view this page.
                    </div>
                </div>
            </div>
            <Footer session={session}/>
            </main>   
        </div>
}

export default AccessDenied;