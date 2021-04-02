import PlayerFragSummary from '../PlayerFragSummary';
import PlayerCTFSummary from '../PlayerCTFSummary/';
import PlayerGeneral from '../PlayerGeneral/';
import PlayerGametypeStats from '../PlayerGametypeStats/';
import PlayerSpecialEvents from '../PlayerSpecialEvents/';
import PlayerADSummary from '../PlayerADSummary/';



const PlayerSummary = ({summary, flag, country, gametypeStats, gametypeNames, face}) =>{   

    summary = JSON.parse(summary);

    return (
        <div>

            
            <PlayerGeneral 
                country={country}
                flag={flag}
                face={face}
                first={summary.first}
                last={summary.last}
                matches={summary.matches}
                playtime={summary.playtime}
                winRate={summary.winrate}
                wins={summary.wins}
                losses={summary.losses}
                draws={summary.draws}
            />

            <PlayerGametypeStats data={gametypeStats} names={gametypeNames}/>

            <PlayerCTFSummary data={summary} />

            <PlayerADSummary dom={summary.dom_caps} domBest={summary.dom_caps_best} domBestLife={summary.dom_caps_best_life} assault={summary.assault_objectives}/>


            <PlayerFragSummary 
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
            />

            <PlayerSpecialEvents 
                data={summary}
            />

        </div>
    );

}

export default PlayerSummary;