import {searchMatches} from "../api/matches";
import Link from "next/link";
import MatchList from "../UI/MatchList";
import Header from "../UI/Header";



export default async function Page({params, searchParams}) {

    //const m = new Matches();

    let perPage = searchParams?.perPage ?? searchParams?.perpage ?? 5;
    let page = searchParams?.page ?? 1;

    //const matches = await m.getRecent(page, perPage, 0, playerManager);
    const matches = await searchMatches(page, perPage,0,0,"date","ASC");;
    //console.log(matches);

    return (
      <main className={"styles.main"}>
        <div>
            <Header>Recent Matches</Header>
            <MatchList matches={matches} />
        </div>
      </main>
    );
  }