import Head from '../../../components/classic/Head';
import Nav from '../../../components/classic/Nav';
import Footer from '../../../components/Footer';
import Session from '../../../api/session';
import Maps from '../../../api/classic/maps';
import MapsTableView from '../../../components/classic/MapsTableView';
import MapsDefaultView from '../../../components/classic/MapsDefaultView';
import Pagination from '../../../components/Pagination';
import Link from 'next/link';
import Functions from '../../../api/functions';
import MainMaps from '../../../api/maps';
import Analytics from '../../../api/analytics';

const MapsPage = ({session, host, data, mode, order, page, perPage, pages, totalResults, display, mapImages, name}) =>{

    data = JSON.parse(data);
    mapImages = JSON.parse(mapImages);

    const modes = ["name", "first", "last", "matches", "avglength", "playtime"];
    const modeTitles = ["Name", "First Match Date", "Last Match Date", "Total Matches", "Average Match Length", "Total Playtime"];

    const modeIndex = modes.indexOf(mode);

    const orderedByString = (modeIndex !== -1) ? modeTitles[modeIndex] : "Unknown";

    const pageination = <Pagination currentPage={page + 1} perPage={perPage} pages={pages} 
        results={totalResults} url={`/classic/maps/${mode}?name=${name}&display=${display}&page=`}/>;

    const orderIndexString = (order === "a") ? "Ascending" : "Descending";

    const start = (page * perPage) + 1;
    let end = (page + 1) * perPage;

    if(end > totalResults) end = totalResults;

    let description = "";
    let title = "";

    if(name === ""){

        description = `View every map played in our database, see which ones are the most popular. Displayed in ${orderedByString} ${orderIndexString} Order, `;
        description += `page ${page + 1} of ${pages}, results ${start} to ${end} out of a possible ${totalResults}`;

        title = `Maps Ordered by ${orderedByString}(${orderIndexString}) - Page ${page + 1} of ${pages}`;

    }else{

        description = `Map search result for names matching ${name}. Displayed in ${orderedByString} ${orderIndexString} Order, `;
        description += `page ${page + 1} of ${pages}, results ${start} to ${end} out of a possible ${totalResults}`;

        title = `Map search - Names matching ${name} - Ordered by ${orderedByString}(${orderIndexString}) - Page ${page + 1} of ${pages}`;

    }

    return <div>
    <Head host={host} title={title} 
        description={description} 
        keywords={`maps,list,classic`}/>
        <main>
            <Nav />
            <div id="content">

                <div className="default">
                    <div className="default-header">Maps</div>
                    <div className="form">
                        <form action={`/classic/maps/${mode}`} method="GET">
                            <div className="select-row">
                                <div className="select-label">
                                    Name
                                </div>
                                <div>
                                    <input type="text" className="default-textbox" defaultValue={name} name="name" placeholder="Search by map name..."/>
                                </div>
                            </div>
                            <input type="submit" className="search-button" value="Search"/>
                        </form>
                    </div>
                    {pageination}
                    <div className="default-sub-header">
                        Maps sorted by <span className="yellow">{modeTitles[modeIndex]}</span> {orderIndexString} Order
                    </div>
                    <div className="big-tabs">
                        <Link href={`/classic/maps/${mode}?name=${name}&display=d`}>
                            <a>
                                <div className={`tab ${(display === "d") ? "tab-selected" : null}`}>Default View</div>
                            </a>
                        </Link>
                        <Link href={`/classic/maps/${mode}?name=${name}&display=t`}>
                            <a>
                                <div className={`tab ${(display === "t") ? "tab-selected" : null}`}>Table View</div>
                            </a>
                        </Link>       
                    </div>
                    
                    {(display === "d") ? <MapsDefaultView data={data} name={name} mode={mode} order={order} display={display} images={mapImages}/> : null }
                    
                    {(display === "t") ? <MapsTableView data={data} name={name} order={order} mode={mode}/> : null }
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

    let name = (query.name !== undefined) ? query.name : "";

    const mode = query.id.toLowerCase();

    const perPage = 25;

    const session = new Session(req);
    await session.load();

    const mapManager = new Maps();

    let data = [];

    if(mode === "matches"){
        data = await mapManager.getMostPlayed(page, perPage, order, name);
    }else{
        data = await mapManager.getOrderedBy(mode, page, perPage, order, name);
    }

    const totalMaps = await mapManager.getTotalMaps(name);

    const pages = (totalMaps > 0) ? Math.ceil(totalMaps / perPage) : 1;

    const cleanMapNames = [];

    for(let i = 0; i < data.length; i++){

        const d = data[i];
        const currentName = Functions.cleanMapName(d.mapfile).toLowerCase();
        if(cleanMapNames.indexOf(currentName) === -1) cleanMapNames.push(currentName);

    }

    const mainMapsManager = new MainMaps();

    const mapImages = await mainMapsManager.getImages(cleanMapNames);

    await Analytics.insertHit(session.userIp, req.headers.host, req.headers['user-agent']);

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
            "display": display,
            "mapImages": JSON.stringify(mapImages),
            "name": name

        }
    };
}


export default MapsPage;