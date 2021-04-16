import DefaultHead from '../components/defaulthead';
import Nav from '../components/Nav/';
import Footer from '../components/Footer/';
import Players from '../api/players';
import Functions from '../api/functions';
import RecordsList from '../components/RecordsList/';
import Pagination from '../components/Pagination/';

const validTypes = [
    "matches",
    "wins",
    "losses",
    "draws",
    "winrate",
    "playtime",
    "first_bloods",
    "frags",
    "score",
    "kills",
    "deaths",
    "suicides",
    "team_kills",
    "spawn_kills",
    "efficiency",
    "multi_best",
    "spree_best",
    "best_spawn_kill_spree"
];

const typeTitles = [
    "Matches",
    "Wins",
    "Losses",
    "Draws",
    "WinRate",
    "Playtime(Hours)",
    "First Bloods",
    "Frags",
    "Score",
    "Kills",
    "Deaths",
    "Suicides",
    "Team Kills",
    "Spawn Kills",
    "Efficiency",
    "Best Multi Kill",
    "Longest Killing Spree",
    "Longest Spawn Killing Spree"
];

const Records = ({type, results, perPage, title, page, pages, record, currentRecords}) =>{

    return <div>
        <DefaultHead />
        <main>
            <Nav />
            <div id="content">
                <div className="default">
                    <div className="default-header">{title} Records</div>
                </div>
                <RecordsList data={currentRecords} page={page} perPage={perPage} record={record}/>
                <div className="text-center">
                    <Pagination currentPage={page} results={results} pages={pages} perPage={perPage} url={`/records?type=${type}&page=`}/>
                </div>
            </div>
            <Footer />
        </main>
    </div>
}

export async function getServerSideProps({query}){
    
    let type = "kills";
    let page = 1;
    let perPage = 50;

    let typeIndex = 0;

    if(query.type !== undefined){

        typeIndex = validTypes.indexOf(query.type.toLowerCase());

        if(typeIndex !== -1){
            type = validTypes[typeIndex];
        }else{
            typeIndex = 0;
        }
    }

    if(query.page !== undefined){

        page = parseInt(query.page);

        if(page !== page){
            page = 1;
        }else{
            if(page < 1) page = 1;
        }
    }

    const playerManager = new Players();


    const currentRecords = await playerManager.getBestOfTypeTotal(validTypes, type, 0, perPage, page);
    const highestValue = await playerManager.getBestOfTypeTotal(validTypes, type, 0, 1, 1);
    const totalResults = await playerManager.getTotalResults(0);

    let pages = Math.ceil(totalResults / perPage);

    if(pages !== pages) pages = 1;

    return {
        "props": {
            "type": type,
            "results": totalResults,
            "page": page,
            "pages": pages,
            "perPage": perPage,
            "title": typeTitles[typeIndex],
            "record": JSON.stringify(highestValue),
            "currentRecords": JSON.stringify(currentRecords)
        }
    }
}

export default Records;