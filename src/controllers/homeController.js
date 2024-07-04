import connection from "../config/connectDB";
import jwt from 'jsonwebtoken'
import md5 from "md5";
import e from "express";
require('dotenv').config();

// const homePage = async(req, res) => {
//     const [settings] = await connection.query('SELECT `app` FROM admin');
//     let app = settings[0]?.app;

//     // Execute the SQL query to retrieve payment settings
//     const [rows] = await connection.query('SELECT * FROM BannerImages LIMIT 1');
//     // Extract the first row if it exists
//     const images = rows.length > 0 ? rows[0] : null;
//     return res.render("home/index.ejs", { app, images }); 
// }



const homePage = async (req, res) => {
    try {
        const [settings] = await connection.query('SELECT `app` FROM admin');
        let app = settings[0]?.app;

        let images = {};
        try {
            // Execute the SQL query to retrieve payment settings
            const [rows] = await connection.query('SELECT * FROM BannerImages LIMIT 1');
            // Extract the first row if it exists, otherwise set to an empty object
            images = rows.length > 0 ? rows[0] : {};
        } catch (error) {
            if (error.code === 'ER_NO_SUCH_TABLE') {
                console.warn("Table 'BannerImages' doesn't exist.");
                // You can set a default value or log the warning
            } else {
                throw error; // Re-throw other errors
            }
        }

        return res.render("home/index.ejs", { app, images });
    } catch (error) {
        console.error("Error fetching data: ", error);
        return res.status(500).send("Internal Server Error");
    }
};

const homePG = async(req, res) => {
    const [settings] = await connection.query('SELECT `app` FROM admin');
    let app = settings[0]?.app;

    // Execute the SQL query to retrieve payment settings
    const [rows] = await connection.query('SELECT * FROM BannerImages LIMIT 1');
    // Extract the first row if it exists
    const images = rows.length > 0 ? rows[0] : null;
    return res.render("home/home.ejs", { app, images }); 
}


const checkInPage = async(req, res) => {
    return res.render("checkIn/checkIn.ejs"); 
}

const checkDes = async(req, res) => {
    return res.render("checkIn/checkDes.ejs"); 
}

const checkRecord = async(req, res) => {
    return res.render("checkIn/checkRecord.ejs"); 
}

const addBank = async(req, res) => {
    return res.render("wallet/addbank.ejs"); 
}

// promotion
const promotionPage = async(req, res) => {
    return res.render("promotion/promotion.ejs"); 
}


// events
const eventsPage = async(req, res) => {
    return res.render("events/events.ejs"); 
}


// betHistory
const betHistoryPage = async(req, res) => {
    return res.render("bet/betHistory.ejs"); 
}


// REBATE RATIO
const rebateRatioPage = async(req, res) => {
    return res.render("bet/rebateRatio.ejs"); 
}

const promotionmyTeamPage = async(req, res) => {
    return res.render("promotion/myTeam.ejs"); 
}

const promotionDesPage = async(req, res) => {
    return res.render("promotion/promotionDes.ejs"); 
}

const tutorialPage = async(req, res) => {
    return res.render("promotion/tutorial.ejs"); 
}

const bonusRecordPage = async(req, res) => {
    return res.render("promotion/bonusrecord.ejs"); 
}

// wallet
const walletPage = async(req, res) => {
    return res.render("wallet/index.ejs"); 
}

const rechargePage = async (req, res) => {
    try {
        const [settings] = await connection.query("SELECT * FROM PaymentSettings LIMIT 1");

        if (!settings || settings.length === 0) {
            throw new Error("No settings found");
        }

        // Make the first object the settings object
        const settingsObject = settings[0];

        return res.render("wallet/recharge.ejs", { settings: settingsObject });
    } catch (error) {
        console.error("Error fetching settings:", error);
        return res.status(500).send("Error fetching settings");
    }
};

const rechargeGateway = async(req, res) => {
    return res.render("wallet/pay.ejs"); 
}
const rechargeGateway1 = async(req, res) => {
    return res.render("wallet/pay1.ejs"); 
}

const upiPayment = async(req, res) => {
    return res.render("wallet/upiPayment.ejs"); 
}


const wowPay = async (req, res) => {
    try {
        const { amount } = req.query;
        const [settings] = await connection.query("SELECT * FROM PaymentSettings LIMIT 1");

        if (!settings || settings.length === 0) {
            throw new Error("No settings found");
        }

        const settingsObject = settings[0];

        return res.render("wallet/wowPay.ejs", { settings: settingsObject, amount });
    } catch (error) {
        console.error("Error fetching settings:", error);
        return res.status(500).send("Error fetching settings");
    }
}

