import Head from '../../../components/classic/Head';
import Nav from '../../../components/classic/Nav';
import Footer from '../../../components/Footer';
import Session from '../../../api/session';
import Matches from '../../../api/classic/matches';
import MatchesList from '../../../components/classic/MatchesList';
import Gametypes from '../../../api/classic/gametypes';
import MatchSummary from '../../../components/classic/MatchSummary';
import Functions from '../../../api/functions';

const MatchPage = ({host, session, matchData}) =>{

    matchData = JSON.parse(matchData);

    console.log(matchData);

    //info, server, gametype, map, image, bMonsterHunt


    return <div>
        <Head host={host} title={`Match report`} 
        description={`match report`} 
        keywords={`classic,match,report`}/>
        <main>
            <Nav />
            <div id="content">

                <div className="default">
                    <div className="default-header">Match Report</div>
                    <MatchSummary date={Functions.utDate(matchData.time)}/>
                </div>
            </div>
            
            <Footer session={session}/>
        </main>
    </div>
}



export async function getServerSideProps({req, query}){

    const session = new Session(req);

    await session.load();

    const matchManager = new Matches();

    let id = 0;

    if(query.id !== undefined){

        id = parseInt(query.id);
    
        if(id !== id) id = 0;
    }

    const matchData = await matchManager.getData(id);

    return {
        "props": {
            "host": req.headers.host,
            "session": JSON.stringify(session.settings),
            "matchData": JSON.stringify(matchData)
        }
    }
}


export default MatchPage;