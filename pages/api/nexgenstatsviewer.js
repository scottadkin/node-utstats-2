import Promise from 'promise';
import NexgenStatsViewer from '../../api/nexgenstatsviewer';

export default (req, res) =>{


    return new Promise(async (resolve, reject) =>{


        const nexgen = new NexgenStatsViewer();

        const data = await nexgen.getDefaultList(6, 30);

        console.log(data);

        const string = await nexgen.displayDefaultList("Test title", data);

        res.status(200).send(string);

        resolve();

    });

}