const manualUpi = async (req, res) => {
    try {
        const { amount } = req.query;
        const [settings] = await connection.query("SELECT * FROM PaymentSettings LIMIT 1");

        if (!settings || settings.length === 0) {
            throw new Error("No settings found");
        }

        const settingsObject = settings[0];

        return res.render("wallet/manualUpi.ejs", { settings: settingsObject, amount });
    } catch (error) {
        console.error("Error fetching settings:", error);
        return res.status(500).send("Error fetching settings");
    }
}

const usdtManual = async (req, res) => {
    try {
        const { amount } = req.query;
        const [settings] = await connection.query("SELECT * FROM PaymentSettings LIMIT 1");

        if (!settings || settings.length === 0) {
            throw new Error("No settings found");
        }

        const settingsObject = settings[0];

        return res.render("wallet/usdtManual.ejs", { settings: settingsObject, amount });
    } catch (error) {
        console.error("Error fetching settings:", error);
        return res.status(500).send("Error fetching settings");
    }
}


const rechargerecordPage = async(req, res) => {
    return res.render("wallet/rechargerecord.ejs"); 
}

const withdrawalPage = async(req, res) => {
    return res.render("wallet/withdrawal.ejs"); 
}

const withdrawalrecordPage = async(req, res) => {
    return res.render("wallet/withdrawalrecord.ejs"); 
}

// member page
const mianPage = async(req, res) => { 
    let auth = req.cookies.auth;
    const [user] = await connection.query('SELECT `level` FROM users WHERE `token` = ? ', [auth]);
    let level = user[0].level;
    return res.render("member/index.ejs", {level}); 
}
const aboutPage = async(req, res) => {
    return res.render("member/about/index.ejs"); 
}

const privacyPolicy = async(req, res) => {
    return res.render("member/about/privacyPolicy.ejs"); 
}

const newtutorial = async(req, res) => {
    return res.render("member/newtutorial.ejs"); 
}

const forgot = async(req, res) => {
    let auth = req.cookies.auth;
    const [user] = await connection.query('SELECT `time_otp` FROM users WHERE token = ? ', [auth]);
    let time = user[0].time_otp;
    return res.render("member/forgot.ejs", {time}); 
}

const subordinateData = async(req, res) => {
    let response = {
        message: "This section is under scheduled maintenance",
        status: false,
        timeStamp: new Date().toISOString(),
        data: [],
        totalRecharge: 0
    };

    try {
        let auth = req.cookies.auth;
        if (!auth) {
            return res.render("member/subordinateData.ejs", { data: response });
        }

        const [rows] = await connection.query("SELECT * FROM users WHERE `token` = ?", [auth]);

        if (!rows || rows.length === 0) {
            return res.render("member/subordinateData.ejs", { data: response });
        }

        const { id } = rows[0];
        let { dateFrom, dateTo } = req.body;

        const [user] = await connection.query("SELECT * FROM users WHERE id = ?", [id]);

        if (!user || user.length === 0) {
            return res.render("member/subordinateData.ejs", { data: response });
        }

        let userInfo = user[0];

        const [invitedUsers] = await connection.query("SELECT * FROM users WHERE referredBy_ID = ?", [userInfo.id]);

        if (!invitedUsers || invitedUsers.length === 0) {
            response.message = "No invites found";
            response.status = false;
            return res.render("member/subordinateData.ejs", { data: response });
        }

        const invitedUserIds = invitedUsers.map(user => user.id);

        const [transactions] = await connection.query(
            `SELECT * FROM recharge 
             WHERE date >= ? AND date <= ? AND user_id IN (?)`,
            [dateFrom, dateTo, invitedUserIds]
        );

        const totalRecharge = transactions.reduce((total, transaction) => total + transaction.money, 0);

        response.message = "Success";
        response.status = true;
        response.data = transactions;
        response.totalRecharge = totalRecharge;

    } catch (error) {
        console.error("Error:", error);
        response.message = "Internal server error.";
    }

    return res.render("member/subordinateData.ejs", { data: response });
};



