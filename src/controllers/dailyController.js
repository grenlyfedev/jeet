import connection from "../config/connectDB";
import jwt from 'jsonwebtoken'
import md5 from "md5";
require('dotenv').config();

let timeNow = Date.now();

const dailyPage = async(req, res) => {
     return res.render("daily/statistical.ejs");
}

const listMeber = async(req, res) => {
     return res.render("daily/members.ejs");
}

const profileMember = async(req, res) => {
     return res.render("daily/profileMember.ejs");
}

const settingPage = async(req, res) => {
     return res.render("daily/settings.ejs");
}

const listRecharge = async(req, res) => {
     return res.render("daily/listRecharge.ejs");
}

const listWithdraw = async(req, res) => {
     return res.render("daily/listWithdraw.ejs");
}

const pageInfo = async(req, res) => {
     let phone = req.params.phone;
     return res.render("daily/profileMember.ejs", {phone});
}

const giftPage = async(req, res) => {
     let auth = req.cookies.auth;
     const [rows] = await connection.execute('SELECT `phone` FROM `users` WHERE `token` = ? AND veri = 1', [auth]);
     let money = 0;
     let money2 = 0;
     
     if (rows.length !== 0) {
         const [point_list] = await connection.execute('SELECT `money`, `money_user` FROM `point_list` WHERE `phone` = ?', [rows[0].phone]);
         
         if (point_list.length !== 0) {
             money = point_list[0].money;
             money2 = point_list[0].money_user;
         }
     }
     
     return res.render("daily/giftPage.ejs", {money, money2});
}

const support = async(req, res) => {
     return res.render("daily/support.ejs");
}

const settings = async(req, res) => {
     let auth = req.cookies.auth;
     let type = req.body.type;
     let value = req.body.value;

     const [rows] = await connection.execute('SELECT `phone` FROM `users` WHERE `token` = ? AND veri = 1', [auth]);
     if (rows.length == 0) {
         return res.status(200).json({
             message: 'Error',
             status: false,
         });
     }
     if (!type) {
        const [point_list] = await connection.execute('SELECT `telegram` FROM `point_list` WHERE phone = ?', [rows[0].phone]);
        const [settings] = await connection.execute('SELECT `telegram` FROM `admin`');
        let telegram = settings[0] ? settings[0].telegram : undefined;
        let telegram2 = point_list[0] ? point_list[0].telegram : undefined;
        
        if (telegram !== undefined && telegram2 !== undefined) {
            return res.status(200).json({
                message: 'Received success',
                status: true,
                telegram: telegram,
                telegram2: telegram2,
            });
        } else {
            return res.status(500).json({
                message: 'Error: Missing data',
                status: false,
            });
        }
     } else {
         await connection.execute('UPDATE `point_list` SET telegram = ? WHERE phone = ?', [value ,rows[0].phone]);
         return res.status(200).json({
             message: 'Fixed successfully',
             status: true,
         });
     }
}

// confirm admin
const middlewareDailyController = async(req, res, next) => {
     // confirm token
     const auth = req.cookies.auth;
     if (!auth) {
         return res.redirect("/login");
     }
     const [rows] = await connection.execute('SELECT `token`, `level`, `status` FROM `users` WHERE `token` = ? AND veri = 1', [auth]);
     if (!rows) {
         return res.redirect("/login");
     }
     try {
         if (auth == rows[0].token && rows[0].status == 1) {
             if (rows[0].level == 2) {
                 next();
             } else {
                 return res.redirect("/home");
             }
         } else {
             return res.redirect("/login");
         }
     } catch (error) {
         return res.redirect("/login");
     }
}

