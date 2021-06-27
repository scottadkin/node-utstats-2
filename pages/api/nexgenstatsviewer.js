import Promise from 'promise';
import NexgenStatsViewer from '../../api/nexgenstatsviewer';

export default (req, res) =>{


    return new Promise(async (resolve, reject) =>{


        const nexgen = new NexgenStatsViewer();

        const currentLists = await nexgen.getCurrentSettings();

        console.table(currentLists);

        let string = "";

        let c = 0;
        let currentData = 0;

        for(let i = 0; i < currentLists.length; i++){

            c = currentLists[i];

            if(c.type === 0){

                currentData = await nexgen.getDefaultList(c.gametype, c.players);

                string += await nexgen.displayDefaultList(c.title, currentData);

            }else if(c.type === 8){
                
                currentData = await nexgen.getPlayerMonsterKills(c.gametype, c.players);

                string += nexgen.displayCustomList(c.title, currentData);
                
            }else if(c.type === 9){

                currentData = await nexgen.getPlayerGodlikes(c.gametype, c.players);

                string += nexgen.displayCustomList(c.title, currentData);

            }else{

                currentData = await nexgen.getPlayerTotalsList(c.type, c.gametype, c.players);

                console.log(currentData);


                string += nexgen.displayCustomList(c.title, currentData);
            }
        }

        /*const data = await nexgen.getDefaultList(6, 30);

        console.log(data);

        const string = await nexgen.displayDefaultList("Test title", data);*/

        res.status(200).send(string);

        resolve();

    });

}