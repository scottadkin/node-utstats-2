import Head from '../../../components/classic/Head';
import Nav from '../../../components/classic/Nav';
import Footer from '../../../components/Footer';
import Session from '../../../api/session';
import Gametypes from '../../../api/classic/gametypes';
import Rankings from '../../../api/classic/rankings';
import RankingTable from '../../../components/classic/RankingTable';

const RankingsPage = ({session, host, mode, page, perPage, data}) =>{

    data = JSON.parse(data);

    const tables = [];

    if(mode === "all"){

        for(const [key, value] of Object.entries(data.data)){

            tables.push(<RankingTable key={key} gametypeId={key} title={value.name} data={value.data} page={page} perPage={perPage}
                players={data.players}
            />);
        }
    }

    return <div>
    <Head host={host} title={`page title`} 
    description={`page desc`} 
    keywords={`,classic`}/>
    <main>
        <Nav />
        <div id="content">

            <div className="default">
                <div className="default-header">Rankings</div>

                {tables}
            </div>
        </div>
        
        <Footer session={session}/>
    </main>
</div>

}


export async function getServerSideProps({req, query}) {

    console.log(query);

    let page = (query.page !== undefined) ? parseInt(query.page) : 1;
    if(page !== page) page = 1;
    page--;

    const defaultPerPage = 10;

    let perPage = (query.perPage !== undefined) ? parseInt(query.perPage) : defaultPerPage;
    if(perPage !== perPage) perPage = defaultPerPage;

    const session = new Session(req);
    await session.load();

    const gametypeManager = new Gametypes();

    const gametypes = await gametypeManager.getAllNames();


    const rankingsManager = new Rankings();

    const data = await rankingsManager.getMultipleTopPlayers(gametypes, page, perPage);

    return {
        "props": {
            "host": req.headers.host,
            "session": JSON.stringify(session.settings),
            "data": JSON.stringify(data),
            "mode": query.id,
            "page": page,
            "perPage": perPage
        }
    };
}


export default RankingsPage;