import NavLink from './navlink';


function Nav(){

    return (
        <header>
            <h1>Node UTStats</h1>
            <nav>
                <NavLink url="#" text="Home" />
                <NavLink url="test" text="Recent Matches" />
                <NavLink url="#" text="Players" />
                <NavLink url="#" text="Servers" />
                <NavLink url="#" text="Maps" />

                <NavLink url="https://google.com" text="Google"/>
            </nav>
            
        </header>
    );
}

export default Nav;