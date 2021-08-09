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

const RecordsPage = ({host, session, data, page, perPage, pages}) =>{

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

            rows.push(<tr key={x}>
                <td className="yellow">
                    <Link href={`/classic/match/${d.data[x].matchid}`}>
                        <a>
                            {place}{Functions.getOrdinal(place)}
                        </a>
                    </Link>
                </td>
                <td className="text-left">
                    <Link href={`/classic/match/${d.data[x].matchid}`}>
                        <a>
                            <CountryFlag country={d.data[x].country}/>{d.data[x].name}
                        </a>
                    </Link>
                </td>
                <td>
                    <Link href={`/classic/match/${d.data[x].matchid}`}>
                        <a>
                            {Functions.timeString(d.data[x].gametime)}
                        </a>
                    </Link>
                </td>
                <td>
                    <Link href={`/classic/match/${d.data[x].matchid}`}>
                        <a>
                            {currentValue}
                        </a>
                    </Link>
                </td>
                <td className={(offset === 0) ? "team-green" : "team-red"}>
                    <Link href={`/classic/match/${d.data[x].matchid}`}>
                        <a>{(offset === 0) ? null : `-${
                            (d.name === "Playtime") ? Functions.timeString(d.record - d.data[x].value) : offset}`}
                        </a>
                    </Link>
                </td>
            </tr>);

        }

        let showAllElem = null;

        if(data.length > 1){

            showAllElem = <Link href={`/classic/records/${d.id}`}>
                <a>
                    <div className={`${styles.viewall} center`}>
                        <img className={styles.icon} src="/images/up.png" alt="image"/>View all {d.totalResults} Results<img src="/images/down.png" className={`${styles.icon} ${styles.mleft5}`} alt="image"/>
                    </div>
                </a>
            </Link>
        }else{

            showAllElem = <Pagination currentPage={page} perPage={perPage} pages={pages} results={d.totalResults} url={`/classic/records/${d.id}?page=`}/>
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

    const title = `${(data.length === 1) ? `View Player ${data[0].name} Records - Page ${page} of ${pages}` : `View Player Records`}`;

    let description = "";
    let keywords = "";

    if(data.length === 1){

        const start = perPage * (page - 1);
        const end = start + perPage;
   
        description = `View player ${data[0].name} records - Page ${page} of ${pages}, results ${start + 1} to ${end} out of a possible ${data[0].totalResults}.`;
        keywords = `${data[0].name}`;
    }else{

        description = `View various player record categories.`;
    }

    
    return <div>
        <Head host={host} title={title} 
        description={description} 
        keywords={`record,records,player,${keywords}`}/>
        <main>
            <Nav />
            <div id="content">

                <div className="default">
                    <div className="default-header">{(data.length !== 1) ? "Records" : `${data[0].name} Records`}</div>
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
    let perPage = (query.perPage !== undefined) ? parseInt(query.perPage) : 25;

    if(id !== id) id = -1;
    if(page !== page) page = 1;

    if(perPage !== perPage){
        perPage = 25;
    }else{
        if(perPage < 5 || perPage > 100){
            perPage = 25;
        }
    }

    const session = new Session(req);
    await session.load();

    const recordsManager = new Records();

    let data = [];

    let pages = 0;

    if(id === -1){
        data = await recordsManager.getDefault();
    }else{
        data = await recordsManager.getTypeById(id, page, 25);

        if(data[0].totalResults > 0){
            pages = Math.ceil(data[0].totalResults / perPage);
        }
    }


    return {
        "props": {
            "host": req.headers.host,
            "session": JSON.stringify(session.settings),
            "data": JSON.stringify(data),
            "page": page,
            "perPage": perPage,
            "pages": pages
        }
    };
}


export default RecordsPage;