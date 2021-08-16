import Head from '../../../components/classic/Head';
import Nav from '../../../components/classic/Nav';
import Footer from '../../../components/Footer';
import Session from '../../../api/session';
import Maps from '../../../api/classic/maps';
import MapsTableView from '../../../components/classic/MapsTableView';
import Pagination from '../../../components/Pagination';

const RankingsPage = ({session, host, data, mode, order, page, perPage, pages, totalResults}) =>{

    data = JSON.parse(data);

    const pageination = <Pagination currentPage={page + 1} perPage={perPage} pages={pages} results={totalResults} url={`/classic/maps/${mode}?page=`}/>;

    return <div>
    <Head host={host} title={`page title`} 
        description={`page desc`} 
        keywords={`,classic`}/>
        <main>
            <Nav />
            <div id="content">

                <div className="default">
                    <div className="default-header">Maps</div>
                    {pageination}
                    <MapsTableView data={data} page={page} perPage={perPage} order={order} mode={mode}/>
                    {pageination}
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

    let order = (query.order !== undefined) ? query.order.toLowerCase() : "a";

    if(order !== "a" && order !== "d") order = "a";

    const mode = query.id.toLowerCase();

    const perPage = 25;

    const session = new Session(req);
    await session.load();

    const mapManager = new Maps();

    let data = [];

    if(mode === "matches"){
        data = await mapManager.getMostPlayed(page, perPage, order);
    }else{
        data = await mapManager.getOrderedBy(mode, page, perPage, order);
    }

    const totalMaps = await mapManager.getTotalMaps();

    const pages = (totalMaps > 0) ? Math.ceil(totalMaps / perPage) : 1;

    return {
        "props": {
            "host": req.headers.host,
            "session": JSON.stringify(session.settings),
            "data": JSON.stringify(data),
            "page": page,
            "perPage": perPage,
            "pages": pages,
            "totalResults": totalMaps,
            "mode": mode,
            "order": order

        }
    };
}


export default RankingsPage;