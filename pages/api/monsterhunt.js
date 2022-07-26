import MonsterHunt from "../../api/monsterhunt";

function getMonsterIds(data){

    const monsterIds = [];

    for(let i = 0; i < data.length; i++){

        monsterIds.push(data[i].monster);
    }

    return monsterIds;
}

function setMonsterImagesNames(monsterNames, monsterHuntManager){

    const monsterClassNames = [];

    for(const value of Object.values(monsterNames)){

        monsterClassNames.push(value.className);
    }

    const images = monsterHuntManager.getImages(monsterClassNames);

    return images;

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

            const images = setMonsterImagesNames(monsterNames, mhManager);

            const playerKills = await mhManager.getPlayerMatchKillTotals(matchId);

            res.status(200).json({
                "monsterNames": monsterNames, 
                "monsterTotals": matchMonsterTotals, 
                "playerKills": playerKills,
                "monsterImages": images
            });

            return;
        }

        if(mode === "playertotals"){

            const playerMonsterTotals = await mhManager.getPlayerMonsterTotals(playerId);
            const monsterIds = getMonsterIds(playerMonsterTotals);
            const monsterNames = await mhManager.getMonsterNames(monsterIds);

            const images = setMonsterImagesNames(monsterNames, mhManager);

            res.status(200).json({
                "totals": playerMonsterTotals,
                "monsterNames": monsterNames,
                "monsterImages": images
            })
            return;
        }

        res.status(200).json({"error": "Unknown command!"});
        return;

    }catch(err){
        console.trace(err);
    }
}