const statistical = async(req, res) => {
     const auth = req.cookies.auth;
    
     const [user] = await connection.query('SELECT * FROM users WHERE token = ? ', [auth]);

     let userInfo = user[0];
     // direct subordinate all
     const [f1s] = await connection.query('SELECT `phone`, `code`,`invite`, `time` FROM users WHERE `invite` = ?', [userInfo.code]);

     // today's direct subordinate
     let f1_today = 0;
     for (let i = 0; i < f1s.length; i++) {
         const f1_time = f1s[i].time; // Referral code f1
         let check = (timerJoin(f1_time) == timerJoin()) ? true : false;
         if(check) {
             f1_today += 1;
         }
     }

     // all subordinates today
     let f_all_today = 0;
     for (let i = 0; i < f1s.length; i++) {
         const f1_code = f1s[i].code; // Referral code f1
         const f1_time = f1s[i].time; // time f1
         let check_f1 = (timerJoin(f1_time) == timerJoin()) ? true : false;
         if(check_f1) f_all_today += 1;
         // total f1 invites today
         const [f2s] = await connection.query('SELECT `phone`, `code`,`invite`, `time` FROM users WHERE `invite` = ?', [f1_code]);
         for (let i = 0; i < f2s.length; i++) {
             const f2_code = f2s[i].code; // Referral code f2
             const f2_time = f2s[i].time; // time f2
             let check_f2 = (timerJoin(f2_time) == timerJoin()) ? true : false;
             if(check_f2) f_all_today += 1;
             // total f2 invites today
             const [f3s] = await connection.query('SELECT `phone`, `code`,`invite`, `time` FROM users WHERE `invite` = ?', [f2_code]);
             for (let i = 0; i < f3s.length; i++) {
                const f3_code = f3s[i].code; // Referral code f3
                const f3_time = f3s[i].time; // time f3
                let check_f3 = (timerJoin(f3_time) == timerJoin()) ? true : false;
                if(check_f3) f_all_today += 1;
                const [f4s] = await connection.query('SELECT `phone`, `code`,`invite`, `time` FROM users WHERE `invite` = ?', [f3_code]);
                // total f3 invites today
                for (let i = 0; i < f4s.length; i++) {
                    const f4_code = f4s[i].code; // Referral code f4
                    const f4_time = f4s[i].time; // time f4
                    let check_f4 = (timerJoin(f4_time) == timerJoin()) ? true : false;
                    if(check_f4) f_all_today += 1;
                    // total f3 invites today
                }
            }
        }
    }
   
    // Total f2
    let f2 = 0;
    for (let i = 0; i < f1s.length; i++) {
        const f1_code = f1s[i].code; // Referral code f1
        const [f2s] = await connection.query('SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ?', [f1_code]);
        f2 += f2s.length;
    }
   
    // Total f3
    let f3 = 0;
    for (let i = 0; i < f1s.length; i++) {
        const f1_code = f1s[i].code; // Referral code f1
        const [f2s] = await connection.query('SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ?', [f1_code]);
        for (let i = 0; i < f2s.length; i++) {
            const f2_code = f2s[i].code;
            const [f3s] = await connection.query('SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ?', [f2_code]);
            if(f3s.length > 0) f3 += f3s.length;
        }
    }
   
    // Total f4
    let f4 = 0;
    for (let i = 0; i < f1s.length; i++) {
        const f1_code = f1s[i].code; // Referral code f1
        const [f2s] = await connection.query('SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ?', [f1_code]);
        for (let i = 0; i < f2s.length; i++) {
            const f2_code = f2s[i].code;
            const [f3s] = await connection.query('SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ?', [f2_code]);
            for (let i = 0; i < f3s.length; i++) {
                const f3_code = f3s[i].code;
                const [f4s] = await connection.query('SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ?', [f3_code]);
                if(f4s.length > 0) f4 += f4s.length;
            }
        }
    }

    // const [recharge] = await connection.query('SELECT SUM(`money`) as total FROM recharge WHERE phone = ? AND status = 1 ', [phone]);
    // const [withdraw] = await connection.query('SELECT SUM(`money`) as total FROM withdraw WHERE phone = ? AND status = 1 ', [phone]);
    // const [bank_user] = await connection.query('SELECT * FROM user_bank WHERE phone = ? ', [phone]);
    return res.status(200).json({
        message: 'Success',
        status: true,
        data: user,
        f1: f1s.length,
        f2: f2,
        f3: f3,
        f4: f4,
    });
}

function formateT(params) {
    let result = (params < 10) ? "0" + params : params;
    return result;
}

function timerJoin(params = '') {
    let date = '';
    if (params) {
      date = new Date(Number(params));
    } else {
      date = Date.now();
      date = new Date(Number(date));
    }
    let years = formateT(date.getFullYear());
    let months = formateT(date.getMonth() + 1);
    let days = formateT(date.getDate());
    let weeks = formateT(date.getDay());
 
    let hours = formateT(date.getHours());
    let minutes = formateT(date.getMinutes());
    let seconds = formateT(date.getSeconds());
    // return years + '-' + months + '-' + days + ' ' + hours + '-' + minutes + '-' + seconds;
    return years + " - " + months + " - " + days;
  }