const commissionDetails = async(req, res) => {
    let response = {
        message: "This section is under scheduled maintenance",
        status: false,
        timeStamp: new Date().toISOString(),
        data: [],
        totalRecharge: 0
    };

    try {
        let auth = req.cookies.auth;
        if (!auth) {
            return res.render("member/commissionDetails.ejs", { data: response });
        }

        const [rows] = await connection.query("SELECT * FROM users WHERE `token` = ?", [auth]);

        if (!rows || rows.length === 0) {
            return res.render("member/commissionDetails.ejs", { data: response });
        }

        const { id } = rows[0];
        let { dateFrom, dateTo } = req.body;

        const [user] = await connection.query("SELECT * FROM users WHERE id = ?", [id]);

        if (!user || user.length === 0) {
            return res.render("member/commissionDetails.ejs", { data: response });
        }

        let userInfo = user[0];

        const [invitedUsers] = await connection.query("SELECT * FROM users WHERE referredBy_ID = ?", [userInfo.id]);

        if (!invitedUsers || invitedUsers.length === 0) {
            response.message = "No invites found";
            response.status = false;
            return res.render("member/commissionDetails.ejs", { data: response });
        }

        const invitedUserIds = invitedUsers.map(user => user.id);

        const [transactions] = await connection.query(
            `SELECT * FROM recharge 
             WHERE date >= ? AND date <= ? AND user_id IN (?)`,
            [dateFrom, dateTo, invitedUserIds]
        );

        const totalRecharge = transactions.reduce((total, transaction) => total + transaction.money, 0);

        response.message = "Success";
        response.status = true;
        response.data = transactions;
        response.totalRecharge = totalRecharge;

    } catch (error) {
        console.error("Error:", error);
        response.message = "Internal server error.";
    }

    return res.render("member/commissionDetails.ejs", { data: response });
};

const myNetwork = async(req, res) => {
    let response = {
        message: "This section is under scheduled maintenance",
        status: false,
        timeStamp: new Date().toISOString(),
        data: [],
        totalRecharge: 0
    };

    try {
        let auth = req.cookies.auth;
        if (!auth) {
            return res.render("member/myNetwork.ejs", { data: response });
        }

        const [rows] = await connection.query("SELECT * FROM users WHERE `token` = ?", [auth]);

        if (!rows || rows.length === 0) {
            return res.render("member/myNetwork.ejs", { data: response });
        }

        const { id } = rows[0];
        let { dateFrom, dateTo } = req.body;

        const [user] = await connection.query("SELECT * FROM users WHERE id = ?", [id]);

        if (!user || user.length === 0) {
            return res.render("member/myNetwork.ejs", { data: response });
        }

        let userInfo = user[0];

        const [invitedUsers] = await connection.query("SELECT * FROM users WHERE referredBy_ID = ?", [userInfo.id]);

        if (!invitedUsers || invitedUsers.length === 0) {
            response.message = "No invites found";
            response.status = false;
            return res.render("member/myNetwork.ejs", { data: response });
        }

        const invitedUserIds = invitedUsers.map(user => user.id);

        const [transactions] = await connection.query(
            `SELECT * FROM recharge 
             WHERE date >= ? AND date <= ? AND user_id IN (?)`,
            [dateFrom, dateTo, invitedUserIds]
        );

        const totalRecharge = transactions.reduce((total, transaction) => total + transaction.money, 0);

        response.message = "Success";
        response.status = true;
        response.data = transactions;
        response.totalRecharge = totalRecharge;

    } catch (error) {
        console.error("Error:", error);
        response.message = "Internal server error.";
    }

    return res.render("member/myNetwork.ejs", { data: response });
};

const teamNetwork = async(req, res) => {
    let response = {
        message: "This section is under scheduled maintenance",
        status: false,
        timeStamp: new Date().toISOString(),
        data: [],
        totalRecharge: 0
    };

    try {
        let auth = req.cookies.auth;
        if (!auth) {
            return res.render("member/teamNetwork.ejs", { data: response });
        }

        const [rows] = await connection.query("SELECT * FROM users WHERE `token` = ?", [auth]);

        if (!rows || rows.length === 0) {
            return res.render("member/teamNetwork.ejs", { data: response });
        }

        const { id } = rows[0];
        let { dateFrom, dateTo } = req.body;

        const [user] = await connection.query("SELECT * FROM users WHERE id = ?", [id]);

        if (!user || user.length === 0) {
            return res.render("member/teamNetwork.ejs", { data: response });
        }

        let userInfo = user[0];

        const [invitedUsers] = await connection.query("SELECT * FROM users WHERE referredBy_ID = ?", [userInfo.id]);

        if (!invitedUsers || invitedUsers.length === 0) {
            response.message = "No invites found";
            response.status = false;
            return res.render("member/teamNetwork.ejs", { data: response });
        }

        const invitedUserIds = invitedUsers.map(user => user.id);

        const [transactions] = await connection.query(
            `SELECT * FROM recharge 
             WHERE date >= ? AND date <= ? AND user_id IN (?)`,
            [dateFrom, dateTo, invitedUserIds]
        );

        const totalRecharge = transactions.reduce((total, transaction) => total + transaction.money, 0);

        response.message = "Success";
        response.status = true;
        response.data = transactions;
        response.totalRecharge = totalRecharge;

    } catch (error) {
        console.error("Error:", error);
        response.message = "Internal server error.";
    }

    return res.render("member/teamNetwork.ejs", { data: response });
};


