import Head from '../../../components/classic/Head';
import Nav from '../../../components/classic/Nav';
import Footer from '../../../components/Footer';
import Session from '../../../api/session';
import Records from '../../../api/classic/records';
import Functions from '../../../api/functions';
import CountryFlag from '../../../components/CountryFlag';
import styles from '../../../styles/Records.module.css';
import Link from 'next/link';
import Pagination from '../../../components/Pagination';
import Analytics from '../../../api/analytics';

const RecordsPage = ({host, session, data, page, perPage, pages, mode}) =>{

    data = JSON.parse(data);

    const tables = [];

    for(let i = 0; i < data.length; i++){

        const d = data[i];

        let rows = [];

        const currentType = d.name;

        

        for(let x = 0; x < d.data.length; x++){
 
            const offset = d.record - d.data[x].value;

            let currentValue = d.data[x].value;

            if(d.name === "Playtime"){

                currentValue = Functions.timeString(currentValue);
            }

            const place = x + 1 + (perPage * (page - 1));

            const url = (mode === 1) ? `/classic/player/${d.data[x].pid}` : `/classic/match/${d.data[x].matchid}`;

            rows.push(<tr key={x}>
                <td className="yellow">
                    <Link href={url}>
                        <a>
                            {place}{Functions.getOrdinal(place)}
                        </a>
                    </Link>
                </td>
                <td className="text-left">
                    <Link href={url}>
                        <a>
                            <CountryFlag country={d.data[x].country}/>{d.data[x].name}
                        </a>
                    </Link>
                </td>
                <td>
                    <Link href={url}>
                        <a>
                            {Functions.timeString(d.data[x].gametime)}
                        </a>
                    </Link>
                </td>
                <td>
                    <Link href={url}>
                        <a>
                            {currentValue}
                        </a>
                    </Link>
                </td>
                <td className={(offset === 0) ? "team-green" : "team-red"}>
                    <Link href={url}>
                        <a>{(offset === 0) ? null : `-${
                            (d.name === "Playtime") ? Functions.timeString(d.record - d.data[x].value) : offset}`}
                        </a>
                    </Link>
                </td>
            </tr>);

        }

        let showAllElem = null;

        if(data.length > 1){

            showAllElem = <Link href={`/classic/records/${d.id}?mode=${mode}`}>
                <a>
                    <div className={`${styles.viewall} center`}>
                        <img className={styles.icon} src="/images/up.png" alt="image"/>View all {d.totalResults} Results<img src="/images/down.png" className={`${styles.icon} ${styles.mleft5}`} alt="image"/>
                    </div>
                </a>
            </Link>
        }else{

            showAllElem = <Pagination currentPage={page} perPage={perPage} pages={pages} results={d.totalResults} url={`/classic/records/${d.id}?mode=${mode}&page=`}/>
        }

        const titleElem = (data.length === 1) ? null : <div className="default-sub-header">{currentType} Records</div>;

        tables.push(
            <div className="m-bottom-25">
                {titleElem}
                {(data.length === 1) ? showAllElem : null}
                <table key={i} className={`t-width-1 ${styles.table} m-bottom-25`}>
                    <tbody>
                        <tr>
                            <th>Place</th>
                            <th>Player</th>
                            <th>Playtime</th>         
                            <th>{currentType}</th>
                            <th>Offset</th>
                        </tr>
                        {rows}
                    </tbody>
                </table>
                {showAllElem}
            </div>
        );
    }

    const title = `${(data.length === 1) ? `View Player ${(mode === 0) ? "Match" : "Total"} ${data[0].name} Records - Page ${page} of ${pages}` : `View Player ${(mode === 0) ? "Match" : "Total"} Records`}`;

    let description = "";
    let keywords = "";

    if(data.length === 1){

        const start = perPage * (page - 1);
        const end = start + perPage;
   
        description = `View player ${(mode === 0) ? "match" : "total"} ${data[0].name} records - Page ${page} of ${pages}, results ${start + 1} to ${end} out of a possible ${data[0].totalResults}.`;
        keywords = `${data[0].name}`;
    }else{

        description = `View various player ${(mode === 0) ? "match" : "total"} record categories.`;
    }

    
    return <div>
        <Head host={host} title={title} 
        description={description} 
        keywords={`record,records,player,match,${keywords}`}/>
        <main>
            <Nav />
            <div id="content">

                <div className="default">
                    <div className="default-header">{(data.length !== 1) ? `Player ${(mode === 0) ? "Match" : "Totals"} Records` : `Player ${(mode === 0) ? "Match" : "Totals"} ${data[0].name} Records`}</div>

                        <div className="big-tabs">
                            <Link href={`/classic/records/all?mode=0`}>
                                <a>
                                    <div style={{"width": "30%", "maxWidth":"150px"}}className={`big-tab ${(mode === 0) ? "tab-selected" : null}`}>
                                        Match
                                    </div>
                                </a>
                            </Link>
                            <Link href={`/classic/records/all?mode=1`}>
                                <a>
                                    <div style={{"width": "30%", "maxWidth":"150px"}}className={`big-tab ${(mode === 1) ? "tab-selected" : null}`}>
                                        Totals
                                    </div>
                                </a>
                            </Link>                 
                        </div>

                    {tables}
                </div>
            </div>

            <Footer session={session}/>
        </main>
    </div>
}



export async function getServerSideProps({req, query}) {

    let id = (query.id !== undefined) ? parseInt(query.id) : 0;
    let page = (query.page !== undefined) ? parseInt(query.page) : 1;
    let perPage = (query.perPage !== undefined) ? parseInt(query.perPage) : 50;
    let mode = (query.mode !== undefined) ? parseInt(query.mode) : 0;

    if(id !== id) id = -1;
    if(page !== page) page = 1;

    if(perPage !== perPage){
        perPage = 50;
    }else{
        if(perPage < 5 || perPage > 100){
            perPage = 50;
        }
    }

    if(mode !== mode) mode = 0;

    if(mode !== 0 && mode !== 1) mode = 0;

    const session = new Session(req);
    await session.load();

    const recordsManager = new Records();

    let data = [];

    let pages = 0;

    if(id === -1){
        data = await recordsManager.getDefault(mode);
    }else{
        data = await recordsManager.getTypeById(id, page, perPage, mode);

        if(data[0].totalResults > 0){
            pages = Math.ceil(data[0].totalResults / perPage);
        }
    }

    await Analytics.insertHit(session.userIp, req.headers.host, req.headers['user-agent']);

    return {
        "props": {
            "host": req.headers.host,
            "session": JSON.stringify(session.settings),
            "data": JSON.stringify(data),
            "page": page,
            "perPage": perPage,
            "pages": pages,
            "mode": mode
        }
    };
}


export default RecordsPage;