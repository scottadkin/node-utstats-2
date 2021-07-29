import Link from 'next/link';

const Nav = () =>{

    return <header>
        <div id="beta-message">
            This is an early beta build, there may be problems at first, they will be fixed once reported <a className="yellow" href="https://github.com/scottadkin/node-utstats-2/issues">Here</a>
        </div>
        <h1>Node UTStats 2 Classic Mode</h1>
        <nav>
            <Link href="/"><a><div className="nl">Main Site</div></a></Link>
            <Link href="/classic/"><a><div className="nl">Classic Home</div></a></Link>
            <Link href="/classic/matches"><a><div className="nl">Matches</div></a></Link>
            <Link href="/classic/rankings/"><a><div className="nl">Rankings</div></a></Link>
            <Link href="/classic/servers/"><a><div className="nl">Servers</div></a></Link>
            <Link href="/classic/players/"><a><div className="nl">Players</div></a></Link>
            <Link href="/classic/maps/"><a><div className="nl">Maps</div></a></Link>
            <Link href="/classic/totals/"><a><div className="nl">Totals</div></a></Link>

        </nav>         
</header>
}

export default Nav;