const Promise = require('promise');
const mysql = require('./database');

class CTF{

    constructor(data){

        this.data = data;
    }


    updatePlayerTotals(masterId, gametypeId, data){

        return new Promise((resolve, reject) =>{

            const query = `UPDATE nstats_player_totals SET
            flag_assist=flag_assist+?,
            flag_return=flag_return+?,
            flag_taken=flag_taken+?,
            flag_dropped=flag_dropped+?,
            flag_capture=flag_capture+?,
            flag_pickup=flag_pickup+?,
            flag_cover=flag_cover+?,
            flag_kill=flag_kill+?,
            flag_save=flag_save+?
            WHERE id IN(?,?)`;

            const vars = [
                data.assist,
                data.return,
                data.taken,
                data.dropped,
                data.capture,
                data.pickup,
                data.cover,
                data.kill,
                data.save,
                masterId, gametypeId
            ];

            mysql.query(query, vars, (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }
}


module.exports = CTF;