import Promise from 'promise';
import NexgenStatsViewer from '../../api/nexgenstatsviewer';

export default function handler(req, res){


    return new Promise(async (resolve, reject) =>{


        const nexgen = new NexgenStatsViewer();

        const currentLists = await nexgen.getCurrentSettings(true);

        let string = "";

        let c = 0;
        let currentData = 0;

        for(let i = 0; i < currentLists.length; i++){

            c = currentLists[i];

            if(c.type === 0){

                currentData = await nexgen.getDefaultList(c.gametype, c.players);

                string += await nexgen.displayDefaultList(c.title, currentData);

            }else if(c.type === 2){
                
                currentData = await nexgen.getPlayerTotalsList(c.type, c.gametype, c.players);

                for(let x = 0; x < currentData.length; x++){

                    currentData[x].totals = (currentData[x].totals / (60 * 60)).toFixed(2);
                }

                string += nexgen.displayCustomList(c.title, currentData);
                
            }else if(c.type === 8){
                
                currentData = await nexgen.getPlayerMonsterKills(c.gametype, c.players);

                string += nexgen.displayCustomList(c.title, currentData);
                
            }else if(c.type === 9){

                currentData = await nexgen.getPlayerGodlikes(c.gametype, c.players);

                string += nexgen.displayCustomList(c.title, currentData);

            }else{

                currentData = await nexgen.getPlayerTotalsList(c.type, c.gametype, c.players);

                string += nexgen.displayCustomList(c.title, currentData);
            }
        }

        res.status(200).send(string);

        resolve();

    });

}