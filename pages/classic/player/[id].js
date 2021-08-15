import Head from '../../../components/classic/Head';
import Nav from '../../../components/classic/Nav';
import Footer from '../../../components/Footer';
import Session from '../../../api/session';

const RankingsPage = ({session, host}) =>{

    return <div>
    <Head host={host} title={`page title`} 
    description={`page desc`} 
    keywords={`,classic`}/>
    <main>
        <Nav />
        <div id="content">

            <div className="default">

            </div>
        </div>
        
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
            "session": JSON.stringify(session.settings),
        }
    };
}


export default RankingsPage;