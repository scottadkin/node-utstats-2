import CookieBanner from '../CookieBanner/';

function Footer({session}){
    return (
        <div>
            <CookieBanner session={session}/>
            <footer>
                Node UTStats 2 &copy; 2021 <a className="yellow" href="https://github.com/scottadkin">Scott Adkin</a><br/>
                <span className="yellow">Original UTStats &copy; 2005 azazel, )°DoE°(-AnthraX and toa</span><br/>
                Thanks to <span className="yellow">Krull0r</span> for the Monster Icons.
            </footer>
        </div>
        
    );
}

export default Footer;