const userInfo = async(req, res) => {
    let auth = req.cookies.auth;
    let phone = req.params.phone;
    if (!phone) {
        return res.status(200).json({
            message: 'Failed',
            status: false,
            timeStamp: timeNow,
        });
    }

    const [user] = await connection.query('SELECT * FROM users WHERE phone = ? ', [phone]);
    const [auths] = await connection.query('SELECT * FROM users WHERE token = ? ', [auth]);

    if (user.length == 0 || auths.length == 0) {
        return res.status(200).json({
            message: 'Failed',
            status: false,
            timeStamp: timeNow,
        });
    }
    let { token, password, otp, level,...userInfo } = user[0];

    if (auths[0].phone != userInfo.ctv) {
        return res.status(200).json({
            message: 'Failed',
            status: false,
            timeStamp: timeNow,
        });
    }
    // direct subordinate all
    const [f1s] = await connection.query('SELECT `phone`, `code`,`invite`, `time` FROM users WHERE `invite` = ?', [userInfo.code]);

    // today's direct subordinate
    let f1_today = 0;
    for (let i = 0; i < f1s.length; i++) {
        constf1_time = f1s[i].time; // Referral code f1
        let check = (timerJoin(f1_time) == timerJoin()) ? true : false;
        if(check) {
            f1_today += 1;
        }
    }

    // all subordinates today
    let f_all_today = 0;
    for (let i = 0; i < f1s.length; i++) {
        const f1_code = f1s[i].code; // Referral code f1
        const f1_time = f1s[i].time; // time f1
        let check_f1 = (timerJoin(f1_time) == timerJoin()) ? true : false;
        if(check_f1) f_all_today += 1;
        // total f1 invites today
        const [f2s] = await connection.query('SELECT `phone`, `code`,`invite`, `time` FROM users WHERE `invite` = ?', [f1_code]);
        for (let i = 0; i < f2s.length; i++) {
            const f2_code = f2s[i].code; // Referral code f2
            const f2_time = f2s[i].time; // time f2
            let check_f2 = (timerJoin(f2_time) == timerJoin()) ? true : false;
            if(check_f2) f_all_today += 1;
            // total f2 invites today
            const [f3s] = await connection.query('SELECT `phone`, `code`,`invite`, `time` FROM users WHERE `invite` = ?', [f2_code]);
            for (let i = 0; i < f3s.length; i++) {
                const f3_code = f3s[i].code; // Referral code f3
                const f3_time = f3s[i].time; // time f3
                let check_f3 = (timerJoin(f3_time) == timerJoin()) ? true : false;
                if(check_f3) f_all_today += 1;
                const [f4s] = await connection.query('SELECT `phone`, `code`,`invite`, `time` FROM users WHERE `invite` = ?', [f3_code]);
                // total f3 invites today
                for (let i = 0; i < f4s.length; i++) {
                    const f4_code = f4s[i].code; // Referral code f4
                    const f4_time = f4s[i].time; // time f4
                    let check_f4 = (timerJoin(f4_time) == timerJoin()) ? true : false;
                    if(check_f4) f_all_today += 1;
                    // total f3 invites today
                }
            }
        }
    }
   
    // Total f2
    let f2 = 0;
    for (let i = 0; i < f1s.length; i++) {
        const f1_code = f1s[i].code; // Referral code f1
        const [f2s] = await connection.query('SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ?', [f1_code]);
        f2 += f2s.length;
    }
   
    // Total f3
    let f3 = 0;
    for (let i = 0; i < f1s.length; i++) {
        const f1_code = f1s[i].code; // Referral code f1
        const [f2s] = await connection.query('SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ?', [f1_code]);
        for (let i = 0; i < f2s.length; i++) {
            const f2_code = f2s[i].code;
            const [f3s] = await connection.query('SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ?', [f2_code]);
            if(f3s.length > 0) f3 += f3s.length;
        }
    }
   
    // Total f4
    let f4 = 0;
    for (let i = 0; i < f1s.length; i++) {
        const f1_code = f1s[i].code; // Referral code f1
        const [f2s] = await connection.query('SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ?', [f1_code]);
        for (let i = 0; i < f2s.length; i++) {
            const f2_code = f2s[i].code;
            const [f3s] = await connection.query('SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ?', [f2_code]);
            for (let i = 0; i < f3s.length; i++) {
                const f3_code = f3s[i].code;
                const [f4s] = await connection.query('SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ?', [f3_code]);
                if(f4s.length > 0) f4 += f4s.length;
            }
        }
    }

    const [recharge] = await connection.query('SELECT SUM(`money`) as total FROM recharge WHERE phone = ? AND status = 1 ', [phone]);
    const [withdraw] = await connection.query('SELECT SUM(`money`) as total FROM withdraw WHERE phone = ? AND status = 1 ', [phone]);
    const [bank_user] = await connection.query('SELECT * FROM user_bank WHERE phone = ? ', [phone]);
    return res.status(200).json({
        message: 'Success',
        status: true,
        data: userInfo,
        total_r: recharge,
        total_w: withdraw,
        f1: f1s.length,
        f2: f2,
        f3: f3,
        f4: f4,
        bank_user: bank_user,
    });
}

