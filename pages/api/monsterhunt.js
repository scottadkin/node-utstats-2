import MonsterHunt from "../../api/monsterhunt";

function getMonsterIds(data){

    const monsterIds = [];

    for(let i = 0; i < data.length; i++){

        monsterIds.push(data[i].monster);
    }

    return monsterIds;
}

export default async function handler(req, res){

    try{

        const mhManager = new MonsterHunt();

        const mode = req.body.mode.toLowerCase() ?? null;
        const matchId = parseInt(req.body.matchId) ?? null;
        const playerId = parseInt(req.body.playerId) ?? null;

        console.log(req.body);


        if(mode === "fullmatch"){

            const matchMonsterTotals = await mhManager.getMatchMonsterTotals(matchId);
            const monsterIds = getMonsterIds(matchMonsterTotals);
            const monsterNames = await mhManager.getMonsterNames(monsterIds);

            const justMonsterNames = [];

            for(const [key, value] of Object.entries(monsterNames)){
                justMonsterNames.push(value.className);
            }

            const monsterImages = mhManager.getImages(justMonsterNames);
            const playerKills = await mhManager.getPlayerMatchKillTotals(matchId);

            res.status(200).json({
                "monsterNames": monsterNames, 
                "monsterTotals": matchMonsterTotals, 
                "playerKills": playerKills,
                "monsterImages": monsterImages
            });

            return;
        }

        if(mode === "playertotals"){

            const playerMonsterTotals = await mhManager.getPlayerMonsterTotals(playerId);
            const monsterIds = getMonsterIds(playerMonsterTotals);
            const monsterNames = await mhManager.getMonsterNames(monsterIds);

            res.status(200).json({
                "totals": playerMonsterTotals,
                "monsterNames": monsterNames
            })
            return;
        }

        res.status(200).json({"error": "Unknown command!"});
        return;

    }catch(err){
        console.trace(err);
    }
}