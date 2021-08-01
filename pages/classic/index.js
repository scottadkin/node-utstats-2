import Head from '../../components/classic/Head';
import Nav from '../../components/classic/Nav';
import Footer from '../../components/Footer';
import Session from '../../api/session';
import Matches from '../../api/classic/matches';
import MatchesList from '../../components/classic/MatchesList';

const Home = ({host, session, recentMatches}) =>{

    recentMatches = JSON.parse(recentMatches);

    return <div>
        <Head host={host} title={"Home"} description="Welcome to Node UTStats 2 (Classic Support), view various stats for players,matches,maps,records and more, using original utstats databases!" keywords="home,welcome"/>
        <main>
            <Nav />
            <div id="content">

                <div className="default">
                <MatchesList title={"Recent Matches"} data={recentMatches}/>
                </div>
            </div>
            
            <Footer session={session}/>
        </main>
    </div>
}



export async function getServerSideProps({req, query}) {

    const session = new Session(req);

    await session.load();

   // console.log(await mysql.simpleQuery("SELECT * FROM uts_match ORDER BY id DESC LIMIT 5"));

    const page = 1;

    const matchManager = new Matches();
    const recentMatches = await matchManager.getLatestMatches(page, 50);


    return {
        "props": {
            "host": req.headers.host,
            "session": JSON.stringify(session.settings),
            "recentMatches": JSON.stringify(recentMatches)
        }
    };
}


export default Home;