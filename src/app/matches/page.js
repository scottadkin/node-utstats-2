import {searchMatches} from "../lib/matches";
import MatchList from "../UI/MatchList";
import Header from "../UI/Header";
import Pagination from "../UI/Pagination";



export default async function Page({params, searchParams}) {

    //const m = new Matches();

    let perPage = searchParams?.perPage ?? searchParams?.perpage ?? 5;
    let page = searchParams?.page ?? 1;

    //const matches = await m.getRecent(page, perPage, 0, playerManager);
    const {matches, total} = await searchMatches(page, perPage,0,0,"date","ASC");;
  
    return (
      <main className={"styles.main"}>
        <div>
            <Header>Recent Matches</Header>
            <MatchList matches={JSON.stringify(matches)} />
            <Pagination url="/matches?page=" currentPage={page} results={total} perPage={perPage}/>
        </div>
      </main>
    );
  }