const infoCtv = async(req, res) => {
    const auth = req.cookies.auth;
    
    const [user] = await connection.query('SELECT * FROM users WHERE token = ? ', [auth]);

    if (user.length == 0) {
        return res.status(200).json({
            message: 'Phone Error',
            status: false,
        });
    }
    let userInfo = user[0];
    let phone = userInfo.phone;
    // direct subordinate all
    const [f1s] = await connection.query('SELECT `phone`, `code`,`invite`, `time` FROM users WHERE `invite` = ?', [userInfo.code]);

    // today's direct subordinate
    let f1_today = 0;
    for (let i = 0; i < f1s.length; i++) {
        const f1_time = f1s[i].time; // Referral code f1
        let check = (timerJoin(f1_time) == timerJoin()) ? true : false;
        if(check) {
            f1_today += 1;
        }
    }

    // all subordinates today
    let f_all_today = 0;
    for (let i = 0; i < f1s.length; i++) {
        const f1_code = f1s[i].code; // Referral code f1
        const f1_time = f1s[i].time; // time f1
        let check_f1 = (timerJoin(f1_time) == timerJoin()) ? true : false;
        if(check_f1) f_all_today += 1;
        // total f1 invites today
        const [f2s] = await connection.query('SELECT `phone`, `code`,`invite`, `time` FROM users WHERE `invite` = ?', [f1_code]);
        for (let i = 0; i < f2s.length; i++) {
            const f2_code = f2s[i].code; // Referral code f2
            const f2_time = f2s[i].time; // time f2
            let check_f2 = (timerJoin(f2_time) == timerJoin()) ? true : false;
            if(check_f2) f_all_today += 1;
            // total f2 invites today
            const [f3s] = await connection.query('SELECT `phone`, `code`,`invite`, `time` FROM users WHERE `invite` = ?', [f2_code]);
            for (let i = 0; i < f3s.length; i++) {
                const f3_code = f3s[i].code; // Referral code f3
                const f3_time = f3s[i].time; // time f3
                let check_f3 = (timerJoin(f3_time) == timerJoin()) ? true : false;
                if(check_f3) f_all_today += 1;
                const [f4s] = await connection.query('SELECT `phone`, `code`,`invite`, `time` FROM users WHERE `invite` = ?', [f3_code]);
                // total f3 invites today
                for (let i = 0; i < f4s.length; i++) {
                    const f4_code = f4s[i].code; // Referral code f4
                    const f4_time = f4s[i].time; // time f4
                    let check_f4 = (timerJoin(f4_time) == timerJoin()) ? true : false;
                    if(check_f4) f_all_today += 1;
                    // total f3 invites today
                }
            }
        }
    }
   
    // Total f2
    let f2 = 0;
    for (let i = 0; i < f1s.length; i++) {
        const f1_code = f1s[i].code; // Referral code f1
        const [f2s] = await connection.query('SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ?', [f1_code]);
        f2 += f2s.length;
    }
   
    // Total f3
    let f3 = 0;
    for (let i = 0; i < f1s.length; i++) {
        const f1_code = f1s[i].code; // Referral code f1
        const [f2s] = await connection.query('SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ?', [f1_code]);
        for (let i = 0; i < f2s.length; i++) {
            const f2_code = f2s[i].code;
            const [f3s] = await connection.query('SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ?', [f2_code]);
            if(f3s.length > 0) f3 += f3s.length;
        }
    }
   
    // Total f4
    let f4 = 0;
    for (let i = 0; i < f1s.length; i++) {
        const f1_code = f1s[i].code; // Referral code f1
        const [f2s] = await connection.query('SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ?', [f1_code]);
        for (let i = 0; i < f2s.length; i++) {
            const f2_code = f2s[i].code;
            const [f3s] = await connection.query('SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ?', [f2_code]);
            for (let i = 0; i < f3s.length; i++) {
                const f3_code = f3s[i].code;
                const [f4s] = await connection.query('SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ?', [f3_code]);
                if(f4s.length > 0) f4 += f4s.length;
            }
        }
    }

    const [list_mem] = await connection.query('SELECT * FROM users WHERE ctv = ? AND status = 1 AND veri = 1 ', [phone]);
    const [list_mem_baned] = await connection.query('SELECT * FROM users WHERE ctv = ? AND status = 2 AND veri = 1 ', [phone]);
    let total_recharge = 0;
    let total_withdraw = 0;
    for (let i = 0; i < list_mem.length; i++) {
        let phone = list_mem[i].phone;
        const [recharge] = await connection.query('SELECT SUM(money) as money FROM recharge WHERE phone = ? AND status = 1 ', [phone]);
        const [withdraw] = await connection.query('SELECT SUM(money) as money FROM withdraw WHERE phone = ? AND status = 1 ', [phone]);
        if (recharge[0].money) {
            total_recharge += Number(recharge[0].money);
        }
        if (withdraw[0].money) {
            total_withdraw += Number(withdraw[0].money);
        }
    }

    let total_recharge_today = 0;
    let total_withdraw_today = 0;
    for (let i = 0; i < list_mem.length; i++) {
        let phone = list_mem[i].phone;
        const [recharge_today] = await connection.query('SELECT `money`, `time` FROM recharge WHERE phone = ? AND status = 1 ', [phone]);
        const [withdraw_today] = await connection.query('SELECT `money`, `time` FROM withdraw WHERE phone = ? AND status = 1 ', [phone]);
        for (let i = 0; i < recharge_today.length; i++) {
            let today = timerJoin();
            let time= timerJoin(recharge_today[i].time);
            if (time == today) {
                total_recharge_today += recharge_today[i].money;
            }
        }
        for (let i = 0; i < withdraw_today.length; i++) {
            let today = timerJoin();
            let time = timerJoin(withdraw_today[i].time);
            if (time == today) {
                total_withdraw_today += withdraw_today[i].money;
            }
        }
    }

    let win = 0;
    let loss = 0;
    for (let i = 0; i < list_mem.length; i++) {
        let phone = list_mem[i].phone;
        const [wins] = await connection.query('SELECT `money`, `time` FROM minutes_1 WHERE phone = ? AND status = 1 ', [phone]);
        const [losses] = await connection.query('SELECT `money`, `time` FROM minutes_1 WHERE phone = ? AND status = 2 ', [phone]);
        for (let i = 0; i < wins.length; i++) {
            let today = timerJoin();
            let time = timerJoin(wins[i].time);
            if (time == today) {
                win += wins[i].money;
            }
        }
        for (let i = 0; i < losses.length; i++) {
            let today = timerJoin();
            let time = timerJoin(losses[i].time);
            if (time == today) {
                loss += losses[i].money;
            }
        }
    }
    let list_mems = [];
    const [list_mem_today] = await connection.query('SELECT * FROM users WHERE ctv = ? AND status = 1 AND veri = 1 ', [phone]);
    for (let i = 0; i < list_mem_today.length; i++) {
        let today = timerJoin();
        let time = timerJoin(list_mem_today[i].time);
        if (time == today) {
            const [phone_invites] = await connection.query('SELECT `phone` FROM users WHERE code = ? ', [list_mem_today[i].invite]);
            let phone_invite = phone_invites[0].phone;
            let data = {
                ...list_mem_today[i],
                phone_invite: phone_invite,
            };
            list_mems.push(data);
        }
    }

    const [point_list] = await connection.query('SELECT * FROM point_list WHERE phone = ? ', [phone]);
    let moneyCTV = point_list[0].money;

    let list_recharge_news = [];
    let list_withdraw_news = [];
    for (let i = 0; i < list_mem.length; i++) {
        let phone = list_mem[i].phone;
        const [recharge_today] = await connection.query('SELECT `id`, `status`, `type`, `phone`, `money`, `time` FROM recharge WHERE phone = ? AND status = 1 ', [phone] );
        const [withdraw_today] = await connection.query('SELECT `id`, `status`,`phone`, `money`, `time` FROM withdraw WHERE phone = ? AND status = 1 ', [phone]);
        for (let i = 0; i < recharge_today.length; i++) {
            let today = timerJoin();
            let time = timerJoin(recharge_today[i].time);
            if (time == today) {
                list_recharge_news.push(recharge_today[i]);
            }
        }
        for (let i = 0; i < withdraw_today.length; i++) {
            let today = timerJoin();
            let time = timerJoin(withdraw_today[i].time);
            if (time == today) {
                list_withdraw_news.push(withdraw_today[i]);
            }
        }
    }

    const [redenvelopes_used] = await connection.query('SELECT * FROM redenvelopes_used WHERE phone = ? ', [phone]);
    let redenvelopes_used_today = [];
    for (let i = 0; i < redenvelopes_used.length; i++) {
        let today = timerJoin();
        let time = timerJoin(redenvelopes_used[i].time);
        if (time == today) {
            redenvelopes_used_today.push(redenvelopes_used[i]);
        }
    }

    const [financial_details] = await connection.query('SELECT * FROM financial_details WHERE phone = ? ', [phone]);
    let financial_details_today = [];
    for (let i = 0; i < financial_details.length; i++) {
        let today = timerJoin();
        let time = timerJoin(financial_details[i].time);
        if (time == today) {
            financial_details_today.push(financial_details[i]);
        }
    }

    return res.status(200).json({
        message: 'Success',
        status: true,
        data: user,
        f1: f1s.length,
        f2: f2,
        f3: f3,
        f4: f4,
        list_mems: list_mems,
        total_recharge: total_recharge,
        total_withdraw: total_withdraw,
        total_recharge_today: total_recharge_today,
        total_withdraw_today: total_withdraw_today,
        list_mem_baned: list_mem_baned.length,
        win: win,
        loss: loss,
        list_recharge_news: list_recharge_news,
        list_withdraw_news: list_withdraw_news,
        moneyCTV: moneyCTV,
        redenvelopes_used: redenvelopes_used_today,
        financial_details_today: financial_details_today,
    });
}

