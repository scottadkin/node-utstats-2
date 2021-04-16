import DefaultHead from '../components/defaulthead';
import Nav from '../components/Nav/';
import Footer from '../components/Footer/';
import Players from '../api/players';
import CountryFlag from '../components/CountryFlag/';
import Functions from '../api/functions';
import RecordsList from '../components/RecordsList/';

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

const Records = ({perPage, page, record, currentRecords}) =>{

    return <div>
        <DefaultHead />
        <main>
            <Nav />
            <div id="content">
                <div className="default">
                    <div className="default-header">Records</div>
                </div>
                <RecordsList data={currentRecords} page={page} perPage={perPage} record={record}/>

            </div>
            <Footer />
        </main>
    </div>
}

export async function getServerSideProps({query}){

    console.log(query);

    const playerManager = new Players();

    let page = 1;
    let perPage = 50;


    const currentRecords = await playerManager.getBestOfTypeTotal(validTypes, "kills", 0, perPage, page);
    const highestValue = await playerManager.getBestOfTypeTotal(validTypes, "kills", 0, 1, 1);

    return {
        "props": {
            "page": page,
            "perPage": perPage,
            "record": JSON.stringify(highestValue),
            "currentRecords": JSON.stringify(currentRecords)
        }
    }
}

export default Records;