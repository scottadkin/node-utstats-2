import geo from 'geoip-lite';
import countries from '../../api/countries';

export default async (req, res) =>{

    try{

        let ip = (req.body.ip !== undefined) ? req.body.ip : null;

        if(ip !== null){

            const iplookup = geo.lookup(ip);

            if(iplookup !== null){

                res.status(200).json({"country": countries(iplookup.country).country, "code": iplookup.country});

            }else{
                res.status(200).json({"country": "Unknown", "code": "XX"});
            }

        }else{

            res.status(200).json({"country": "Unknown", "code": "XX"});
        }

    }catch(err){
        console.trace(err);
        res.status(200).json({"error": err});
    }   
}