const infoCtv2 = async(req, res) => {
    const auth = req.cookies.auth;
    const timeDate = req.body.timeDate;
    
    function timerJoin(params = '') {
        let date = '';
        if (params) {
          date = new Date(Number(params));
        } else {
          date = Date.now();date = new Date(Number(date));
        }
        let years = formateT(date.getFullYear());
        let months = formateT(date.getMonth() + 1);
        let days = formateT(date.getDate());
        let weeks = formateT(date.getDay());
     
        let hours = formateT(date.getHours());
        let minutes = formateT(date.getMinutes());
        let seconds = formateT(date.getSeconds());
        // return years + '-' + months + '-' + days + ' ' + hours + '-' + minutes + '-' + seconds;
        return years + "-" + months + "-" + days;
    }
   
    const [user] = await connection.query('SELECT * FROM users WHERE token = ? ', [auth]);

    if (user.length == 0) {
        return res.status(200).json({
            message: 'Phone Error',
            status: false,
        });
    }
    let userInfo = user[0];

    let phone = userInfo.phone;
    const [list_mem] = await connection.query('SELECT * FROM users WHERE ctv = ? AND status = 1 AND veri = 1 ', [phone]);

    let list_mems = [];
    const [list_mem_today] = await connection.query('SELECT * FROM users WHERE ctv = ? AND status = 1 AND veri = 1 ', [phone]);
    for (let i = 0; i < list_mem_today.length; i++) {
        let today = timeDate;
        let time = timerJoin(list_mem_today[i].time);
        if (time == today) {
            const [phone_invites] = await connection.query('SELECT `phone` FROM users WHERE code = ? ', [list_mem_today[i].invite]);
            let phone_invite = phone_invites[0].phone;
            let data = {
                ...list_mem_today[i],
                phone_invite: phone_invite,
            };
            list_mems.push(data);
        }
    }

    let list_recharge_news = [];
    let list_withdraw_news = [];
    for (let i = 0; i < list_mem.length; i++) {
        let phone = list_mem[i].phone;
        const [recharge_today] = await connection.query('SELECT `id`, `status`, `type`, `phone`, `money`, `time` FROM recharge WHERE phone = ? AND status = 1 ', [phone] );
        const [withdraw_today] = await connection.query('SELECT `id`, `status`,`phone`, `money`, `time` FROM withdraw WHERE phone = ? AND status = 1 ', [phone]);
        for (let i = 0; i < recharge_today.length; i++) {
            let today = timeDate;
            let time = timerJoin(recharge_today[i].time);
            if (time == today) {
                list_recharge_news.push(recharge_today[i]);
            }
        }
        for (let i = 0; i < withdraw_today.length; i++) {
            let today = timeDate;
            let time = timerJoin(withdraw_today[i].time);
            if (time == today) {
                list_withdraw_news.push(withdraw_today[i]);
            }
        }
    }

    const [redenvelopes_used] = await connection.query('SELECT * FROM redenvelopes_used WHERE phone = ? ', [phone]);
    let redenvelopes_used_today = [];
    for (let i = 0; i < redenvelopes_used.length; i++) {
        let today = timeDate;
        let time = timerJoin(redenvelopes_used[i].time);
        if (time == today) {
            redenvelopes_used_today.push(redenvelopes_used[i]);
        }
    }
    const [financial_details] = await connection.query('SELECT * FROM financial_details WHERE phone = ? ', [phone]);
    let financial_details_today = [];
    for (let i = 0; i < financial_details.length; i++) {
        let today = timeDate;
        let time = timerJoin(financial_details[i].time);
        if (time == today) {
            financial_details_today.push(financial_details[i]);
        }
    }

    return res.status(200).json({
        message: 'Success',
        status: true,
        data: user,
        list_mems: list_mems,
        list_recharge_news: list_recharge_news,
        list_withdraw_news: list_withdraw_news,
        redenvelopes_used: redenvelopes_used_today,
        financial_details_today: financial_details_today,
    });
}


