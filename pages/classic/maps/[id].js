import Head from '../../../components/classic/Head';
import Nav from '../../../components/classic/Nav';
import Footer from '../../../components/Footer';
import Session from '../../../api/session';
import Maps from '../../../api/classic/maps';
import MapsTableView from '../../../components/classic/MapsTableView';
import MapsDefaultView from '../../../components/classic/MapsDefaultView';
import Pagination from '../../../components/Pagination';
import Link from 'next/link';

const RankingsPage = ({session, host, data, mode, order, page, perPage, pages, totalResults, display}) =>{

    data = JSON.parse(data);

    console.log(display);

    const pageination = <Pagination currentPage={page + 1} perPage={perPage} pages={pages} results={totalResults} url={`/classic/maps/${mode}?display=${display}&page=`}/>;

    return <div>
    <Head host={host} title={`page title`} 
        description={`page desc`} 
        keywords={`,classic`}/>
        <main>
            <Nav />
            <div id="content">

                <div className="default">
                    <div className="default-header">Maps</div>
                  
                    <div className="big-tabs">
                        <Link href={`/classic/maps/${mode}?display=d`}>
                            <a>
                                <div className={`tab ${(display === "d") ? "tab-selected" : null}`}>Default View</div>
                            </a>
                        </Link>
                        <Link href={`/classic/maps/${mode}?display=t`}>
                            <a>
                                <div className={`tab ${(display === "t") ? "tab-selected" : null}`}>Table View</div>
                            </a>
                        </Link>
                       
                    </div>
                    {(display === "d") ? <MapsDefaultView data={data} mode={mode} order={order} display={display}/> : null }
                    
                    {(display === "t") ? <MapsTableView data={data} order={order} mode={mode}/> : null }
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

    let display = (query.display !== undefined) ?  query.display.toLowerCase() : "t";

    if(display !== "d" && display !== "t") display = "d";

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
            "order": order,
            "display": display

        }
    };
}


export default RankingsPage;