const rebateRatio = async(req, res) => {
    let response = {
        message: "This section is under scheduled maintenance",
        status: false,
        timeStamp: new Date().toISOString(),
        data: [],
        totalRecharge: 0
    };

    try {
        let auth = req.cookies.auth;
        if (!auth) {
            return res.render("member/rebateRatio.ejs", { data: response });
        }

        const [rows] = await connection.query("SELECT * FROM users WHERE `token` = ?", [auth]);

        if (!rows || rows.length === 0) {
            return res.render("member/rebateRatio.ejs", { data: response });
        }

        const { id } = rows[0];
        let { dateFrom, dateTo } = req.body;

        const [user] = await connection.query("SELECT * FROM users WHERE id = ?", [id]);

        if (!user || user.length === 0) {
            return res.render("member/rebateRatio.ejs", { data: response });
        }

        let userInfo = user[0];

        const [invitedUsers] = await connection.query("SELECT * FROM users WHERE referredBy_ID = ?", [userInfo.id]);

        if (!invitedUsers || invitedUsers.length === 0) {
            response.message = "No invites found";
            response.status = false;
            return res.render("member/rebateRatio.ejs", { data: response });
        }

        const invitedUserIds = invitedUsers.map(user => user.id);

        const [transactions] = await connection.query(
            `SELECT * FROM recharge 
             WHERE date >= ? AND date <= ? AND user_id IN (?)`,
            [dateFrom, dateTo, invitedUserIds]
        );

        const totalRecharge = transactions.reduce((total, transaction) => total + transaction.money, 0);

        response.message = "Success";
        response.status = true;
        response.data = transactions;
        response.totalRecharge = totalRecharge;

    } catch (error) {
        console.error("Error:", error);
        response.message = "Internal server error.";
    }

    return res.render("member/rebateRatio.ejs", { data: response });
};


const redenvelopes = async(req, res) => {
    return res.render("member/redenvelopes.ejs"); 
}

const riskAgreement = async(req, res) => {
    return res.render("member/about/riskAgreement.ejs"); 
}

const keFuMenu = async(req, res) => {
    let auth = req.cookies.auth;

    const [users] = await connection.query('SELECT `level`, `ctv` FROM users WHERE token = ?', [auth]);

    let telegram = '';
    if (users.length == 0) {
        let [settings] = await connection.query('SELECT `telegram`, `cskh` FROM admin');
        telegram = settings[0].telegram;
    } else {
        if (users[0].level != 0) {
            var [settings] = await connection.query('SELECT * FROM admin');
        } else {
            var [check] = await connection.query('SELECT `telegram` FROM point_list WHERE phone = ?', [users[0].ctv]);
            if (check.length == 0) {
                var [settings] = await connection.query('SELECT * FROM admin');
            } else {
                var [settings] = await connection.query('SELECT `telegram` FROM point_list WHERE phone = ?', [users[0].ctv]);
            }
        }
        telegram = settings[0].telegram;
    }
    
    return res.render("keFuMenu.ejs", {telegram}); 
}

const myProfilePage = async(req, res) => {
    return res.render("member/myProfile.ejs"); 
}

module.exports = {
    homePage,
    homePG,
    checkInPage,
    promotionPage,
    eventsPage,
    betHistoryPage,
    rebateRatioPage,
    walletPage,
    mianPage,
    myProfilePage,
    promotionmyTeamPage,
    promotionDesPage,
    tutorialPage,
    bonusRecordPage,
    keFuMenu,
    rechargePage,
    rechargeGateway,
    rechargeGateway1,
    rechargerecordPage,
    withdrawalPage,
    withdrawalrecordPage,
    aboutPage,
    privacyPolicy,
    riskAgreement,
    newtutorial,
    redenvelopes,
    forgot,
    subordinateData,
    commissionDetails,
    rebateRatio,
    myNetwork,
    teamNetwork,
    checkDes,
    checkRecord,
    addBank,
    usdtManual,
    manualUpi,
    wowPay,
    upiPayment
}