const createBonus = async(req, res) => {
    const randomString = (length) => {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() *
                charactersLength));
        }
        return result;
    }
    function timerJoin(params = '') {
        let date = '';
        if (params) {
          date = new Date(Number(params));
        } else {
          date = Date.now();
          date = new Date(Number(date));
        }
        let years = formateT(date.getFullYear());
        let months = formateT(date.getMonth() + 1);
        let days = formateT(date.getDate());
        return years + "" + months + "" + days;
    }
    const d = new Date();
    const time = d.getTime();
    let auth = req.cookies.auth;
    let money = req.body.money;


    if (!money || !auth) {
        return res.status(200).json({
            message: 'Failed',
            status: false,
            timeStamp: timeNow,
        });
    }
    const [user] = await connection.query('SELECT * FROM users WHERE token = ? ', [auth]);

    if (user.length == 0) {
        return res.status(200).json({
            message: 'Failed',
            status: false,
            timeStamp: timeNow,
        });
    }
    let userInfo = user[0];
    const [point_list] = await connection.query('SELECT * FROM point_list WHERE phone = ? ', [userInfo.phone]);
    if (point_list.length == 0) {
        return res.status(200).json({
            message: 'Failed',
            status: false,
            timeStamp: timeNow,
        });
    }
    let ctv = point_list[0];

    if (ctv.money - money >= 0) {
        let id_redenvelops = String(timerJoin()) + randomString(16);
        await connection.execute('UPDATE `point_list` SET money = money - ? WHERE phone = ?', [money ,ctv.phone]);
        let sql = `INSERT INTO redenvelopes SET id_redenvelope = ?, phone = ?, money = ?, used = ?, amount = ?, status = ?, time = ?`;
        await connection.query(sql, [id_redenvelops, userInfo.phone, money, 1, 1, 0, time]);
        const [point_list] = await connection.query('SELECT `money` FROM point_list WHERE phone = ? ', [userInfo.phone]);
        return res.status(200).json({
            message: 'Successful gift creation',
            status: true,
            id: id_redenvelops,
            money: point_list[0].money,
        });
    } else {
        return res.status(200).json({
            message: 'Balance is not enough to create gift',
            status: false,
        });
    }
}

const listRedenvelops = async(req, res) => {
    let auth = req.cookies.auth;
    const [user] = await connection.query('SELECT * FROM users WHERE token = ? ', [auth]);

    if (user.length == 0) {
        return res.status(200).json({
            message: 'Failed',
            status: false,
            timeStamp: timeNow,
        });
    }
    let userInfo = user[0];
    let [redenvelopes] = await connection.query('SELECT * FROM redenvelopes WHERE phone = ? ORDER BY id DESC', [userInfo.phone]);
    return res.status(200).json({
        message: 'Change was successful',
        status: true,
        redenvelope: redenvelopes,
    });
}

const listMember = async(req, res) => {
    let auth = req.cookies.auth;
    let {pageno, limit } = req.body;

    let [checkInfo] = await connection.execute('SELECT * FROM users WHERE token = ?', [auth]);

    if(checkInfo.length == 0) {
        return res.status(200).json({
            code: 0,
            msgid: "No more data",
            data: {
                gameslist: [],
            },
            status: false
        });
    }
    let userInfo = checkInfo[0];

    if (!pageno || !limit) {
        return res.status(200).json({
            code: 0,
            msgid: "No more data",
            data: {
                gameslist: [],
            },
            status: false
        });
    }

    if (pageno < 0 || limit < 0) {
        return res.status(200).json({
            code: 0,
            msgid: "No more data",
            data: {
                gameslist: [],
            },
            status: false
        });
    }
    const [users] = await connection.query(`SELECT id_user, phone, money, total_money, status, time FROM users WHERE veri = 1 AND level = 0 AND ctv = ? ORDER BY id DESC LIMIT ${pageno}, ${limit } `, [userInfo.phone]);
    const [total_users] = await connection.query(`SELECT * FROM users WHERE veri = 1 AND level = 0 AND ctv = ?`, [userInfo.phone]);
    return res.status(200).json({
        message: 'Success',
        status: true,
        data: users,
        page_total: Math.ceil(total_users.length / limit)
    });
}

const listRechargeP = async(req, res) => {
    let auth = req.cookies.auth;
    const [user] = await connection.query('SELECT * FROM users WHERE token = ? ', [auth]);

    if (user.length == 0) {
        return res.status(200).json({
            message: 'Failed',
            status: false,
            timeStamp: timeNow,
        });
    }
    let userInfo = user[0];

    const [list_mem] = await connection.query('SELECT * FROM users WHERE ctv = ? AND status = 1 AND veri = 1 ', [userInfo.phone]);
    let list_recharge_news = [];
    for (let i = 0; i < list_mem.length; i++) {
        let phone = list_mem[i].phone;
        const [recharge_today] = await connection.query('SELECT * FROM recharge WHERE phone = ? ORDER BY id DESC LIMIT 100', [phone]);
        for (let i = 0; i < recharge_today.length; i++) {
            list_recharge_news.push(recharge_today[i]);
        }
    }
    return res.status(200).json({
        message: 'Failed',
        status: true,
        list_recharge_news: list_recharge_news,
        timeStamp: timeNow,
    });
}

