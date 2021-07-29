import Head from '../../components/classic/Head';
import Nav from '../../components/classic/Nav';
import Footer from '../../components/Footer';
import Session from '../../api/session';

const Home = ({host, session}) =>{

    return <div>
        <Head host={host} title={"Home"} description="Welcome to Node UTStats 2 (Classic Support), view various stats for players,matches,maps,records and more, using original utstats databases!" keywords="home,welcome"/>
        <main>
            <Nav />
            <Footer session={session}/>
        </main>
    </div>
}



export async function getServerSideProps({req, query}) {

    const session = new Session(req);

    await session.load();

    return {
        "props": {
            "host": req.headers.host,
            "session": JSON.stringify(session.settings)
        }
    };
}


export default Home;