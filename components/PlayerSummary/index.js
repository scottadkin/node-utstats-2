import PlayerFragSummary from '../PlayerFragSummary';
import PlayerCTFSummary from '../PlayerCTFSummary/';
import PlayerGeneral from '../PlayerGeneral/';
import PlayerGametypeStats from '../PlayerGametypeStats/';
import PlayerSpecialEvents from '../PlayerSpecialEvents/';
import PlayerADSummary from '../PlayerADSummary/';



const PlayerSummary = ({session, pageSettings, summary, flag, country, gametypeStats, gametypeNames, latestWinRate,
    winRateHistory, faces}) =>{   

    summary = JSON.parse(summary);

    faces = JSON.parse(faces);

    let faceId = Object.keys(faces)[0];

    const elems = [];

    console.log(pageSettings);

    if(pageSettings["Display Summary"] === "true"){

        elems.push(<PlayerGeneral key={1} country={country}
            flag={flag}
            face={faces[faceId].name}
            first={summary.first}
            last={summary.last}
            matches={summary.matches}
            playtime={summary.playtime}
            winRate={summary.winrate}
            wins={summary.wins}
            losses={summary.losses}
            draws={summary.draws}
            
        />);
    }

    if(pageSettings["Display Gametype Stats"] === "true"){

        elems.push(<PlayerGametypeStats key={2} session={session} data={gametypeStats} names={gametypeNames} latestWinRate={latestWinRate} winRateHistory={winRateHistory}/>);
    }

    if(pageSettings["Display Capture The Flag Summary"] === "true"){

        elems.push(<PlayerCTFSummary key={3} session={session} data={summary} />);
    }

    if(pageSettings["Display Assault & Domination"] === "true"){

        elems.push(<PlayerADSummary key={4} dom={summary.dom_caps} domBest={summary.dom_caps_best} domBestLife={summary.dom_caps_best_life} assault={summary.assault_objectives}/>);
    }

    if(pageSettings["Display Frag Summary"] === "true"){

        elems.push(<PlayerFragSummary key={5}
            session={session}
            score={summary.score}
            frags={summary.frags}
            kills={summary.kills}
            deaths={summary.deaths}
            suicides={summary.suicides}
            teamKills={summary.team_kills}
            spawnKills={summary.spawn_kills}
            efficiency={summary.efficiency}
            firstBlood={summary.first_bloods}
            accuracy={summary.accuracy}
            close={summary.k_distance_normal}
            long={summary.k_distance_long}
            uber={summary.k_distance_uber}
            headshots={summary.headshots}
            spawnKillSpree={summary.best_spawn_kill_spree}
        />);
    }

    if(pageSettings["Display Special Events"] === "true"){
        elems.push(<PlayerSpecialEvents session={session} key={6}
            data={summary}
        />);
    }

    return <div>
        {elems}
    </div>

}

export default PlayerSummary;