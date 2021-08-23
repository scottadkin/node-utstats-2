import Head from '../../components/classic/Head';
import Nav from '../../components/classic/Nav';
import Footer from '../../components/Footer';
import Session from '../../api/session';
import Matches from '../../api/classic/matches';
import MatchesList from '../../components/classic/MatchesList';
import Gametypes from '../../api/classic/gametypes';
import Analytics from '../../api/analytics';

const RecentMatches = ({host, session, recentMatches, gametypeList, gametype, perPage, display, page, results, pages,
        serverNames, server}) =>{

    recentMatches = JSON.parse(recentMatches);
    gametypeList = JSON.parse(gametypeList);
    serverNames = JSON.parse(serverNames);

    let gametypeName = "";

    if(gametypeList[`${gametype}`] !== undefined){
        gametypeName = `${gametypeList[gametype]} `;
    }
    
    let serverName = "";

    if(serverName !== 0){
        serverName = `on ${server} `;
    }

    return <div>
        <Head host={host} title={`${gametypeName}Matches ${serverName}- Page ${page + 1} of ${pages}`} 
        description={`${gametypeName}Matches ${serverName}- Page ${page + 1} of ${pages}, ${results} matches found.`} 
        keywords={`${(gametypeName !== "") ? `${gametypeName},` : ""},matches,classic,match`}/>
        <main>
            <Nav />
            <div id="content">

                <div className="default">
                <MatchesList title={"Recent Matches"} data={recentMatches} gametypes={gametypeList} gametype={gametype} perPage={perPage}
                    display={display} results={results} pages={pages} page={page} serverNames={serverNames} server={server}
                />
                </div>
            </div>
            
            <Footer session={session}/>
        </main>
    </div>
}



export async function getServerSideProps({req, query}) {

    const session = new Session(req);

    await session.load();

    const defaultPerPage = 25;

    let gametype = 0;
    let perPage = 25;
    let display = 0;
    let currentPage = 0;
    let server = 0;


    if(query.gametype !== undefined){

        gametype = parseInt(query.gametype);

        if(gametype !== gametype) gametype = 0;
    }

    if(query.server !== undefined){

        server = query.server;

        if(server === "0") server = 0;
    }

    if(query.perPage !== undefined){

        perPage = parseInt(query.perPage);

        if(perPage !== perPage) perPage = defaultPerPage;

        if(perPage < 5 || perPage > 100){
            perPage = defaultPerPage;
        }
    }

    if(query.display !== undefined){

        display = parseInt(query.display);

        if(display != 0 && display != 1){
            display = 0;
        }
    }

    if(query.page !== undefined){

        currentPage = parseInt(query.page);

        if(currentPage !== currentPage){
            currentPage = 0;
        }else{
            currentPage = currentPage - 1;
        }

        if(currentPage < 0) currentPage = 0;
    }

    const matchManager = new Matches();
    const recentMatches = await matchManager.getLatestMatches(gametype, server, currentPage, perPage);

    const gametypeManager = new Gametypes();

    const gametypeList = await gametypeManager.getAllNames();

    const totalMatches = await matchManager.getTotalMatches(gametype, server);

    let pages = 1;

    if(totalMatches > 0 && perPage > 0){

        pages = Math.ceil(totalMatches / perPage);
    }

    await Analytics.insertHit(session.userIp, req.headers.host, req.headers['user-agent']);

    const serverNames = await matchManager.getAllServerNames();

    return {
        "props": {
            "host": req.headers.host,
            "session": JSON.stringify(session.settings),
            "recentMatches": JSON.stringify(recentMatches),
            "gametypeList": JSON.stringify(gametypeList),
            "gametype": gametype,
            "perPage": perPage,
            "display": display,
            "page": currentPage,
            "results": totalMatches,
            "pages": pages,
            "serverNames": JSON.stringify(serverNames),
            "server": server
        }
    };
}


export default RecentMatches;