
import DefaultHead from '../components/defaulthead';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import MatchesManager from '../api/matches';
import MatchesTableView from '../components/MatchesTableView/';
import Gametypes from '../api/gametypes';
import Functions from '../api/functions';
import Servers from '../api/servers'

const Matches = ({matches}) =>{


    //matches = JSON.parse(matches);

    const elems = [];


    return (<div>
        <DefaultHead />
        <main>
            <Nav />
            <div id="content">

                <div className="default">
                    <div className="default-header">
                        Recent Matches
                    </div>
                    <MatchesTableView data={matches}/>
                </div>
            </div>
            <Footer />
        </main>
    </div>);
}


export async function getServerSideProps({query}){

    const matchManager = new MatchesManager();
    const gametypeManager = new Gametypes();
    const serverManager = new Servers();

    const matches = await matchManager.debugGetAll();
    const uniqueGametypes = Functions.getUniqueValues(matches, 'gametype');
    const uniqueServers = Functions.getUniqueValues(matches, 'server');

    let gametypeNames = {};

    if(uniqueGametypes.length > 0){
        gametypeNames = await gametypeManager.getNames(uniqueGametypes);
    }

    let serverNames = {};

    if(uniqueServers.length > 0){
        serverNames = await serverManager.getNames(uniqueServers);
    }

    console.log(matches[0]);

    console.log(uniqueGametypes);
    console.log(JSON.stringify(gametypeNames));

    console.log(serverNames);

    Functions.setIdNames(matches, gametypeNames, 'gametype', 'gametypeName');
    Functions.setIdNames(matches, serverNames, 'server', 'serverName');

    console.log(matches[0]);
    return {
        "props": {
            "matches": JSON.stringify(matches)
        }
    };
}


export default Matches;