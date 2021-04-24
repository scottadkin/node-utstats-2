const mysql = require('./database');
const Promise = require('promise');
const Message = require('./message');

class Rankings{

    constructor(){


    }


    setRankingSettings(){

        return new Promise((resolve, reject) =>{

            const query = "SELECT name,value FROM nstats_ranking_values";

            mysql.query(query, (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){

                    const data = [];

                    for(let i = 0; i < result.length; i++){

                        data[result[i].name] = result[i].value;
                    }

                    this.settings = data;
                }

                resolve();
            });
        });
    }

    insertPlayerCurrent(player, gametype, playtime, ranking){

        return new Promise((resolve, reject) =>{

            const query = "INSERT INTO nstats_ranking_player_current VALUES(NULL,?,?,1,?,?,?)";

            mysql.query(query, [player,gametype,playtime,ranking,ranking], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }


    updatePlayerCurrent(player, gametype, playtime, newRanking){

        return new Promise((resolve, reject) =>{

            const query = `UPDATE nstats_ranking_player_current SET
            matches=matches+1, playtime=playtime+?,ranking_change=?-ranking,ranking=?
            WHERE gametype=? AND player_id=?`;

            mysql.query(query, [playtime, newRanking, newRanking, gametype, player], (err, result) =>{

                if(err) reject(err);

                if(result !== undefined){

                    resolve(result.affectedRows);
                }

                resolve(0);
            });
        });
    }

    insertPlayerHistory(player, gametype, ranking){

        return new Promise((resolve, reject) =>{

            const query = "INSERT INTO nstats_ranking_player_history VALUES(NULL,?,?,?)";

            mysql.query(query, [player, gametype, ranking], (err) =>{

                if(err) reject(err);

                resolve();
            });
        });
    }

    async update(players, gametype){

    
        try{

            const halfHour = 60 * 30;
            const hour = 60 * 60;
            const hour2 = hour * 2;
            const hour3 = hour * 3;


            if(this.settings === undefined){
                new Message(`Rankings.update() Settings are not set, can't updated rankings!`,"error");
                return;
            }

            const s = this.settings;

            let p = 0;
            let currentScore = 0;
            let currentPlaytime = 0;

            for(let i = 0; i < players.length; i++){

                p = players[i];
                currentScore = 0;
                currentPlaytime = 0;

                if(p.bDuplicate === undefined){

                    //general
                    currentScore += p.stats.frags * s.frags;
                    currentScore += p.stats.deaths * s.deaths;
                    currentScore += p.stats.suicides * s.suicides;
                    currentScore += p.stats.teamkills * s.team_kills;
                    
                    currentScore += p.stats.multis.double * s.multi_1;
                    currentScore += p.stats.multis.multi * s.multi_2;
                    currentScore += p.stats.multis.mega * s.multi_3;
                    currentScore += p.stats.multis.ultra * s.multi_4;
                    currentScore += p.stats.multis.monster * s.multi_5;
                    currentScore += p.stats.multis.ludicrous * s.multi_6;
                    currentScore += p.stats.multis.holyshit * s.multi_7;

                    currentScore += p.stats.sprees.spree * s.spree_1;
                    currentScore += p.stats.sprees.rampage * s.spree_2;
                    currentScore += p.stats.sprees.dominating * s.spree_3;
                    currentScore += p.stats.sprees.unstoppable * s.spree_4;
                    currentScore += p.stats.sprees.godlike * s.spree_5;
                    currentScore += p.stats.sprees.massacre * s.spree_6;
                    currentScore += p.stats.sprees.brutalizing * s.spree_7;

                    //ctf

                    currentScore += p.stats.ctf.assist * s.flag_assist;
                    currentScore += p.stats.ctf.return * s.flag_return;
                    currentScore += p.stats.ctf.taken * s.flag_taken;
                    currentScore += p.stats.ctf.dropped * s.flag_dropped;
                    currentScore += p.stats.ctf.capture * s.flag_capture;
                    currentScore += p.stats.ctf.pickup * s.flag_pickup;
                    currentScore += p.stats.ctf.cover * s.flag_cover;
                    currentScore += p.stats.ctf.seal * s.flag_seal;
                    currentScore += p.stats.ctf.coverFail * s.flag_cover_fail;
                    currentScore += p.stats.ctf.coverPass * s.flag_cover_pass;
                    currentScore += p.stats.ctf.selfCover * s.flag_self_cover;
                    currentScore += p.stats.ctf.selfCoverPass * s.flag_self_cover_pass;
                    currentScore += p.stats.ctf.selfCoverFail * s.flag_self_cover_fail;
                    currentScore += p.stats.ctf.multiCover * s.flag_multi_cover;
                    currentScore += p.stats.ctf.spreeCover * s.flag_spree_cover;
                    currentScore += p.stats.ctf.kill * s.flag_kill;
                    currentScore += p.stats.ctf.save * s.flag_save;

                    //dom

                    currentScore += p.stats.dom.caps += s.dom_caps;

                    //assault
                    currentScore += p.stats.assault.caps += s.assault_objectives;

                    currentScore = currentScore / (p.stats.time_on_server / 60);


                    if(p.stats.time_on_server < halfHour){

                        currentScore *= this.settings.sub_half_hour_multiplier;

                    }else if(p.stats.time_on_server < hour){

                        currentScore *= this.settings.sub_hour_multiplier;

                    }else if(p.stats.time_on_server < hour2){

                        currentScore *= this.settings.sub_2hour_multiplier;

                    }else if(p.stats.time_on_server < hour3){
                        
                        currentScore *= this.settings.sub_3hour_multiplier;
                    }


                    if(await this.updatePlayerCurrent(p.masterId, gametype, p.stats.time_on_server, currentScore) === 0){
                        await this.insertPlayerCurrent(p.masterId, gametype, p.stats.time_on_server, currentScore);
                    }

                    await this.insertPlayerHistory(p.masterId, gametype, currentScore);
                }
            }

           

        }catch(err){
            console.trace(err);
        }
       
    }
}


module.exports = Rankings;