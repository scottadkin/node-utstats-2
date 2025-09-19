import { headers, cookies } from "next/headers";
import SiteSettings from "../../../api/sitesettings";
import Session from "../../../api/session";
import Nav from "../UI/Nav";
import SearchForm from "../UI/Players/SearchForm";
import { cleanInt, convertTimestamp, toPlaytime } from "../../../api/generic.mjs";
import PlayerSearch from "../lib/playersearch";
import {BasicTable} from "../UI/Tables/Tables";
import CountryFlag from "../UI/CountryFlag";
import Pagination from "../UI/Pagination";
import Link from "next/link";


function setQueryStuff(query){

    const selectedCountry = (query.country !== undefined) ? query.country.toLowerCase() : "";
    const selectedActive = (query.active !== undefined) ? parseInt(query.active) : 0;
    const selectedName = (query.name !== undefined) ? query.name : "";
    const perPage = (query.pp !== undefined) ? query.pp : 25;
    let page = (query.page !== undefined) ? cleanInt(query.page, 1, null) : 1;
    const sortBy = (query.sb !== undefined) ? query.sb : "name";
    const order = (query.o !== undefined) ? query.o.toLowerCase() : "asc";

     if(page !== page){
        page = 1;
    }

    page--;

    if(page < 0) page = 0;
    
    return {selectedCountry, selectedActive, selectedName, perPage, page, sortBy, order};
}

export async function generateMetadata({ params, searchParams }, parent) {
    
    return {
        "title": "Player Search - Node UTStats 2",
        "description": "Search for a player",
        "keywords": ["player", "search", "utstats", "node"],
    }
}

export default async function Page({searchParams}){

    const cookieStore = await cookies();
	const header = await headers();
	const cookiesData = cookieStore.getAll();

    const query = await searchParams;
   
    const {selectedCountry, selectedActive, selectedName, perPage, page, sortBy, order} = setQueryStuff(query);

	const ip = (header.get('x-forwarded-for') ?? '127.0.0.1').split(',')[0]
	
	const session = new Session(ip, JSON.stringify(cookiesData));

	await session.load();
	const siteSettings = new SiteSettings();
	const navSettings = await siteSettings.getCategorySettings("Navigation");
	const sessionSettings = JSON.stringify(session.settings);


    const p = new PlayerSearch();
    
    const {data, totalMatches} = await p.defaultSearch(selectedName, page, perPage, selectedCountry, selectedActive, sortBy, order);

    const tableHeaders = [
        "Name", "Last Active", "Playtime", "Matches", "Kills", "score"
    ];

    const tableStyles = [
        "text-left", "playtime", "playtime", null, null, null
    ];

    const pURL = `/players?name=${selectedName}&country=${selectedCountry}&active=${selectedActive}&sb=${sortBy}&pp=${perPage}&page=`;

    return <main>
        <Nav settings={navSettings} session={sessionSettings}/>		
        <div id="content">
            <div className="default">
                <div className="default-header">Players</div>
                <SearchForm 
                    country={selectedCountry} 
                    active={selectedActive}
                    name={selectedName}
                    perPage={perPage}
                    sortBy={sortBy}
                    order={order}
                />
            </div>
            
            <div className="default">
                <Pagination currentPage={page + 1} results={totalMatches} perPage={perPage} url={pURL}/>
                <BasicTable headers={tableHeaders} columnStyles={tableStyles} rows={[...data.map((s) =>{

                    const url = `/player/${s.id}`;
            
                    return [
                        <Link href={url}><CountryFlag country={s.country}/>{s.name}</Link>,
                        <Link href={url}>{convertTimestamp(s.last, true)}</Link>,
                        <Link href={url}>{toPlaytime(s.playtime)}</Link>,
                        <Link href={url}>{s.matches}</Link>,
                        <Link href={url}>{s.kills}</Link>,
                       <Link href={url}>{s.score}</Link>
                    ];
                })]}/>
                <Pagination currentPage={page + 1} results={totalMatches} perPage={perPage} url={pURL}/>
            </div>
        </div>   
    </main>; 
}