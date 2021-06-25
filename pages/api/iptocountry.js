import dns from 'dns';
import Promise from 'promise';
import geoip from 'geoip-lite';
import Countries from '../../api/countries';
import i18nCountries from 'i18n-iso-countries';

export default (req, res) =>{


    const createHostNameString = (ip) =>{

        return new Promise((resolve, reject) =>{

            dns.reverse(ip, (err, hostNames) =>{

                if(err){ 
                   
                    if(err.code !== "ENOTFOUND"){
                        console.log(err);
                    }

                    resolve(ip);
                }


                if(hostNames !== undefined){
                    if(hostNames.length > 0){
                        resolve(hostNames[0]);
                    }
                }

                resolve(ip);

            });

        });
    }

    const createReturnString = (data) =>{

        
        let string = "";

        let d = 0;

        for(let i = 0; i < data.length; i++){

            d = data[i];

            string += `${d.ip}:${d.hostname}:${d.country}:${d.shortCountry}:${d.code}`;

            if(i < data.length - 1){
                string+=",";
            }
        }

        return string;
    }


    return new Promise(async (resolve, reject) =>{

        console.log(req.query);

        if(req.query.ip !== undefined){

            let ips = req.query.ip.split(",");

            console.log("ips");
            console.log(ips);

            //hh:mm xxx:aaa.bbb.ccc.ddd:hostname:COUNTRYNAME_LONG:COUNTRYNAME_SHORT:flagname

            const data = [];

            let currentGeo = 0;
            let currentCountry = 0;

            for(let i = 0; i < ips.length; i++){

                currentGeo = geoip.lookup(ips[i]);
                currentCountry = Countries(currentGeo.country)

                data.push({
                    "ip": ips[i],
                    "hostname": await createHostNameString(ips[i]),
                    "code": currentGeo.country.toLowerCase(),
                    "shortCountry": i18nCountries.alpha2ToAlpha3(currentGeo.country),
                    "country": currentCountry.country
                });
                
            }
         
            console.table(data);

            const now = new Date(Date.now());


            let hours = now.getHours();
            let minutes = now.getMinutes();

            if(hours < 10){
                hours = `0${hours}`;
            }

            if(minutes < 10){
                minutes = `0${minutes}`;
            }

            console.log(`${hours}:${minutes}`);

            const string = createReturnString(data);

            res.status(200).send(`${hours}:${minutes} ${string}`);
            resolve();

        }

    });


    


    
}