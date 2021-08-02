import Head from '../../../components/classic/Head';
import Nav from '../../../components/classic/Nav';
import Footer from '../../../components/Footer';
import Session from '../../../api/session';
import Matches from '../../../api/classic/matches';
import MatchesList from '../../../components/classic/MatchesList';
import Gametypes from '../../../api/classic/gametypes';

const MatchPage = ({host, session}) =>{

    return <div>
        <Head host={host} title={`Match report`} 
        description={`match report`} 
        keywords={`classic,match,report`}/>
        <main>
            <Nav />
            <div id="content">

                <div className="default">
                    <div className="default-header">Match Report</div>
                </div>
            </div>
            
            <Footer session={session}/>
        </main>
    </div>
}



export async function getServerSideProps({req, query}){

    const session = new Session(req);

    await session.load();


    return {
        "props": {
            "host": req.headers.host,
            "session": JSON.stringify(session.settings)
        }
    }
}


export default MatchPage;