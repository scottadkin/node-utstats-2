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

    let pages = 1;
    let totalPlayers = 1;

    if(mode === "all"){

        for(const [key, value] of Object.entries(data.data)){

            tables.push(<RankingTable key={key} gametypeId={key} title={value.name} data={value.data} page={page} perPage={perPage}
                players={data.players} showAllButton={true} totalResults={value.totalPlayers}
            />);
        }

    }else{

        pages = (data.totalPlayers > 0 && perPage > 0) ? Math.ceil(data.totalPlayers / perPage) : 1;
        totalPlayers = data.totalPlayers;

        tables.push(<RankingTable key={1} gametypeId={data.gametypeId} title={data.name} data={data.data} page={page} perPage={perPage}
            players={data.players} showAllButton={false} totalResults={data.totalPlayers} pages={pages}
        />);
    }

    const title = (data.name !== undefined) ? data.name : "Unknown";

    let description = "";
    let metaTitle = "";

    if(mode === "all"){
        description = `View all available gametype rankings, see where you place against your friends in your favourite gametypes.`;
        metaTitle = "Gametype Rankings";
    }else{
        description = `Viewing ${title} gametype rankings, see who are the top players of this gametype. Page ${page + 1} of ${pages}, ${totalPlayers} players saved.`;
        metaTitle = `${title} Rankings - Page ${page + 1} of ${pages}`;
    }

    return <div>
    <Head host={host} title={metaTitle} 
    description={description} 
    keywords={`ranking,rankings,classic,${title},gametype,gametypes`}/>
    <main>
        <Nav />
        <div id="content">

            <div className="default">
                <div className="default-header">{(mode !== "all") ? `${title} ` : null}Rankings</div>

                {tables}
            </div>
        </div>
        
        <Footer session={session}/>
    </main>
</div>

}


export async function getServerSideProps({req, query}) {

    let page = (query.page !== undefined) ? parseInt(query.page) : 1;
    if(page !== page) page = 1;
    page--;

    const parsedId = parseInt(query.id);

    let gametypeId = (parsedId !== parsedId) ? "all" : parsedId;

    const defaultPerPage = 10;
    const singleDefaultPerPage = 50;

    let perPage = (query.perPage !== undefined) ? parseInt(query.perPage) : (gametypeId === "all") ? defaultPerPage : singleDefaultPerPage;

    if(perPage !== perPage){
        perPage = (gametypeId === "all") ? defaultPerPage : singleDefaultPerPage;
    }

    if(perPage > 100 || perPage < 5){

        perPage = (gametypeId === "all") ? defaultPerPage : singleDefaultPerPage;
    }

    const session = new Session(req);
    await session.load();

    const gametypeManager = new Gametypes();
    const rankingsManager = new Rankings();

    let data = [];

    if(gametypeId === "all"){

        const gametypes = await gametypeManager.getAllNames();
        data = await rankingsManager.getMultipleTopPlayers(gametypes, page, perPage);

    }else{

        const gametype = await gametypeManager.getNames([gametypeId]);

        data = await rankingsManager.getTopPlayers(gametypeId, page, perPage, true);

        data.name = (gametype[gametypeId] !== undefined) ? gametype[gametypeId] : "Not Found";
        data.gametypeId = gametypeId;
    }

    return {
        "props": {
            "host": req.headers.host,
            "session": JSON.stringify(session.settings),
            "data": JSON.stringify(data),
            "mode": gametypeId,
            "page": page ,
            "perPage": perPage
        }
    };
}


export default RankingsPage;