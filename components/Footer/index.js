import CookieBanner from '../CookieBanner/';

function Footer({session}){
    return (
        <div>
            <CookieBanner session={session}/>
            <footer>
                Node UTStats 2<br/>
                &copy; Scott Adkin 2021
            </footer>
        </div>
        
    );
}

export default Footer;