const listWithdrawP = async(req, res) => {
    let auth = req.cookies.auth;
    const [user] = await connection.query('SELECT * FROM users WHERE token = ? ', [auth]);

    if (user.length == 0) {
        return res.status(200).json({
            message: 'Failed',
            status: false,
            timeStamp: timeNow,
        });
    }
    let userInfo = user[0];

    const [list_mem] = await connection.query('SELECT * FROM users WHERE ctv = ? AND status = 1 AND veri = 1 ', [userInfo.phone]);
    let list_withdraw_news = [];
    for (let i = 0; i < list_mem.length; i++) {
        let phone = list_mem[i].phone;
        const [withdraw_today] = await connection.query('SELECT * FROM withdraw WHERE phone = ? ORDER BY id DESC LIMIT 100', [phone]);
        for (let i = 0; i < withdraw_today.length; i++) {
            list_withdraw_news.push(withdraw_today[i]);
        }
    }
    return res.status(200).json({
        message: 'Failed',
        status: true,
        list_withdraw_news: list_withdraw_news,
        timeStamp: timeNow,
    });
}

const listRechargeMem = async(req, res) => {
    let auth = req.cookies.auth;
    let phone = req.params.phone;
    let {pageno, limit } = req.body;

    if (!pageno || !limit) {
        return res.status(200).json({
            code: 0,
            msgid: "No more data",
            data: {
                gameslist: [],
            },
            status: false
        });
    }

    if (pageno < 0 || limit < 0) {
        return res.status(200).json({
            code: 0,
            msgid: "No more data",
            data: {
                gameslist: [],
            },
            status: false
        });
    }

    if (!phone) {
        return res.status(200).json({
            message: 'Failed',
            status: false,
            timeStamp: timeNow,
        });
    }

    const [user] = await connection.query('SELECT * FROM users WHERE phone = ? ', [phone]);
    const [auths] = await connection.query('SELECT * FROM users WHERE token = ? ', [auth]);

    if (user.length == 0 || auths.length == 0) {
        return res.status(200).json({
            message: 'Failed',
            status: false,
            timeStamp: timeNow,
        });
    }
    let { token, password, otp, level,...userInfo } = user[0];

    if (auths[0].phone != userInfo.ctv) {
        return res.status(200).json({
            message: 'Failed',
            status: false,
            timeStamp: timeNow,
        });
    }

    const [recharge] = await connection.query(`SELECT * FROM recharge WHERE phone = ?ORDER BY id DESC LIMIT ${pageno}, ${limit} `, [phone]);
    const [total_users] = await connection.query(`SELECT * FROM recharge WHERE phone = ?`, [phone]);
    return res.status(200).json({
        message: 'Success',
        status: true,
        data: recharge,
        page_total: Math.ceil(total_users.length / limit)
    });
}

const listWithdrawMem = async(req, res) => {
    let auth = req.cookies.auth;
    let phone = req.params.phone;
    let {pageno, limit } = req.body;

    if (!pageno || !limit) {
        return res.status(200).json({
            code: 0,
            msgid: "No more data",
            data: {
                gameslist: [],
            },
            status: false
        });
    }

    if (pageno < 0 || limit < 0) {
        return res.status(200).json({
            code: 0,
            msgid: "No more data",
            data: {
                gameslist: [],
            },
            status: false
        });
    }

    if (!phone) {
        return res.status(200).json({
            message: 'Failed',
            status: false,
            timeStamp: timeNow,
        });
    }

    const [user] = await connection.query('SELECT * FROM users WHERE phone = ? ', [phone]);
    const [auths] = await connection.query('SELECT * FROM users WHERE token = ? ', [auth]);

    if (user.length == 0 || auths.length == 0) {
        return res.status(200).json({
            message: 'Failed',
            status: false,
            timeStamp: timeNow,
        });
    }
    let { token, password, otp, level,...userInfo } = user[0];

    if (auths[0].phone != userInfo.ctv) {
        return res.status(200).json({
            message: 'Failed',
            status: false,
            timeStamp: timeNow,
        });
    }

    const [withdraw] = await connection.query(`SELECT * FROM withdraw WHERE phone = ? ORDER BY id DESC LIMIT ${pageno}, ${limit} `, [phone]);
    const [total_users] = await connection.query(`SELECT * FROM withdraw WHERE phone = ?`, [phone]);
    return res.status(200).json({
        message: 'Success',
        status: true,
        data: withdraw,
        page_total: Math.ceil(total_users.length / limit)
    });
}

