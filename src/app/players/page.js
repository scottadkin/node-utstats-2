import { headers, cookies } from "next/headers";
import {getSettings, getNavSettings} from "../../../api/sitesettings";
import Session from "../../../api/session";
import Nav from "../UI/Nav";
import SearchForm from "../UI/Players/SearchForm";
import { cleanInt, convertTimestamp, toPlaytime } from "../../../api/generic.mjs";
import PlayerSearch from "../lib/playersearch";
import {BasicTable} from "../UI/Tables/";
import CountryFlag from "../UI/CountryFlag";
import Pagination from "../UI/Pagination";
import Link from "next/link";
import { getCountryName } from "../../../api/countries";


function setQueryStuff(query, pageSettings){

    const selectedCountry = (query.country !== undefined) ? query.country.toLowerCase() : "";
    const selectedActive = (query.active !== undefined) ? parseInt(query.active) : pageSettings["Default Last Active Range"];
    const selectedName = (query.name !== undefined) ? query.name : "";
    let perPage = (query.pp !== undefined) ? parseInt(query.pp) : parseInt(pageSettings["Default Display Per Page"]);
    if(perPage !== perPage) perPage = 25;

    let page = (query.page !== undefined) ? cleanInt(query.page, 1, null) : 1;
    const sortBy = (query.sb !== undefined) ? query.sb : pageSettings["Default Sort By"];
    const order = (query.o !== undefined) ? query.o.toLowerCase() : pageSettings["Default Order"]?.toLowerCase();

     if(page !== page){
        page = 1;
    }

    page--;

    if(page < 0) page = 0;
    
    return {selectedCountry, selectedActive, selectedName, perPage, page, sortBy, order};
}

export async function generateMetadata({ params, searchParams }, parent) {
    
    const query = await searchParams;

    let name = query?.name ?? "";
    let country = query?.country ?? "";
    let searchBy = query?.sb ?? "";
    let active = query?.active ?? "";
    let order = query.o ?? "desc";
    order = order.toLowerCase();

    if(country !== "") country = getCountryName(country);

    if(searchBy !== ""){

        searchBy = searchBy.toLowerCase();
       
        switch(searchBy){
            case "name": { searchBy = "Name" } break;
            case "playtime": { searchBy = "Playtime" } break;
            case "matches": { searchBy = "Matches Played" } break;
            case "score": { searchBy = "Score" } break;
            case "kills": { searchBy = "Kills" } break;
            case "last": { searchBy = "Last Active" } break;
        }
    }

    if(active !== ""){

        switch(active){
            case "1": { active = "Past 24 Hours" } break;
            case "2": { active = "Past 7 Days" } break;
            case "3": { active = "Past 28 Days" } break;
            case "4": { active = "Past Year" } break;
        }
    }

    let title = "Players";
    let desc = "Search for a player";

    if(country !== ""){
        title = `Players From ${country} Search`;
        desc += ` from the country ${country}`
    }

    if(name !== ""){
        title = `"${name}" Player Search`;
        desc += ` with a name containing ${name}`;
    }

    if(active !== ""){
        desc += `, active within the ${active}`;
    }

    if(searchBy !== ""){
        desc += `, order by ${searchBy} ${(order === "desc") ? "descending" : "ascending"} order`;
    }

    return {
        "title": `${title} - Node UTStats 2`,
        "description": `${desc}.`,
        "keywords": ["player", "search", "utstats", "node"],
    }
}

export default async function Page({searchParams}){

    const cookieStore = await cookies();
	const header = await headers();
	const cookiesData = cookieStore.getAll();

    const query = await searchParams;
    const pageSettings = await getSettings("Players Page");
    console.log(pageSettings);
   
    const {selectedCountry, selectedActive, selectedName, perPage, page, sortBy, order} = setQueryStuff(query, pageSettings);

	const ip = (header.get('x-forwarded-for') ?? '127.0.0.1').split(',')[0]
	
	const session = new Session(ip, cookiesData);

	await session.load();
	const navSettings = await getNavSettings("Navigation");
	const sessionSettings = session.settings;
    

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