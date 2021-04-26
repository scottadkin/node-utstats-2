
import shajs from 'sha.js';
import UserManager from '../../api/user';

export default async (req, res) =>{


    try{

        const user = new UserManager();

        if(req.method === "POST"){
            console.log("method is post");
        }

        console.log(req.body);

        
        console.log(shajs('sha256').update('yhg3894vgh934h834').digest('hex'))
        // => 73475cb40a568e8da8a045ced110137e159f890ac4da883b6b17dc651b3a8049

        const userExists = await user.bUserExists(req.body.username);

        res.status(200).json({ "userExists": userExists})

    }catch(err){
        console.trace(err);
        res.status(200).json({"error": err});
    }
}