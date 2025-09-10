import { headers, cookies } from "next/headers";
import SiteSettings from "../../../api/sitesettings";
import Session from "../../../api/session";
import Nav from "../UI/Nav";
import SearchForm from "../UI/Players/SearchForm";


function setQueryStuff(query){

    const selectedCountry = query.country ?? "";
    const selectedActive = (query.active !== undefined) ? parseInt(query.active) : 0;
    const selectedName = (query.name !== undefined) ? query.name : "";
    const perPage = (query.pp !== undefined) ? query.pp : 25;
    const page = (query.page !== undefined) ? cleanInt(query.page, 1, null) : 1;
    const sortBy = (query.sb !== undefined) ? query.sb : "name";
    const order = (query.o !== undefined) ? query.o.toLowerCase() : "asc";
    
    return {selectedCountry, selectedActive, selectedName, perPage, page, sortBy, order};
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
        </div>   
    </main>; 
}