const listRedenvelope = async(req, res) => {
    let auth = req.cookies.auth;
    let phone = req.params.phone;
    let {pageno, limit } = req.body;

    if (!pageno || !limit) {
        return res.status(200).json({
            code: 0,
            msgid: "No more data",
            data: {
                gameslist: [],
            },
            status: false
        });
    }

    if (pageno < 0 || limit < 0) {
        return res.status(200).json({
            code: 0,
            msgid: "No more data",
            data: {gameslist: [],
            },
            status: false
        });
    }

    if (!phone) {
        return res.status(200).json({
            message: 'Failed',
            status: false,
            timeStamp: timeNow,
        });
    }

    const [user] = await connection.query('SELECT * FROM users WHERE phone = ? ', [phone]);
    const [auths] = await connection.query('SELECT * FROM users WHERE token = ? ', [auth]);

    if (user.length == 0 || auths.length == 0) {
        return res.status(200).json({
            message: 'Failed',
            status: false,
            timeStamp: timeNow,
        });
    }
    let { token, password, otp, level,...userInfo } = user[0];

    if (auths[0].phone != userInfo.ctv) {
        return res.status(200).json({
            message: 'Failed',
            status: false,
            timeStamp: timeNow,
        });
    }

    const [redenvelopes_used] = await connection.query(`SELECT * FROM redenvelopes_used WHERE phone_used = ? ORDER BY id DESC LIMIT ${pageno}, ${limit} `, [phone]);
    const [total_users] = await connection.query(`SELECT * FROM redenvelopes_used WHERE phone_used = ?`, [phone]);
    return res.status(200).json({
        message: 'Success',
        status: true,
        datas: redenvelopes_used,
        page_total: Math.ceil(total_users.length / limit)
    });
}

const listBet = async(req, res) => {
    let auth = req.cookies.auth;
    let phone = req.params.phone;
    let {pageno, limit } = req.body;

    if (!pageno || !limit) {
        return res.status(200).json({
            code: 0,
            msgid: "No more data",
            data: {
                gameslist: [],
            },
            status: false
        });
    }

    if (pageno < 0 || limit < 0) {
        return res.status(200).json({
            code: 0,
            msgid: "No more data",
            data: {
                gameslist: [],
            },
            status: false
        });
    }

    if (!phone) {
        return res.status(200).json({
            message: 'Failed',
            status: false,
            timeStamp: timeNow,
        });
    }

    const [user] = await connection.query('SELECT * FROM users WHERE phone = ? ', [phone]);
    const [auths] = await connection.query('SELECT * FROM users WHERE token = ? ', [auth]);

    if (user.length == 0 || auths.length == 0) {
        return res.status(200).json({
            message: 'Failed',
            status: false,
            timeStamp: timeNow,
        });
    }
    let { token, password, otp, level,...userInfo } = user[0];

    if (auths[0].phone != userInfo.ctv) {
        return res.status(200).json({
            message: 'Failed',
            status: false,
            timeStamp: timeNow,
        });
    }

    const [listBet] = await connection.query(`SELECT * FROM minutes_1 WHERE phone = ? AND status != 0 ORDER BY id DESC LIMIT ${pageno}, ${limit} `, [phone]);
    const [total_users] = await connection.query(`SELECT * FROM minutes_1 WHERE phone = ? AND status != 0`, [phone]);
    return res.status(200).json({
        message: 'Success',
        status: true,
        datas: listBet,
        page_total: Math.ceil(total_users.length / limit)
    });
}

const buffMoney = async(req, res) => {
    let auth = req.cookies.auth;
    let phone = req.body.username;
    let select = req.body.select;
    let money = req.body.money;

    if (!phone || !select || !money) {
        return res.status(200).json({
            message: 'Fail',
            status: false,
        });
    }

    const [users] = await connection.query('SELECT * FROM users WHERE phone = ? ', [phone]);
    const [auths] = await connection.query('SELECT * FROM users WHERE token = ? ', [auth]);

    if (users.length == 0) {
        return res.status(200).json({
            message: 'Account does not exist',
            status: false,
        });
    }
    let userInfo = users[0];
    let authInfo = auths[0];

    const [point_list] = await connection.query('SELECT `money_user` FROM point_list WHERE phone = ? ', [authInfo.phone]);

    let check = point_list[0].money_user;

    if (select == '1') {
        if (check - money >= 0) {
            const d = new Date();
            const time = d.getTime();
            await connection.query('UPDATE users SET money = money + ? WHERE phone = ? ', [money, userInfo.phone]);
            await connection.query('UPDATE point_list SET money_user = money_user - ? WHERE phone = ? ', [money, authInfo.phone]);
            let sql = 'INSERT INTO financial_details SET phone = ?, phone_used = ?, money = ?, type = ?, time = ?';
            await connection.query(sql, [authInfo.phone, userInfo.phone, money, '1', time]);
       
            const [moneyN] = await connection.query('SELECT `money_user` FROM point_list WHERE phone = ? ', [authInfo.phone]);
            return res.status(200).json({
                message: 'Success',
                status: true,
                money: moneyN[0].money_user,});
            } else {
                return res.status(200).json({
                    message: 'Balance not enough',
                    status: false,
                });
            }
        } else {
            const d = new Date();
            const time = d.getTime();
            await connection.query('UPDATE users SET money = money - ? WHERE phone = ? ', [money, userInfo.phone]);
            await connection.query('UPDATE point_list SET money = money + ? WHERE phone = ? ', [money, authInfo.phone]);
            let sql = 'INSERT INTO financial_details SET phone = ?, phone_used = ?, money = ?, type = ?, time = ?';
            await connection.query(sql, [authInfo.phone, userInfo.phone, money, '2', time]);
            return res.status(200).json({
                message: 'Success',
                status: true,
            });
        }
   }
     
   module.exports = {
        buffMoney,
        dailyPage,
        middlewareDailyController,
        userInfo,
        statistical,
        listMeber,
        profileMember,
        infoCtv,
        infoCtv2,
        settingPage,
        giftPage,
        support,
        settings,
        createBonus,
        listRedenvelops,
        listMember,
        listRecharge,
        listWithdraw,
        listRechargeP,
        listWithdrawP,
        pageInfo,
        listRechargeMem,
        listWithdrawMem,
        listRedenvelope,
        listBet
   }