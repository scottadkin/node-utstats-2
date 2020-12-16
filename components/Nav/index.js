import NavLink from '../navlink';


function Nav(){

    return (
        <header>
            <h1 className="hidden">Node UTStats</h1>
            <nav>
                <NavLink url="/" text="Home" />
                <NavLink url="/matches" text="Recent Matches" />
                <NavLink url="/players" text="Players" />
                <NavLink url="#" text="Servers" />
                <NavLink url="/maps" text="Maps" />
                <NavLink url="/credits" text="Credits" />
            </nav>
            
        </header>
    );
}

export default Nav;