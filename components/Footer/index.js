import CookieBanner from '../CookieBanner/';

function Footer({session}){

    if(typeof session === "string"){
        session = JSON.parse(session);
    }
    
    return (
        <div>
            <CookieBanner session={session}/>
            <footer>
                Node UTStats 2.7.X (Preview) &copy; 2021-2023 <a className="yellow" href="https://github.com/scottadkin">Scott Adkin</a><br/>
                <span className="yellow">Original UTStats &copy; 2005 azazel, )°DoE°(-AnthraX and toa</span><br/>
                <b><a style={{"color": "rgb(0,126,255)"}} href={"https://github.com/OldUnreal/UnrealTournamentPatches"}>Update UT to the Latest Unreal Tournament Patch by OldUnreal</a></b><br/>
                Thanks to <span className="yellow">Krull0r</span> for the Monster Icons.<br/>
                <div>Icons made by <a href="https://www.freepik.com" title="Freepik" className="yellow">Freepik</a>, and <a href="https://www.flaticon.com/authors/vector-stall" title="Vector Stall" className="yellow">Vector Stall</a> from <a href="https://www.flaticon.com/" title="Flaticon" className="yellow">www.flaticon.com</a></div>
            </footer>
        </div>
        
    );
}

export default Footer;