import NavLink from '../navlink';


function Nav(){

    return (
        <div>
        <div id="mouse-over">
                <div id="mouse-over-title"></div>
                <div id="mouse-over-content"></div>
            </div>
        <header>
            <h1 className="hidden">Node UTStats</h1>
            <nav>
                <NavLink url="/" text="Home" />
                <NavLink url="/matches/start" text="Recent Matches" />
                <NavLink url="/players" text="Players" />
                <NavLink url="#" text="Servers" />
                <NavLink url="/maps" text="Maps" />
                <NavLink url="/credits" text="Credits" />
            </nav>         
        </header>
        </div>
        
    );
}

export default Nav;