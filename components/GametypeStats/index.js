import TipHeader from '../TipHeader'


const gametypeStats = ({data, names}) =>{

    data = JSON.parse(data);
    names = JSON.parse(names);


    const elems = [];

    let currentPlaytime = 0;
    let currentWinRate = 0;
    let currentName = 0;

    data.sort((a, b) =>{

        a = a.playtime;
        b = b.playtime;

        if(a < b){
            return 1;
        }else if(a > b){
            return -1;
        }

        return 0;
    });


    for(let i = 0; i < data.length; i++){

        currentPlaytime = data[i].playtime / (60 * 60);
        currentWinRate = (data[i].wins / data[i].matches) * 100;
        currentName = names[data[i].gametype];
        if(currentName === undefined) currentName = "Not Found";

        elems.push(
            <tr key={i}>
                <td>{currentName}</td>
                <td>{currentPlaytime.toFixed(2)} Hours</td>
                <td>{data[i].matches}</td>
                <td>{data[i].wins}</td>
                <td>{data[i].draws}</td>
                <td>{data[i].losses}</td>
                <td>{currentWinRate.toFixed(2)}%</td>

            </tr>
        );
    }

    return (
        
        <div className="special-table">
                <div className="default-header">
                    Gametype Stats
                </div>
                <table>
                    <tbody>
                        <tr>
                            <TipHeader title={"Gametype"} content={"The name of the gametype."}/>
                            <TipHeader title={"Playtime"} content={"How long the player has played."}/>
                            <TipHeader title={"Matches"} content={"How many games the player has played."}/>
                            <TipHeader title={"Wins"} content={"How many matches won."}/>
                            <TipHeader title={"Draws"} content={"How many matches drawn."}/>
                            <TipHeader title={"Losses"} content={"How many matches lost."}/>
                            <TipHeader title={"WinRate"} content={"The player's winrate for the gametype."}/>
                        </tr>
                        {elems}
                    </tbody>
                </table>
            </div>
    );

}


export default gametypeStats;