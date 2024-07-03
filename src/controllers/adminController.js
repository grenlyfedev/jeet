import connection from "../config/connectDB";
import jwt from "jsonwebtoken";
import prisma from "../../prisma/prisma";
const io = require("socket.io-client");

import md5 from "md5";
const multer = require('multer');
const fs = require('fs');
const path = require('path');
require("dotenv").config();

let timeNow = Date.now();


// Set up multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`);
  }
});

// Initialize multer upload middleware with file size limit
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50 MB limit
  }
});

const dashboardData = async (req, res) => {
  try {
    let auth = req.cookies.auth;


    const [rows] = await connection.query(
      "SELECT * FROM users WHERE `token` = ?",
      [auth]
    );

    if (rows.length > 0) {
      // Fetch the required data from the database
      const [totalUsers] = await connection.query("SELECT COUNT(*) AS totalUsers FROM users");
      const [totalUnverifiedUsers] = await connection.query("SELECT COUNT(*) AS totalUnverifiedUsers FROM users where veri = 0");

      const [totalActiveUsers] = await connection.query("SELECT COUNT(*) AS totalActiveUsers FROM users WHERE status = 'active'");
      const [totalPendingFundRequests] = await connection.query("SELECT COUNT(*) AS totalPendingFundRequests FROM fund_requests WHERE status = 'pending'");
      const [todaysFundRequests] = await connection.query("SELECT COUNT(*) AS todaysFundRequests FROM fund_requests WHERE DATE(request_date) = CURDATE()");
      const [totalPendingWithdrawalRequests] = await connection.query("SELECT COUNT(*) AS totalPendingWithdrawalRequests FROM withdrawal_requests WHERE status = 'pending'");
      const [todaysWithdrawals] = await connection.query("SELECT COUNT(*) AS todaysWithdrawals FROM withdrawals WHERE DATE(date) = CURDATE()");
      const [totalPendingWithdrawalAmount] = await connection.query("SELECT COALESCE(SUM(amount), 0) AS totalPendingWithdrawalAmount FROM withdrawal_requests WHERE status = 'pending'");
      const [total5dBetAmount] = await connection.query("SELECT COALESCE(SUM(amount), 0) AS total5dBetAmount FROM bets WHERE game = '5d'");
      const [totalK3BetAmount] = await connection.query("SELECT COALESCE(SUM(amount), 0) AS totalK3BetAmount FROM bets WHERE game = 'k3'");
      const [totalWingoBetAmount] = await connection.query("SELECT COALESCE(SUM(amount), 0) AS totalWingoBetAmount FROM bets WHERE game = 'wingo'");
      const [totalAviatorBetAmount] = await connection.query("SELECT COALESCE(SUM(amount), 0) AS totalAviatorBetAmount FROM bets WHERE game = 'aviator'");

      const [CumulativeWithdrawals] = await connection.query("SELECT COALESCE(SUM(amount), 0) AS CumulativeWithdrawals FROM withdrawals");
      const [CumulativeDeposits] = await connection.query("SELECT COALESCE(SUM(money), 0) AS CumulativeDeposits FROM recharge");
      const [CumulativeWinningBonuses] = await connection.query("SELECT COALESCE(SUM(bonus), 0) AS CumulativeWinningBonuses FROM referral_bonus");
      const [CumulativeReferralBonuses] = await connection.query("SELECT COALESCE(SUM(bonus), 0) AS CumulativeReferralBonuses FROM referral_bonus");
      const [TotalGiftCards] = await connection.query("SELECT COALESCE(SUM(money), 0) AS TotalGiftCards FROM redenvelopes_used");
      const [TotalGiftCardsNotRedeemed] = await connection.query("SELECT COALESCE(SUM(money), 0) AS TotalGiftCardsNotRedeemed FROM redenvelopes");


      return res.status(200).json({
        message: "Success",
        status: true,
        totalUsers: totalUsers[0].totalUsers,
        totalUnverifiedUsers: totalUnverifiedUsers[0].totalUnverifiedUsers,
        totalActiveUsers: totalActiveUsers[0].totalActiveUsers,
        totalPendingFundRequests: totalPendingFundRequests[0].totalPendingFundRequests,
        todaysFundRequests: todaysFundRequests[0].todaysFundRequests,
        totalPendingWithdrawalRequests: totalPendingWithdrawalRequests[0].totalPendingWithdrawalRequests,
        todaysWithdrawals: todaysWithdrawals[0].todaysWithdrawals,
        totalPendingWithdrawalAmount: totalPendingWithdrawalAmount[0].totalPendingWithdrawalAmount,
        total5dBetAmount: total5dBetAmount[0].total5dBetAmount,
        totalK3BetAmount: totalK3BetAmount[0].totalK3BetAmount,
        totalWingoBetAmount: totalWingoBetAmount[0].totalWingoBetAmount,
        totalAviatorBetAmount: totalAviatorBetAmount[0].totalAviatorBetAmount,
        CumulativeReferralBonuses: CumulativeReferralBonuses[0].CumulativeReferralBonuses,
        CumulativeWinningBonuses: CumulativeWinningBonuses[0].CumulativeWinningBonuses,
        CumulativeDeposits: CumulativeDeposits[0].CumulativeDeposits,
        CumulativeWithdrawals: CumulativeWithdrawals[0].CumulativeWithdrawals,
        TotalGiftCards: TotalGiftCards[0].TotalGiftCards,
        TotalGiftCardsNotRedeemed: TotalGiftCardsNotRedeemed[0].TotalGiftCardsNotRedeemed,
        timeStamp: new Date().toISOString()
      });
    } else {
      return res.status(200).json({
        message: "Failed",
        status: false,
        timeStamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return res.status(500).json({
      message: "Internal server error",
      status: false,
      timeStamp: new Date().toISOString()
    });
  }
};





const listFundRequests = async (req, res) => {
  let { pageno, limit } = req.body;
  console.log(pageno, limit);

  if (!pageno || !limit) {
    return res.status(200).json({
      code: 0,
      msg: "Invalid page number or limit",
      data: {
        fundRequestsList: [],
      },
      status: false,
    });
  }

  if (pageno < 0 || limit < 0) {
    return res.status(200).json({
      code: 0,
      msg: "No more data",
      data: {
        gameslist: [],
      },
      status: false,
    });
  }

  // Fetch fund requests from the database
  const [fundRequests] = await connection.query(
    `SELECT * FROM fund_requests ORDER BY id DESC LIMIT ${pageno}, ${limit} `

  );

  // Fetch total count of fund requests
  const [totalFundRequests] = await connection.query(
    `SELECT COUNT(*) AS count FROM fund_requests`
  );

  return res.status(200).json({
    message: "Success",
    status: true,
    datas: fundRequests,
    page_total: Math.ceil(totalFundRequests.length / limit),
  });

};


const listAllBets = async (req, res) => {
  let { pageno, limit } = req.body;
  console.log(pageno, limit);

  if (!pageno || !limit) {
    return res.status(200).json({
      code: 0,
      msg: "Invalid page number or limit",
      data: {
        fundRequestsList: [],
      },
      status: false,
    });
  }

  // Get auth token from cookies
  const auth = req.cookies.auth;

  console.log('Auth Token:', auth);

  // Verify the user's authentication
  const [user] = await connection.query(
    "SELECT `phone`, `code`, `invite`, `level` FROM users WHERE `token` = ?",
    [auth]
  );

  console.log('User:', user);

  if (user.length === 0) {
    return res.status(401).json({
      message: "Unauthorized",
      status: false,
    });
  }

  const userInfo = user[0];

  console.log('UserInfo:', userInfo);
  const query = `
  SELECT DISTINCT
    av.id,
    u.name_user,
    u.id_user,
    av.phone COLLATE utf8mb4_unicode_ci AS phone,
    av.betAmount AS money,
    av.withdrawAmount AS amount,
    av.multiplier AS level,
    av.betTime AS time,
    av.withdrawTime AS betTime,
    av.betAmount * av.multiplier AS result,
    IF((av.betAmount * av.multiplier) > av.betAmount, 2, 1) AS status,
    'aviator' AS game_type
  FROM aviator av
  JOIN users u ON av.phone = u.phone
  WHERE av.phone = ?

  UNION ALL
  
  SELECT DISTINCT
    r5d.id,
    u.name_user,
    u.id_user,
    r5d.phone COLLATE utf8mb4_unicode_ci AS phone,
    r5d.money,
    r5d.amount,
    r5d.level,
    r5d.time,
    r5d.time AS betTime,
    r5d.result,
    IF((r5d.money * r5d.level) > r5d.money, 2, 1) AS status,
    '5d' AS game_type
  FROM result_5d r5d
  JOIN users u ON r5d.phone = u.phone
  WHERE u.phone = ?

  UNION ALL
  
  SELECT DISTINCT
    rk3.id,
    u.name_user,
    u.id_user,
    rk3.phone COLLATE utf8mb4_unicode_ci AS phone,
    rk3.money,
    rk3.amount,
    rk3.level,
    rk3.time,
    rk3.time AS betTime,
    rk3.result,
    IF((rk3.money * rk3.level) > rk3.money, 2, 1) AS status,
    'k3' AS game_type
  FROM result_k3 rk3
  JOIN users u ON rk3.phone = u.phone
  WHERE rk3.phone = ?


  UNION ALL
  
  SELECT DISTINCT
    m1.id,
    u.name_user,
    u.id_user,
    m1.phone COLLATE utf8mb4_unicode_ci AS phone,
    m1.money,
    m1.amount,
    m1.level,
    m1.time,
    m1.time AS betTime,
    m1.result,
    IF((m1.money * m1.level) > m1.money, 2, 1) AS status,
    'wingo' AS game_type
  FROM minutes_1 m1
  JOIN users u ON m1.phone = u.phone

  WHERE m1.phone = ?

`;





  const [fundRequests] = await connection.query(query, [
    userInfo.phone,
    userInfo.phone,
    userInfo.phone,
    userInfo.phone,
    pageno,
    limit
  ]);

  // Fetch total count of fund requests
  const totalFundRequests = fundRequests.length;

  return res.status(200).json({
    message: "Success",
    status: true,
    datas: fundRequests,
    page_total: Math.ceil(totalFundRequests / limit),
  });
};


const searchBetHistory = async (req, res) => {
  const { phone } = req.body;

  try {
    // Check if phone number is provided
    if (!phone) {
      return res.status(400).json({
        message: "Phone number is required",
        status: false,
      });
    }

    // Get auth token from cookies
    const auth = req.cookies.auth;

    // Verify the user's authentication
    const [user] = await connection.query(
      "SELECT `phone`, `code`, `invite`, `level` FROM users WHERE `token` = ?",
      [auth]
    );

    if (user.length === 0) {
      return res.status(401).json({
        message: "Unauthorized",
        status: false,
      });
    }

    const userInfo = user[0];

    // Check user's access level
    if (userInfo.level !== 1 && userInfo.level !== 2) {
      return res.status(403).json({
        message: "Forbidden",
        status: false,
      });
    }

    const query = `
        SELECT 
          av.id,
          u.name_user,
          u.id_user,
          av.phone COLLATE utf8mb4_unicode_ci AS phone,
          av.betAmount AS money,
          av.withdrawAmount AS amount,
          av.multiplier AS level,
          av.betTime AS time,
          av.withdrawTime AS betTime,
          av.betAmount * av.multiplier AS result,
          IF((av.betAmount * av.multiplier) > av.betAmount, 2, 1) AS status,
          'aviator' AS game_type
        FROM aviator av
        JOIN users u ON av.phone = u.phone
      
        UNION ALL
        
        SELECT 
          r5d.id,
          u.name_user,
          u.id_user,
          r5d.phone COLLATE utf8mb4_unicode_ci AS phone,
          r5d.money,
          r5d.amount,
          r5d.level,
          r5d.time,
          r5d.time AS betTime,
          r5d.result,
          IF((r5d.money * r5d.level) > r5d.money, 2, 1) AS status,
          '5d' AS game_type
        FROM result_5d r5d
        JOIN users u ON r5d.phone = u.phone
        
        UNION ALL
        
        SELECT 
          rk3.id,
          u.name_user,
          u.id_user,
          rk3.phone COLLATE utf8mb4_unicode_ci AS phone,
          rk3.money,
          rk3.amount,
          rk3.level,
          rk3.time,
          rk3.time AS betTime,
          rk3.result,
          IF((rk3.money * rk3.level) > rk3.money, 2, 1) AS status,
          'k3' AS game_type
        FROM result_k3 rk3
        JOIN users u ON rk3.phone = u.phone
        
        UNION ALL
        
        SELECT 
          m1.id,
          u.name_user,
          u.id_user,
          m1.phone COLLATE utf8mb4_unicode_ci AS phone,
          m1.money,
          m1.amount,
          m1.level,
          m1.time,
          m1.time AS betTime,
          m1.result,
          IF((m1.money * m1.level) > m1.money, 2, 1) AS status,
          'wingo' AS game_type
        FROM minutes_1 m1
        JOIN users u ON m1.phone = u.phone
      
        WHERE m1.phone = ?
      
      `;

    // Execute the query
    const [bets] = await connection.query(query, [phone]);

    if (bets.length === 0) {
      return res.status(404).json({
        message: "No bets found for the provided phone number",
        status: false,
      });
    }

    return res.status(200).json({
      message: "Success",
      data: bets,
      status: true,
    });
  } catch (error) {
    console.error("Error searching for bets:", error);
    return res.status(500).json({
      message: "Internal server error",
      status: false,
    });
  }
};




const searchFundRequests = async (req, res) => {
  const phone = req.body.phone;

  try {
    // Check if phone number is provided
    if (!phone) {
      return res.status(400).json({
        message: "Phone number is required",
        status: false,
      });
    }

    // Search for fund requests based on user's level
    let query;
    const auth = req.cookies.auth;
    const [user] = await connection.query(
      "SELECT `phone`, `code`, `invite`, `level` FROM users WHERE `token` = ?",
      [auth]
    );

    if (user.length === 0) {
      return res.status(401).json({
        message: "Unauthorized",
        status: false,
      });
    }

    const userInfo = user[0];

    if (userInfo.level === 1 || userInfo.level === 2) {
      query = `SELECT * FROM fund_requests WHERE phone = ? ORDER BY id DESC`;
    } else {
      return res.status(403).json({
        message: "Forbidden",
        status: false,
      });
    }

    // Execute the search query
    const [fundRequests] = await connection.query(query, [phone]);

    if (fundRequests.length === 0) {
      return res.status(404).json({
        message: "No fund requests found for the provided phone number",
        status: false,
      });
    }

    return res.status(200).json({
      message: "Success",
      data: fundRequests,
      status: true,
    });
  } catch (error) {
    console.error("Error searching for fund requests:", error);
    return res.status(500).json({
      message: "Internal server error",
      status: false,
    });
  }
};


const updateFundRequestStatus = async (req, res) => {
  const { requestId, action } = req.body;
  console.log('DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD');
  console.log(req.body);
  try {
    // Check if requestId and action are provided
    if (!requestId || !action) {
      return res.status(400).json({
        message: "Request ID and action are required",
        status: false,
      });
    }

    // Check if the action is valid
    const validActions = ["approved", "rejected"];
    if (!validActions.includes(action.toLowerCase())) {
      return res.status(400).json({
        message: "Invalid action value",
        status: false,
      });
    }

    // Update the status of the fund request
    const [result] = await connection.query(
      "UPDATE fund_requests SET status = ?, state = ? WHERE id = ?",
      [action, action, requestId]
    );
    console.log(result);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Fund request not found",
        status: false,
      });
    }

    return res.status(200).json({
      message: "Fund request status updated successfully",
      status: true,
    });
  } catch (error) {
    console.error("Error updating fund request status:", error);
    return res.status(500).json({
      message: "Internal server error",
      status: false,
    });
  }
};



const updateReferralCodeStatus = async (req, res) => {
  console.log('(((((((((((((((((((((((((((((((((((((((');
  console.log(req.body);
  const { userId, status } = req.body;
  try {
    // Check if userId and status are provided
    if (!userId || !status) {
      return res.status(400).json({
        message: "User ID and status are required",
        status: false,
      });
    }

    console.log('HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH');
    // Check if the status is valid
    const validStatus = ["1", "0"];
    if (!validStatus.includes(status.toLowerCase())) {
      return res.status(400).json({
        message: "Invalid status value",
        status: false,
      });
    }
    console.log('DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD');
    // Your raw SQL query to update the referral code status
    const query = `UPDATE users SET referralCodeStatus = ? WHERE id = ?`;

    // Execute the query using the connection
    await connection.query(query, [status, userId]);

    // Update the status of the user's referral code
    // Assuming you're using a database library like Knex.js for SQL queries
    // Replace this with your actual database update logic
    // await knex('users').where('id', userId).update({ referralCodeStatus: status });

    return res.status(200).json({
      message: "Referral code status updated successfully",
      status: true,
    });
  } catch (error) {
    console.error("Error updating referral code status:", error);
    return res.status(500).json({
      message: "Internal server error",
      status: false,
    });
  }
};


const updateAndCrash = async (req, res) => {
  const socket = io("http://aviatorbackend.playdreamgame.com"); // Replace with your socket server URL

  try {
    const time = Date.now();

    // Emit an event to the socket server
    socket.emit("crashedTime", time);
    // Listen for the connect event to ensure connection is established before sending the response
    socket.on("connect", () => {

      // Respond to the client after the event is emitted
      res.status(200).json({
        message: "Referral code status updated successfully",
        status: true,
      });

      // Disconnect the socket after responding
      socket.close();
    });


    // Handle socket connection errors
    socket.on("connect_error", (error) => {
      console.error("Error connecting to socket server:", error);
      res.status(500).json({
        message: "Error connecting to socket server",
        status: false,
      });
      socket.close();
    });
  } catch (error) {
    console.error("Error updating referral code status:", error);
    res.status(500).json({
      message: "Internal server error",
      status: false,
    });
  }
};



export const enableBettingOnAviator = async (req, res) => {
  console.log('TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT');
  try {
    // Query to fetch the current value of enable_betting
    const selectQuery = 'SELECT enable_betting FROM crashedplane WHERE id = 1';

    try {
      // Execute the select query to fetch the current value of enable_betting
      const [rows] = await connection.query(selectQuery);

      // Extract the current value of enable_betting from the result
      const currentEnableBetting = rows[0].enable_betting;
      console.log(rows)
      console.log(currentEnableBetting);
      // Toggle the value of enable_betting based on its current value
      // const newEnableBetting = currentEnableBetting === 0 ? 1 : 0;
      let newEnableBetting = 0;
      if (currentEnableBetting == 0) {
        newEnableBetting = 1;
      }
      if (currentEnableBetting == 1) {
        newEnableBetting = 0;
      }

      console.log(newEnableBetting);


      // Query to update the crashedplane table with the new value of enable_betting
      const updateQuery = `UPDATE crashedplane SET enable_betting = ? WHERE id = 1`;

      try {
        await connection.query(updateQuery, [newEnableBetting]);

        // If the operation is successful, send a success response
        return res.status(200).json({
          status: true,
          message: "Crash data updated",
        });
      } catch (error) {
        console.log(error);
        // Handle any errors that occur during the database operation
        return res.status(500).json({
          status: false,
          message: "Error updating crash data",
        });
      }
    } catch (error) {
      console.log(error);
      // Handle any errors that occur during the database operation
      return res.status(500).json({
        status: false,
        message: "Error fetching current enable_betting value",
      });
    }
  } catch (err) {
    // Handle any unexpected errors that occur
    return res.status(500).json({
      status: false,
      message: err.message,
    });
  }
};


const updateWithdrawRequestStatus = async (req, res) => {
  const { requestId, status } = req.body;
  try {
    // Check if requestId and status are provided
    if (!requestId || !status) {
      return res.status(400).json({
        message: "Request ID and status are required",
        status: false,
      });
    }

    // Check if the status is valid
    const validStatusValues = ["approved", "pending", "rejected"];
    if (!validStatusValues.includes(status.toLowerCase())) {
      return res.status(400).json({
        message: "Invalid status value",
        status: false,
      });
    }

    // Update the status of the withdrawal request
    const [result] = await connection.query(
      "UPDATE withdrawal_requests SET status = ? WHERE id = ?",
      [status, requestId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Withdrawal request not found",
        status: false,
      });
    }

    return res.status(200).json({
      message: "Withdrawal request status updated successfully",
      status: true,
    });
  } catch (error) {
    console.error("Error updating withdrawal request status:", error);
    return res.status(500).json({
      message: "Internal server error",
      status: false,
    });
  }
};

const updateRemark = async (req, res) => {
  const { requestId, remark, tableName } = req.body;
  console.log(req.body);
  try {
    // Check if requestId, remark, and tableName are provided
    if (!requestId || !remark || !tableName) {
      return res.status(400).json({
        message: "Request ID, remark, and table name are required",
        status: false,
      });
    }

    console.log('TTTTTTTTTTTTTTTTTTTTT');

    // Update the remark in the specified table
    const [result] = await connection.query(
      `UPDATE ${tableName} SET remark = ? WHERE id = ?`,
      [remark, requestId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Record not found",
        status: false,
      });
    }
    console.log('RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR');

    return res.status(200).json({
      message: "Remark updated successfully",
      status: true,
    });
  } catch (error) {
    console.error("Error updating remark:", error);
    return res.status(500).json({
      message: "Internal server error",
      status: false,
    });
  }
};


const updateReferralCode = async (req, res) => {
  const { code } = req.body;

  try {
    // Check if the referral code is provided
    if (!code) {
      return res.status(400).json({
        message: "Referral code not provided",
        status: false,
      });
    }

    // Retrieve user token from cookie
    const auth = req.cookies.auth;
    if (!auth) {
      return res.redirect("/login");
    }


    // Check if the referral code already exists
    const existingCode = await connection.execute(
      "SELECT id FROM `users` WHERE code = ?",
      [code]
    );

    // If the referral code already exists, return an error
    if (existingCode[0].length > 0) {
      return res.status(400).json({
        message: "Referral code already exists",
        status: false

      });
    }

    // Query the database to retrieve the user based on the token
    const [rows] = await connection.execute(
      "SELECT * FROM `users` WHERE `token` = ? AND veri = 1",
      [auth]
    );

    // Check if the user exists
    if (rows.length === 0) {
      return res.status(404).json({
        message: "User not found or not verified",
        status: false,
      });
    }

    // Update referral code and invite code for the user
    const userId = rows[0].id;
    const [result] = await connection.execute(
      "UPDATE users SET referralCode = ?, code = ? WHERE id = ?",
      [code, code, userId]
    );

    // Check if the update was successful
    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Referral code not updated",
        status: false,
      });
    }

    // Return success response
    return res.status(200).json({
      message: "Referral code updated successfully",
      status: true,
      code: code,
    });
  } catch (error) {
    console.error("Error updating referral code:", error);
    return res.status(500).json({
      message: "Internal server error",
      status: false,
    });
  }
};


const updateUserLevel = async (req, res) => {
  const { userId, newLevel } = req.body;

  try {
    // Check if the referral code is provided
    if (!userId || !newLevel) {
      return res.status(400).json({
        message: "Referral code not provided",
        status: false,
      });
    }

    // Retrieve user token from cookie
    const auth = req.cookies.auth;
    if (!auth) {
      return res.redirect("/login");
    }


    // Query the database to retrieve the user based on the token
    const [rows] = await connection.execute(
      "SELECT * FROM `users` WHERE `id` = ?",
      [userId]
    );

    // Check if the user exists
    if (rows.length === 0) {
      return res.status(404).json({
        message: "User not found or not verified",
        status: false,
      });
    }

    // Update referral code and invite code for the user
    const [result] = await connection.execute(
      "UPDATE users SET level = ? WHERE id = ?",
      [newLevel, userId]
    );

    // Check if the update was successful
    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "User Level not updated",
        status: false,
      });
    }

    // Return success response
    return res.status(200).json({
      message: "User Level updated successfully",
      status: true,
      newLevel: newLevel,
    });
  } catch (error) {
    console.error("Error updating referral code:", error);
    return res.status(500).json({
      message: "Internal server error",
      status: false,
    });
  }
};

const ledgerView = async (req, res) => {
  try {
    let userId = req.params.id;

    const userQuery = `
      SELECT * FROM users WHERE phone = ?;
    `;


    const combinedQuery = `
      SELECT DISTINCT 'withdrawal' AS category, user_id,  id, date, utr, amount as amount, transaction_id, '' as  type FROM withdrawals
      WHERE user_id = ?
      UNION ALL
      SELECT DISTINCT 'recharge' AS category, user_id,  id, date, utr, money as amount, transaction_id, type  FROM recharge 
      WHERE user_id = ?;
    `;

    // Fetch user data
    const [userData] = await connection.query(userQuery, [userId]);
    const user = userData[0]; // Assuming only one user with the given ID exists

    // Fetch combined withdrawals and recharges
    const [combinedData] = await connection.query(combinedQuery, [user.id, user.id]);

    // Render the data to the ledger view
    return res.render("manage/ledgerView.ejs", {
      user,
      transactions: combinedData
    });
  } catch (error) {
    console.error('Error fetching ledger data:', error);
    return res.status(500).send('Internal Server Error');
  }
};

const referralCodesView = async (req, res) => {
  try {
    let userId = req.params.id;

    const userQuery = `
      SELECT * FROM users WHERE phone = ?;
    `;

    const referralQuery = `
      SELECT 
        u_referrer.id_user AS referrer_id_user,
        u_referrer.name_user AS referrer_name_user,
        u_referrer.phone AS referrer_phone,
        u_referrer.level AS referrer_level,
        u_referrer.MyRefereeCode AS referrer_MyRefereeCode,
        u_referrer.referralCode AS referrer_referralCode,
        u_referrer.totalReferrals AS referrer_totalReferrals,
        u_referrer.totalDeposits AS referrer_totalDeposits,
        u_referrer.referralBonus AS referrer_referralBonus,
        u_referrer.referralCodeStatus AS referrer_referralCodeStatus,
        IFNULL(0.1 * u_referrer.totalDeposits, 0) AS referrer_totalBonus,
        
        u_referred.id_user AS referred_id_user,
        u_referred.name_user AS referred_name_user,
        u_referred.phone AS referred_phone,
        u_referred.level AS referred_level,
        u_referred.MyRefereeCode AS referred_MyRefereeCode,
        u_referred.referralCode AS referred_referralCode,
        u_referred.totalReferrals AS referred_totalReferrals,
        u_referred.totalDeposits AS referred_totalDeposits,
        u_referred.referralBonus AS referred_referralBonus,
        u_referred.referralCodeStatus AS referred_referralCodeStatus,
        IFNULL(0.1 * u_referred.totalDeposits, 0) AS referred_totalBonus,
        
        rb.bonus,
        rb.created_at
      FROM referral_bonus rb
      JOIN users u_referrer ON rb.user_id = u_referrer.id
      JOIN users u_referred ON rb.referred_user_id = u_referred.id
      WHERE u_referrer.id_user = ?;
    `;

    // Fetch user data
    const [userData] = await connection.query(userQuery, [userId]);
    const user = userData[0]; // Assuming only one user with the given ID exists

    const [referralData] = await connection.query(referralQuery, [user.id_user]);

    // Render the data to the referralCodesView
    return res.render("manage/referralCodesView.ejs", {
      user,
      referrals: referralData
    });
  } catch (error) {
    console.error('Error fetching referral data:', error);
    return res.status(500).send('Internal Server Error');
  }
};





const saveUpiSettings = async (req, res) => {
  try {
    const { upiId } = req.body;
    let qrCodeUrl = req.body.qrCodeUrl; // This will be updated if a file is uploaded

    // Handle file upload
    if (req.files && req.files.upiQr) {
      const file = req.files.upiQr;
      const uploadPath = '/path/to/upload/directory/' + file.name; // Adjust the path as needed
      await file.mv(uploadPath);
      qrCodeUrl = uploadPath;
    }

    // Check if the first entry exists
    const [existingSettings] = await connection.query("SELECT * FROM PaymentSettings LIMIT 1");

    // If no existing entry, create a new one
    if (!existingSettings || existingSettings.length === 0) {
      await connection.query(
        "INSERT INTO PaymentSettings (upiId, qrCodeUrl, wowPayAccount, upiToken) VALUES (?, ?, '', '')",
        [upiId, qrCodeUrl]
      );
    } else {
      // If existing entry, update the UPI settings
      await connection.query(
        "UPDATE PaymentSettings SET upiId = ?, qrCodeUrl = ? WHERE id = ?",
        [upiId, qrCodeUrl, existingSettings.id]
      );
    }

    console.log('UPI settings saved successfully.');
    res.redirect('/admin/manager/paymentSettings');
  } catch (error) {
    console.error('Error saving UPI settings:', error);
    return res.status(500).send(error.toString());
  }
};


const saveWowpaySettings = async (req, res) => {
  try {
    const { wowPayAccount } = req.body;

    // Check if the first entry exists
    const [existingSettings] = await connection.query("SELECT * FROM PaymentSettings LIMIT 1");

    // If no existing entry, create a new one
    if (!existingSettings || existingSettings.length === 0) {
      await connection.query(
        "INSERT INTO PaymentSettings (upiId, qrCodeUrl, wowPayAccount, upiToken) VALUES ('', '', ?, '')",
        [wowPayAccount]
      );
    } else {
      // If existing entry, update the WOWPay settings
      await connection.query(
        "UPDATE PaymentSettings SET wowPayAccount = ? WHERE id = ?",
        [wowPayAccount, existingSettings.id]
      );
    }

    console.log('WOWPay settings saved successfully.');
    res.redirect('/admin/manager/paymentSettings');
  } catch (error) {
    console.error('Error saving WOWPay settings:', error);
    return res.status(500).send(error.toString());
  }
};



const saveUpiTokenSettings = async (req, res) => {
  try {
    const { upiToken } = req.body;

    // Check if the first entry exists
    const [existingSettings] = await connection.query("SELECT * FROM PaymentSettings LIMIT 1");

    // If no existing entry, create a new one
    if (!existingSettings || existingSettings.length === 0) {
      await connection.query(
        "INSERT INTO PaymentSettings (upiId, qrCodeUrl, wowPayAccount, upiToken) VALUES ('', '', '', ?)",
        [upiToken]
      );
    } else {
      // If existing entry, update the UPI Token settings
      await connection.query(
        "UPDATE PaymentSettings SET upiToken = ? WHERE id = ?",
        [upiToken, existingSettings.id]
      );
    }

    console.log('UPI Token settings saved successfully.');
    res.redirect('/admin/manager/paymentSettings');
  } catch (error) {
    console.error('Error saving UPI Token settings:', error);
    return res.status(500).send(error.toString());
  }
};


const SavePaymentSettings = async (req, res) => {
  try {
    const { upiId, wowPayAccount, upiToken, usdtId } = req.body;
    let { qrCodeUrl, usdtQrCodeUrl } = req.body; // These will be updated if files are uploaded

    // Handle UPI QR code upload
    if (req.files && req.files.upiQr) {
      const upiQrFile = req.files.upiQr;
      const upiUploadPath = '/path/to/upload/directory/' + upiQrFile.name; // Adjust the path as needed
      await upiQrFile.mv(upiUploadPath);
      qrCodeUrl = upiUploadPath;
    }

    // Handle USDT QR code upload
    if (req.files && req.files.usdtQr) {
      const usdtQrFile = req.files.usdtQr;
      const usdtUploadPath = '/path/to/upload/directory/' + usdtQrFile.name; // Adjust the path as needed
      await usdtQrFile.mv(usdtUploadPath);
      usdtQrCodeUrl = usdtUploadPath;
    }

    // Check if the first entry exists
    const [existingSettings] = await connection.query("SELECT * FROM PaymentSettings LIMIT 1");

    // If no existing entry, create a new one
    if (!existingSettings || existingSettings.length === 0) {
      await connection.query(
        "INSERT INTO PaymentSettings (upiId, qrCodeUrl, wowPayAccount, upiToken, usdtId, usdtQrCodeUrl) VALUES (?, ?, ?, ?, ?, ?)",
        [upiId, qrCodeUrl, wowPayAccount, upiToken, usdtId, usdtQrCodeUrl]
      );
    } else {
      // If existing entry, update the settings
      await connection.query(
        "UPDATE PaymentSettings SET upiId = ?, qrCodeUrl = ?, wowPayAccount = ?, upiToken = ?, usdtId = ?, usdtQrCodeUrl = ? WHERE id = ?",
        [upiId, qrCodeUrl, wowPayAccount, upiToken, usdtId, usdtQrCodeUrl, existingSettings.id]
      );
    }

    console.log('Payment settings saved successfully.');
    res.redirect('/admin/manager/paymentSettings');
  } catch (error) {
    console.error('Error saving payment settings:', error);
    return res.status(500).send(error.toString());
  }
};





const dashboard = async (req, res) => {
  return res.render("manage/dashboard.ejs");
};





const fundRequests = async (req, res) => {
  try {
    // Query transactions with user information using a JOIN operation
    const [transactions] = await connection.query(`
      SELECT w.*, u.phone, u.name_user
      FROM fund_requests w
      JOIN users u ON w.user_id = u.id
    `);

    // Render the withdraw.ejs template with transactions data
    return res.render("manage/fundRequests.ejs", { transactions });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    // Handle error response
    return res.status(500).send("Internal Server Error");
  }
};


const paymentHistory = async (req, res) => {
  return res.render("manage/paymentHistory.ejs");
};
const ledgerHistory = async (req, res) => {
  return res.render("manage/ledgerHistory.ejs");
};

const adminPage = async (req, res) => {
  return res.render("manage/index.ejs");
};

const adminPage3 = async (req, res) => {
  return res.render("manage/a-index-bet/index3.ejs");
};

const adminPage5 = async (req, res) => {
  return res.render("manage/a-index-bet/index5.ejs");
};

const adminPage10 = async (req, res) => {
  return res.render("manage/a-index-bet/index10.ejs");
};

const adminPage5d = async (req, res) => {
  return res.render("manage/5d.ejs");
};

const adminPageK3 = async (req, res) => {
  return res.render("manage/k3.ejs");
};

const ctvProfilePage = async (req, res) => {
  var phone = req.params.phone;
  return res.render("manage/profileCTV.ejs", { phone });
};

const giftPage = async (req, res) => {
  return res.render("manage/giftPage.ejs");
};

const referralCodes = async (req, res) => {
  return res.render("manage/referralCodes.ejs");
};

const membersPage = async (req, res) => {
  return res.render("manage/members.ejs");
};


const agentsStatistics = async (req, res) => {
  return res.render("manage/agentsStatistics.ejs");
};

const betsHistoryPage = async (req, res) => {
  return res.render("manage/betsHistoryPage.ejs");
};

const ctvPage = async (req, res) => {
  return res.render("manage/ctv.ejs");
};

const infoMember = async (req, res) => {
  let phone = req.params.id;
  const userQuery = `
    SELECT * FROM users WHERE phone = ?;
  `;
  // Fetch user data
  const [userData] = await connection.query(userQuery, [phone]);
  const user = userData[0]; // Assuming only one user with the given ID exists
  return res.render("manage/profileMember.ejs", { phone, user });
};

const statistical = async (req, res) => {
  return res.render("manage/statistical.ejs");
};

const rechargePage = async (req, res) => {
  return res.render("manage/recharge.ejs");
};
const k3history = async (req, res) => {
  return res.render("manage/k3history.ejs");
};
const d5history = async (req, res) => {
  return res.render("manage/5dhistory.ejs");
};
const wingoHistory = async (req, res) => {
  return res.render("manage/wingohistory.ejs");
};
const rechargeRecord = async (req, res) => {
  return res.render("manage/rechargeRecord.ejs");
};

const withdraw = async (req, res) => {
  try {
    // Query transactions with user information using a JOIN operation
    const [transactions] = await connection.query(`
      SELECT w.*, u.phone, u.name_user
      FROM withdrawal_requests w
      JOIN users u ON w.user_id = u.id
    `);

    // Render the withdraw.ejs template with transactions data
    return res.render("manage/withdraw.ejs", { transactions });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    // Handle error response
    return res.status(500).send("Internal Server Error");
  }
};

const getUserInfo = async (req, res, next) => {
  try {
    const token = getCokkie;
    return res.status(200).json({
      status: true,
      user: req.user,
      bank: req.bank,
      key: req.key,
    });
  } catch (err) {
    return res.status(404).json({
      status: false,
      message: err.message,
    });
  }
};
const withdrawRecord = async (req, res) => {
  return res.render("manage/withdrawRecord.ejs");
};
const settings = async (req, res) => {
  return res.render("manage/settings.ejs");
};

const paymentSettings = async (req, res) => {
  console.log('OOOOOOOOOOOOOOOOOOOOOOOOO');
  console.log(req.body);
  try {
    if (req.method === "POST") {
      console.log(req.body);
      // Extract form data from the request body
      const {
        upiId, usdtId, wowPayAccount, upiToken,
        bankName, accountHolderName, accountNumber, ifsc
      } = req.body;

      console.log(req.body);

      // Extract file paths if files were uploaded
      const qrCodeUrl = req.files.qrCodeUrl ? req.files.qrCodeUrl[0].path : '';
      const usdtQrCodeUrl = req.files.usdtQrCodeUrl ? req.files.usdtQrCodeUrl[0].path : '';

      // Update the first row in the PaymentSettings table
      await connection.query(
        `UPDATE PaymentSettings SET
                  upiId = ?, qrCodeUrl = ?, usdtId = ?, wowPayAccount = ?,
                  upiToken = ?, usdtQrCodeUrl = ?, bankName = ?, accountHolderName = ?,
                  accountNumber = ?, ifsc = ?
              WHERE id = 1`,
        [upiId, qrCodeUrl, usdtId, wowPayAccount, upiToken, usdtQrCodeUrl, bankName, accountHolderName, accountNumber, ifsc]
      );

      return res.redirect('/admin/manager/paymentSettings');
    } else {
      // Execute the SQL query to retrieve payment settings
      const [rows] = await connection.query('SELECT * FROM PaymentSettings LIMIT 1');

      // Extract the first row if it exists
      const settings = rows.length > 0 ? rows[0] : null;
      return res.render("manage/paymentSettings.ejs", { settings });
    }
  } catch (error) {
    console.error('Error retrieving or updating payment settings:', error);
    return res.status(500).send(error.toString());
  }
};


const getSettings = async (req, res) => {
  console.log('OOOOOOOOOOOOOOOOOOOOOOOOO');
  console.log(req.body);
  try {
    // Execute the SQL query to retrieve payment settings
    const [rows] = await connection.query('SELECT * FROM BannerImages LIMIT 1');


    console.log(rows);

    // Extract the first row if it exists
    const settings = rows.length > 0 ? rows[0] : null;
    return res.render("manage/getSettings.ejs", { settings });

  } catch (error) {
    console.error('Error retrieving or updating payment settings:', error);
    return res.status(500).send(error.toString());
  }
};


const rebateRatio = async (req, res) => {
  try {
    const rebate_ratio_levels = null;
    return res.render("manage/rebateRatio.ejs", { rebate_ratio_levels });

  } catch (error) {
    console.error('Error retrieving or updating rebate ratio settings:', error);
    return res.status(500).send(error.toString());
  }
};


const AviatorCrashedPlane = async (req, res) => {
  try {
    if (req.method === "POST") {
      // Extract form data from the request body
      const {
        upiId, usdtId, wowPayAccount, upiToken,
        bankName, accountHolderName, accountNumber, ifsc
      } = req.body;


      // Extract file paths if files were uploaded
      const qrCodeUrl = req.files.qrCodeUrl ? req.files.qrCodeUrl[0].path : '';
      const usdtQrCodeUrl = req.files.usdtQrCodeUrl ? req.files.usdtQrCodeUrl[0].path : '';

      // Update the first row in the PaymentSettings table
      await connection.query(
        `UPDATE PaymentSettings SET
                  upiId = ?, qrCodeUrl = ?, usdtId = ?, wowPayAccount = ?,
                  upiToken = ?, usdtQrCodeUrl = ?, bankName = ?, accountHolderName = ?,
                  accountNumber = ?, ifsc = ?
              WHERE id = 1`,
        [upiId, qrCodeUrl, usdtId, wowPayAccount, upiToken, usdtQrCodeUrl, bankName, accountHolderName, accountNumber, ifsc]
      );

      return res.redirect('/admin/manager/AviatorCrashedPlane');
    } else {
      // Execute the SQL query to retrieve payment settings
      // const [rows] = await connection.query('SELECT * FROM PaymentSettings LIMIT 1');
      const [rows] = await connection.execute('SELECT * FROM crashedplane WHERE id = ?', [1]);

      // Extract the first row if it exists
      const settings = rows.length > 0 ? rows[0] : null;


      return res.render("manage/AviatorCrashedPlane.ejs", { settings });
    }
  } catch (error) {
    console.error('Error retrieving or updating payment settings:', error);
    return res.status(500).send(error.toString());
  }
};



const saveScreenshotWithMulter = async (base64Data) => {
  try {
    if (!base64Data) {
      // Return default URL if image data is not present
      return null;
    }

    // Extract the mime type and base64 encoded image data from the string
    const matches = base64Data.match(/^data:(.+);base64,(.+)/);
    if (!matches || matches.length !== 3) {
      throw new Error('Invalid base64 image data');
    }

    // Extract the mime type and image data
    const mimeType = matches[1];
    const imageData = matches[2];

    // Convert base64 encoded image data to binary buffer
    const imageBuffer = Buffer.from(imageData, 'base64');

    // Generate a unique filename for the uploaded file (or use a specific name pattern)
    const fileName = `screenshot_${Date.now()}.${mimeType.split('/')[1]}`;

    // Specify the destination folder where the file will be saved
    const uploadPath = '/home/uploads/' + fileName;

    // Write the binary data to the file
    await fs.promises.writeFile(uploadPath, imageBuffer);

    // Return the filename or full path if needed
    const fileUrl = 'http://playdreamgame.com/uploads/' + fileName;
    return fileUrl;
  } catch (error) {
    // Log the error
    console.error('Error saving screenshot:', error);

    // Return default URL if an error occurs
    return 'http://example.com/default-image.jpg';
  }
};


// const saveScreenshotWithMulter = async (base64Data) => {
//   try {
//       // Extract the mime type and base64 encoded image data from the string
//       const matches = base64Data.match(/^data:(.+);base64,(.+)/);
//       if (!matches || matches.length !== 3) {
//           throw new Error('Invalid base64 image data');
//       }

//       // Extract the mime type and image data
//       const mimeType = matches[1];
//       const imageData = matches[2];

//       // Convert base64 encoded image data to binary buffer
//       const imageBuffer = Buffer.from(imageData, 'base64');

//       // Generate a unique filename for the uploaded file (or use a specific name pattern)
//       const fileName = `screenshot_${Date.now()}.${mimeType.split('/')[1]}`;

//       // Specify the destination folder where the file will be saved
//       // const uploadPath = './uploads/' + fileName;
//       // Specify the destination folder where the file will be saved
//       const uploadPath = '/home/uploads/' + fileName;

//       // Write the binary data to the file
//       await fs.promises.writeFile(uploadPath, imageBuffer);

//       // Return the filename or full path if needed
//       const fileUrl = 'http://playdreamgame.com/uploads/' + fileName;
//       return fileUrl;
//   } catch (error) {
//       console.error('Error saving screenshot:', error);
//       throw error;
//   }
// };



const ensureUploadsFolderExists = () => {
  const uploadFolderPath = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadFolderPath)) {
    console.log(`'uploads' folder does not exist. Creating it at: ${uploadFolderPath}`);
    fs.mkdirSync(uploadFolderPath);
  }
};

const updatePaymentSettings = async (req, res) => {
  try {
    ensureUploadsFolderExists();

    upload.single('file')(req, res, async (err) => {
      if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading
        return res.status(500).json({ message: 'File upload error', status: false });
      } else if (err) {
        // An unknown error occurred
        return res.status(500).json({ message: 'Unknown error', status: false });
      }
      // Get auth and token from request headers
      const auth = req.body.auth;
      const token = req.body.token;



      const usdtQrCodeImage = req.body.usdtQrCodeImage;

      // Save the screenshot with Multer
      const usdtQrCodeImageUrl = await saveScreenshotWithMulter(usdtQrCodeImage);



      const upiQrCodeImage = req.body.upiQrCodeImage;

      const upiQrCodeImageUrl = await saveScreenshotWithMulter(upiQrCodeImage);
      // console.log(req.body);



      // Extract form data from the request body
      const { upiId, usdtId, wowPayAccount, upiToken, bankName, accountHolderName, accountNumber, ifsc, minWithdraw, minBetAmount, minDeposit, referralBonus } = req.body;
      console.log(upiId, usdtId, wowPayAccount, upiToken, bankName, accountHolderName, accountNumber, ifsc, minWithdraw, minBetAmount, minDeposit, referralBonus);


      // Update the PaymentSettings table based on image availability
      if (upiQrCodeImageUrl && usdtQrCodeImageUrl) {
        await connection.execute(
          `UPDATE PaymentSettings SET
                upiId = ?, qrCodeUrl = ?, usdtId = ?, wowPayAccount = ?, upiToken = ?, usdtQrCodeUrl = ?, bankName = ?,
                accountHolderName = ?, accountNumber = ?, ifsc = ?, maxWithdraw = ?, minBetAmount = ?, minDeposit = ?,  referralBonus = ?
                WHERE id = 1`,
          [upiId, upiQrCodeImageUrl, usdtId, wowPayAccount, upiToken, usdtQrCodeImageUrl, bankName, accountHolderName, accountNumber, ifsc, minWithdraw, minBetAmount, minDeposit, referralBonus]
        );
      } else if (upiQrCodeImageUrl && !usdtQrCodeImageUrl) {
        await connection.execute(
          `UPDATE PaymentSettings SET
                upiId = ?, qrCodeUrl = ?, usdtId = ?, wowPayAccount = ?, upiToken = ?, bankName = ?,
                accountHolderName = ?, accountNumber = ?, ifsc = ?, maxWithdraw = ?, minBetAmount = ?, minDeposit = ?,  referralBonus = ?
                WHERE id = 1`,
          [upiId, upiQrCodeImageUrl, usdtId, wowPayAccount, upiToken, bankName, accountHolderName, accountNumber, ifsc, minWithdraw, minBetAmount, minDeposit, referralBonus]
        );
      } else if (!upiQrCodeImageUrl && usdtQrCodeImageUrl) {
        await connection.execute(
          `UPDATE PaymentSettings SET
                upiId = ?, usdtId = ?, wowPayAccount = ?, upiToken = ?, usdtQrCodeUrl = ?, bankName = ?,
                accountHolderName = ?, accountNumber = ?, ifsc = ?, maxWithdraw = ?, minBetAmount = ?, minDeposit = ?,  referralBonus = ?
                WHERE id = 1`,
          [upiId, usdtId, wowPayAccount, upiToken, usdtQrCodeImageUrl, bankName, accountHolderName, accountNumber, ifsc, minWithdraw, minBetAmount, minDeposit, referralBonus]
        );
      } else if (!upiQrCodeImageUrl && !usdtQrCodeImageUrl) {
        await connection.execute(
          `UPDATE PaymentSettings SET
              upiId = ?, usdtId = ?, wowPayAccount = ?, upiToken = ?, bankName = ?,
              accountHolderName = ?, accountNumber = ?, ifsc = ?, maxWithdraw = ?, minBetAmount = ?, minDeposit = ?,  referralBonus = ?
              WHERE id = 1`,
          [upiId, usdtId, wowPayAccount, upiToken, bankName, accountHolderName, accountNumber, ifsc, minWithdraw, minBetAmount, minDeposit, referralBonus]
        );
      }

      // Extract form data from the request body
      // const { upiId, usdtId, wowPayAccount, upiToken, bankName, accountHolderName, accountNumber, ifsc, minWithdraw, minBetAmount, minDeposit, referralBonus } = req.body;
      // console.log(upiId, usdtId, wowPayAccount, upiToken, bankName, accountHolderName, accountNumber, ifsc, minWithdraw, minBetAmount, minDeposit, referralBonus);

      // // Update the PaymentSettings table based on image availability
      // if (upiQrCodeImageUrl && usdtQrCodeImageUrl) {
      //     await connection.execute(
      //         `UPDATE PaymentSettings SET
      //         upiId = ?, qrCodeUrl = ?, usdtId = ?, wowPayAccount = ?, upiToken = ?, usdtQrCodeUrl = ?, bankName = ?,
      //         accountHolderName = ?, accountNumber = ?, ifsc = ?, maxWithdraw = ?, minBetAmount = ?, minDeposit = ?, referralBonus = ?
      //         WHERE id = 1`,
      //         [upiId, upiQrCodeImageUrl, usdtId, wowPayAccount, upiToken, usdtQrCodeImageUrl, bankName, accountHolderName, accountNumber, ifsc, minWithdraw, minBetAmount, minDeposit, referralBonus]
      //     );
      // } else if (upiQrCodeImageUrl && !usdtQrCodeImageUrl) {
      //     await connection.execute(
      //         `UPDATE PaymentSettings SET
      //         upiId = ?, qrCodeUrl = ?, usdtId = ?, wowPayAccount = ?, upiToken = ?, bankName = ?,
      //         accountHolderName = ?, accountNumber = ?, ifsc = ?, maxWithdraw = ?, minBetAmount = ?, minDeposit = ?, referralBonus = ?
      //         WHERE id = 1`,
      //         [upiId, upiQrCodeImageUrl, usdtId, wowPayAccount, upiToken, bankName, accountHolderName, accountNumber, ifsc, minWithdraw, minBetAmount, minDeposit, referralBonus]
      //     );
      // } else if (!upiQrCodeImageUrl && usdtQrCodeImageUrl) {
      //     await connection.execute(
      //         `UPDATE PaymentSettings SET
      //         upiId = ?, usdtId = ?, wowPayAccount = ?, upiToken = ?, usdtQrCodeUrl = ?, bankName = ?,
      //         accountHolderName = ?, accountNumber = ?, ifsc = ?, maxWithdraw = ?, minBetAmount = ?, minDeposit = ?, referralBonus = ?
      //         WHERE id = 1`,
      //         [upiId, usdtId, wowPayAccount, upiToken, usdtQrCodeImageUrl, bankName, accountHolderName, accountNumber, ifsc, minWithdraw, minBetAmount, minDeposit, referralBonus]
      //     );
      // }


      const [settings] = await connection.execute(
        `Select * FROM PaymentSettings WHERE id = 1`)

      // Return response
      return res.status(200).json({
        message: "Update successfully",
        status: true,
        settings: settings[0],
        timeStamp: new Date().toISOString(),
      });
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
      status: false,
      timeStamp: new Date().toISOString(),
    });
  }
};





const uploadBannerImages = async (req, res) => {
  try {
    ensureUploadsFolderExists();

    upload.single('file')(req, res, async (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(500).json({ message: 'File upload error', status: false });
      } else if (err) {
        return res.status(500).json({ message: 'Unknown error', status: false });
      }


      const image1 = req.body.image1;
      const image2 = req.body.image2;
      const image3 = req.body.image3;

      const image1Url = await saveScreenshotWithMulter(image1);
      const image2Url = await saveScreenshotWithMulter(image2);
      const image3Url = await saveScreenshotWithMulter(image3);

      console.log(image1Url, image2Url, image3Url)

      // Update the BannerImages table for entry with id = 1
      await connection.execute(
        `INSERT INTO BannerImages (id, image1Url, image2Url, image3Url)
              VALUES (1, ?, ?, ?)
              ON DUPLICATE KEY UPDATE
              image1Url = VALUES(image1Url),
              image2Url = VALUES(image2Url),
              image3Url = VALUES(image3Url)`,
        [image1Url, image2Url, image3Url]
      );
      // Return response
      return res.status(200).json({
        message: "Images uploaded and settings updated successfully",
        status: true,
        timeStamp: new Date().toISOString(),
        image1Url: image1Url,
        image2Url: image2Url,
        image3Url: image3Url
      });
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
      status: false,
      timeStamp: new Date().toISOString(),
    });
  }
};



// xác nhận admin
const middlewareAdminController = async (req, res, next) => {
  // xác nhận token
  const auth = req.cookies.auth;
  if (!auth) {
    return res.redirect("/login");
  }
  const [rows] = await connection.execute(
    "SELECT `token`,`level`, `status` FROM `users` WHERE `token` = ? AND veri = 1",
    [auth]
  );
  if (!rows) {
    return res.redirect("/login");
  }
  try {
    if (auth == rows[0].token && rows[0].status == 1) {
      if (rows[0].level == 1) {
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
};
const getAllUserData = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const skip = (page - 1) * limit;
    const alldata = await prisma.users.findMany({
      where: {
        token: {
          not: "0",
        },
      },
    });
    const data = await prisma.users.findMany({
      skip: Number(skip),
      take: Number(limit),
      orderBy: {
        id: "desc",
      },
      where: {
        token: {
          not: "0",
        },
      },
    });

    return res.status(200).json({
      status: true,
      message: "userData Successfully fetched!...",
      data,
      length: alldata.length,
    });
  } catch (err) {
    return res.status(401).json({
      status: false,
      message: err.message,
    });
  }
};
const getAllRechargeDetails = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const skip = (page - 1) * limit;
    const alldata = await prisma.aviatorrecharge.findMany();
    const data = await prisma.aviatorrecharge.findMany({
      skip: Number(skip),
      take: Number(limit),
      orderBy: {
        id: "desc",
      },
    });
    return res.status(200).json({
      status: true,
      message: "RechargeData Successfully fetched!...",
      data,
      length: alldata.length,
    });
  } catch (err) {
    return res.status(401).json({
      status: false,
      message: err.message,
    });
  }
};
const totalJoin = async (req, res) => {
  let auth = req.cookies.auth;
  let typeid = req.body.typeid;
  if (!typeid) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }
  let game = "";
  if (typeid == "1") game = "wingo";
  if (typeid == "2") game = "wingo3";
  if (typeid == "3") game = "wingo5";
  if (typeid == "4") game = "wingo10";

  const [rows] = await connection.query(
    "SELECT * FROM users WHERE `token` = ? ",
    [auth]
  );

  if (rows.length > 0) {
    const [wingoall] = await connection.query(
      `SELECT * FROM minutes_1 WHERE game = "${game}" AND status = 0 AND level = 0 ORDER BY id ASC `,
      [auth]
    );
    const [winGo1] = await connection.execute(
      `SELECT * FROM wingo WHERE status = 0 AND game = '${game}' ORDER BY id DESC LIMIT 1 `,
      []
    );
    const [winGo10] = await connection.execute(
      `SELECT * FROM wingo WHERE status != 0 AND game = '${game}' ORDER BY id DESC LIMIT 10 `,
      []
    );
    const [setting] = await connection.execute(`SELECT * FROM admin `, []);

    return res.status(200).json({
      message: "Success",
      status: true,
      datas: wingoall,
      lotterys: winGo1,
      list_orders: winGo10,
      setting: setting,
      timeStamp: timeNow,
    });
  } else {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }
};

const listMember = async (req, res) => {
  let { pageno, limit } = req.body;

  if (!pageno || !limit) {
    return res.status(200).json({
      code: 0,
      msg: "No more data",
      data: {
        gameslist: [],
      },
      status: false,
    });
  }

  if (pageno < 0 || limit < 0) {
    return res.status(200).json({
      code: 0,
      msg: "No more data",
      data: {
        gameslist: [],
      },
      status: false,
    });
  }
  const [users] = await connection.query(
    `SELECT * FROM users WHERE veri = 1  ORDER BY id DESC LIMIT ${pageno}, ${limit} `
  );
  const [total_users] = await connection.query(
    `SELECT * FROM users WHERE veri = 1`
  );
  return res.status(200).json({
    message: "Success",
    status: true,
    datas: users,
    page_total: Math.ceil(total_users.length / limit),
  });
};



const listAgents = async (req, res) => {
  let { pageno, limit } = req.body;

  if (!pageno || !limit) {
    return res.status(200).json({
      code: 0,
      msg: "No more data",
      data: {
        gameslist: [],
      },
      status: false,
    });
  }

  if (pageno < 0 || limit < 0) {
    return res.status(200).json({
      code: 0,
      msg: "No more data",
      data: {
        gameslist: [],
      },
      status: false,
    });
  }
  const [users] = await connection.query(
    `SELECT * FROM users WHERE level = 2  ORDER BY id DESC LIMIT ${pageno}, ${limit} `
  );
  const [total_users] = await connection.query(
    `SELECT * FROM users WHERE veri = 1`
  );
  return res.status(200).json({
    message: "Success",
    status: true,
    datas: users,
    page_total: Math.ceil(total_users.length / limit),
  });
};


const filterMember = async (req, res) => {
  let { pageno, limit, agentId } = req.body;
  // req.body sample { typeid: '1', agentId: '5', language: 'vi' }
  console.log('YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY');
  console.log(req.body);
  limit = 30;
  // if (!pageno || !limit || !agentId) {
  //   return res.status(400).json({
  //     code: 0,
  //     msg: "Invalid request. Missing parameters.",
  //     data: {
  //       gameslist: [],
  //     },
  //     status: false,
  //   });
  // }
  console.log('ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ');

  if (pageno < 0 || limit < 0) {
    return res.status(400).json({
      code: 0,
      msg: "Invalid request. Negative page number or limit.",
      data: {
        gameslist: [],
      },
      status: false,
    });
  }

  console.log('DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD');

  try {
    const [agent] = await connection.query(
      `SELECT * FROM users WHERE id = ?`, [agentId]
    );

    console.log(agent)

    if (!agent || agent.length === 0) {
      return res.status(404).json({
        code: 0,
        msg: "Agent not found.",
        data: {
          gameslist: [],
        },
        status: false,
      });
    }

    let agen = agent[0];

    const [users] = await connection.query(
      `SELECT * FROM users WHERE veri = 1 AND invite = ? ORDER BY id DESC`, [agen.code]
    );

    // const [users] = await connection.query(
    //   `SELECT * FROM users`, []
    // );

    const [totalUsers] = await connection.query(
      `SELECT COUNT(*) as total FROM users WHERE veri = 1 AND invite = ?`, [agen.code]
    );

    // const [totalUsers] = await connection.query(
    //   `SELECT COUNT(*) as total FROM users`, []
    // );


    console.log(users);
    console.log('UIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII');

    return res.status(200).json({
      message: "Success",
      status: true,
      datas: users,
      page_total: Math.ceil(totalUsers[0].total / limit),
    });

  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      code: 0,
      msg: "Internal server error.",
      data: {
        gameslist: [],
      },
      status: false,
    });
  }
};

const filterAgentHistory = async (req, res) => {
  let { agentId, dateFrom, dateTo } = req.body;
  try {
    // Get the user with the given agentId
    const [user] = await connection.query(
      "SELECT * FROM users WHERE id = ?",
      [agentId]
    );

    if (user.length === 0) {
      return res.status(200).json({
        message: "Failed",
        status: false
      });
    }
    let userInfo = user[0];
    console.log(userInfo)

    // Get all the users invited by this agent
    const [invitedUsers] = await connection.query(
      "SELECT * FROM users WHERE referredBy_ID = ?",
      [userInfo.id]
    );
    const [userss] = await connection.query(
      "SELECT * FROM users",
      // [userInfo.code]
    );

    if (invitedUsers.length === 0) {
      return res.status(200).json({
        message: "No invites found",
        status: false,
        data: [],
        totalRecharge: 0
      });
    }

    const invitedUserIds = invitedUsers.map(user => user.id);

    // Log the invited users length and their IDs
    // console.log(`All users:`, userss);
    // console.log(`Invited users count: ${invitedUsers.length}`);
    // console.log(`Invited user IDs: ${invitedUserIds.join(', ')}`);

    if (invitedUserIds.length === 0) {
      return res.status(200).json({
        message: "No invited users found",
        status: false,
        data: [],
        totalRecharge: 0
      });
    }

    // Format the user IDs as a comma-separated string
    const userIdsStr = invitedUserIds.join(',');

    // Fetch the recharge transactions for these users within the specified date range
    const [transactions] = await connection.query(
      `SELECT * FROM recharge 
       WHERE date >= ? AND date <= ? AND user_id IN (${userIdsStr})`,
      [dateFrom, dateTo]
    );
    const [transactions2] = await connection.query(
      `SELECT * FROM recharge 
       WHERE date >= ? AND date <= ?`,
      [dateFrom, dateTo]
    );

    // Log all the transactions before filtering
    console.log("Fetched transactions before filtering:", transactions2);

    // Calculate the total recharge amount
    const totalRecharge = transactions.reduce((total, transaction) => total + transaction.money, 0);

    return res.status(200).json({
      message: "Success",
      status: true,
      data: transactions,
      totalRecharge: totalRecharge
    });

  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      code: 0,
      msg: "Internal server error.",
      data: {
        gameslist: [],
      },
      status: false,
    });
  }
};
const myNetworkData = async (req, res) => {
  console.log("*********")
  let auth = req.cookies.auth;

  if (!auth) {
    return res.status(200).json({
      message: "Failed",
      status: false,
    });
  }

  try {
    // Get the current user using the token from the auth cookie
    const [currentUser] = await connection.query(
      "SELECT * FROM users WHERE `token` = ?",
      [auth]
    );

    if (!currentUser || currentUser.length === 0) {
      return res.status(200).json({
        message: "Failed",
        status: false,
      });
    }

    const currentUserInfo = currentUser[0];
    const agentId = currentUserInfo.id;

    // Get all the users invited by this agent
    const [invitedUsers] = await connection.query(
      "SELECT * FROM users WHERE referredBy_ID = ?",
      [agentId]
    );

    const usersRegistered = invitedUsers.length;

    // Calculate the sum of total deposits for all users
    let totalDeposits = 0;
    let depositNumber = 0;
    invitedUsers.forEach(user => {
      const userDeposits = parseFloat(user.totalDeposits || 0);
      totalDeposits += userDeposits;
      if (userDeposits > 0) {
        depositNumber++;
      }
    });

    return res.status(200).json({
      message: "Success",
      status: true,
      users_registered: usersRegistered,
      total_deposits: totalDeposits,
      deposit_number: depositNumber
    });

  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      code: 0,
      msg: "Internal server error.",
      status: false,
    });
  }
};

const teamNetworkData = async (req, res) => {
  console.log("*********");
  let auth = req.cookies.auth;

  if (!auth) {
    return res.status(200).json({
      message: "Failed",
      status: false,
    });
  }

  try {
    // Get the current user using the token from the auth cookie
    const [currentUser] = await connection.query(
      "SELECT * FROM users WHERE `token` = ?",
      [auth]
    );

    if (!currentUser || currentUser.length === 0) {
      return res.status(200).json({
        message: "Failed",
        status: false,
      });
    }

    const currentUserInfo = currentUser[0];
    const agentId = currentUserInfo.id;

    // Get all the users invited by this agent
    const [invitedUsers] = await connection.query(
      "SELECT * FROM users WHERE referredBy_ID = ?",
      [agentId]
    );

    if (invitedUsers.length === 0) {
      return res.status(200).json({
        message: "Success",
        status: true,
        users_registered: 0,
        total_deposits: 0,
        deposit_number: 0
      });
    }

    // Get all the users referred by the invited users (2-step users)
    let twoStepUsers = [];
    for (let user of invitedUsers) {
      const [referredUsers] = await connection.query(
        "SELECT * FROM users WHERE referredBy_ID = ?",
        [user.id]
      );
      twoStepUsers = twoStepUsers.concat(referredUsers);
    }

    const usersRegistered = twoStepUsers.length;

    // Calculate the sum of total deposits for all 2-step users
    let totalDeposits = 0;
    let depositNumber = 0;
    twoStepUsers.forEach(user => {
      const userDeposits = parseFloat(user.totalDeposits || 0);
      totalDeposits += userDeposits;
      if (userDeposits > 0) {
        depositNumber++;
      }
    });

    return res.status(200).json({
      message: "Success",
      status: true,
      users_registered: usersRegistered,
      total_deposits: totalDeposits,
      deposit_number: depositNumber
    });

  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      code: 0,
      msg: "Internal server error.",
      status: false,
    });
  }
};



// const filterAgentHistory = async (req, res) => {
//   let { agentId, dateFrom, dateTo } = req.body;
//   try {
//     // Get all the user with agentId
//     const [user] = await connection.query(
//       "SELECT * FROM users WHERE id = ?",
//       [agentId]
//     );

//     if (user.length === 0) {
//       return res.status(200).json({
//         message: "Failed",
//         status: false
//       });
//     }
//     let userInfo = user[0];

//     // Get all the users invited by this agent
//     const [invitedUsers] = await connection.query(
//       "SELECT * FROM users WHERE invite = ?",
//       [userInfo.code]
//     );

//     if (invitedUsers.length === 0) {
//       return res.status(200).json({
//         message: "No invites found",
//         status: false,
//         data: [],
//         totalRecharge: 0
//       });
//     }

//     const invitedUserIds = invitedUsers.map(user => user.id);

//     // Fetch the recharge transactions for these users within the specified date range
//     const [transactions] = await connection.query(
//       `SELECT * FROM recharge 
//        WHERE date >= ? AND date <= ? AND user_id IN (?)`,
//       [dateFrom, dateTo, invitedUserIds]
//     );

//     // Calculate the total recharge amount
//     const totalRecharge = transactions.reduce((total, transaction) => total + transaction.money, 0);

//     return res.status(200).json({
//       message: "Success",
//       status: true,
//       data: transactions,
//       totalRecharge: totalRecharge
//     });

//   } catch (error) {
//     console.error("Error:", error);
//     return res.status(500).json({
//       code: 0,
//       msg: "Internal server error.",
//       data: {
//         gameslist: [],
//       },
//       status: false,
//     });
//   }
// };



const getSubordinateData = async (req, res) => {
  let auth = req.cookies.auth;
  // console.log(auth ,"***************************")
  if (!auth) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }
  const [rows] = await connection.query(
    "SELECT * FROM users WHERE `token` = ? ",
    [auth]
  );

  if (!rows) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }

  const { id } = rows[0]
  let agentId = id
  let { dateFrom, dateTo } = req.body;
  try {
    // Get all the user with agentId
    const [user] = await connection.query(
      "SELECT * FROM users WHERE id = ?",
      [agentId]
    );

    if (user.length === 0) {
      return res.status(200).json({
        message: "Failed",
        status: false
      });
    }

    let userInfo = user[0];

    // Get all the users invited by this agent
    const [invitedUsers] = await connection.query(
      "SELECT * FROM users WHERE invite = ?",
      [userInfo.code]
    );

    if (invitedUsers.length === 0) {
      return res.status(200).json({
        message: "No invites found",
        status: false,
        data: [],
        totalRecharge: 0
      });
    }

    const invitedUserIds = invitedUsers.map(user => user.id);

    // Fetch the recharge transactions for these users within the specified date range
    const [transactions] = await connection.query(
      `SELECT * FROM recharge 
       WHERE date >= ? AND date <= ? AND user_id IN (?)`,
      [dateFrom, dateTo, invitedUserIds]
    );

    // Calculate the total recharge amount
    const totalRecharge = transactions.reduce((total, transaction) => total + transaction.money, 0);

    return res.status(200).json({
      message: "Success",
      status: true,
      data: transactions,
      totalRecharge: totalRecharge
    });

  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      code: 0,
      msg: "Internal server error.",
      data: {
        gameslist: [],
      },
      status: false,
    });
  }
};



const listAgent = async (req, res) => {
  let { pageno, limit } = req.body;

  // Validate pageno and limit
  if (!pageno || !limit || pageno < 0 || limit < 0) {
    return res.status(200).json({
      code: 0,
      msg: "Invalid page number or limit",
      data: {
        gameslist: [],
      },
      status: false,
    });
  }

  try {
    // Fetch users with verification and level conditions
    const [users] = await connection.query(
      `SELECT * FROM users WHERE veri = 1 AND level = 2 ORDER BY id DESC LIMIT ?, ?`,
      [pageno, limit]
    );

    // Fetch total verified users with level 2
    const [total_users] = await connection.query(
      `SELECT COUNT(*) AS total FROM users WHERE veri = 1 AND level = 2`
    );

    const totalPages = Math.ceil(total_users[0].total / limit);

    return res.status(200).json({
      message: "Success",
      status: true,
      data: users,
      page_total: totalPages,
    });
  } catch (error) {
    console.error("Error retrieving agent list:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      status: false,
    });
  }
};


const listCTV = async (req, res) => {
  let { pageno, pageto } = req.body;

  if (!pageno || !pageto) {
    return res.status(200).json({
      code: 0,
      msg: "No more data",
      data: {
        gameslist: [],
      },
      status: false,
    });
  }

  if (pageno < 0 || pageto < 0) {
    return res.status(200).json({
      code: 0,
      msg: "No more data",
      data: {
        gameslist: [],
      },
      status: false,
    });
  }
  const [wingo] = await connection.query(
    `SELECT * FROM users WHERE veri = 1 AND level = 2 ORDER BY id DESC LIMIT ${pageno}, ${pageto} `
  );
  return res.status(200).json({
    message: "Success",
    status: true,
    datas: wingo,
  });
};

function formateT2(params) {
  let result = params < 10 ? "0" + params : params;
  return result;
}

function timerJoin2(params = "") {
  let date = "";
  if (params) {
    date = new Date(Number(params));
  } else {
    date = Date.now();
    date = new Date(Number(date));
  }
  let years = formateT2(date.getFullYear());
  let months = formateT2(date.getMonth() + 1);
  let days = formateT2(date.getDate());

  return years + "-" + months + "-" + days;
}

const statistical2 = async (req, res) => {
  const [wingo] = await connection.query(
    `SELECT SUM(money) as total FROM minutes_1 WHERE status = 1 `
  );
  const [wingo2] = await connection.query(
    `SELECT SUM(money) as total FROM minutes_1 WHERE status = 2 `
  );
  const [users] = await connection.query(
    `SELECT COUNT(id) as total FROM users WHERE status = 1 `
  );
  const [users2] = await connection.query(
    `SELECT COUNT(id) as total FROM users WHERE status = 0 `
  );
  const [recharge] = await connection.query(
    `SELECT SUM(money) as total FROM recharge WHERE status = 1 `
  );
  const [withdraw] = await connection.query(
    `SELECT SUM(money) as total FROM withdraw WHERE status = 1 `
  );

  const [recharge_today] = await connection.query(
    `SELECT SUM(money) as total FROM recharge WHERE status = 1 AND today = ?`,
    [timerJoin2()]
  );
  const [withdraw_today] = await connection.query(
    `SELECT SUM(money) as total FROM withdraw WHERE status = 1 AND today = ?`,
    [timerJoin2()]
  );

  let win = wingo[0].total;
  let loss = wingo2[0].total;
  let usersOnline = users[0].total;
  let usersOffline = users2[0].total;
  let recharges = recharge[0].total;
  let withdraws = withdraw[0].total;
  return res.status(200).json({
    message: "Success",
    status: true,
    win: win,
    loss: loss,
    usersOnline: usersOnline,
    usersOffline: usersOffline,
    recharges: recharges,
    withdraws: withdraws,
    rechargeToday: recharge_today[0].total,
    withdrawToday: withdraw_today[0].total,
  });
};

const changeAdmin = async (req, res) => {
  let auth = req.cookies.auth;
  let value = req.body.value;
  let type = req.body.type;
  let typeid = req.body.typeid;

  if (!value || !type || !typeid)
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  let game = "";
  let bs = "";
  if (typeid == "1") {
    game = "wingo1";
    bs = "bs1";
  }
  if (typeid == "2") {
    game = "wingo3";
    bs = "bs3";
  }
  if (typeid == "3") {
    game = "wingo5";
    bs = "bs5";
  }
  if (typeid == "4") {
    game = "wingo10";
    bs = "bs10";
  }
  switch (type) {
    case "change-wingo1":
      await connection.query(`UPDATE admin SET ${game} = ? `, [value]);
      return res.status(200).json({
        message: "Editing results successfully",
        status: true,
        timeStamp: timeNow,
      });
      break;
    case "change-win_rate":
      await connection.query(`UPDATE admin SET ${bs} = ? `, [value]);
      return res.status(200).json({
        message: "Editing win rate successfully",
        status: true,
        timeStamp: timeNow,
      });
      break;

    default:
      return res.status(200).json({
        message: "Failed",
        status: false,
        timeStamp: timeNow,
      });
      break;
  }
};

function formateT(params) {
  let result = params < 10 ? "0" + params : params;
  return result;
}

function timerJoin(params = "") {
  let date = "";
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

const userInfo = async (req, res) => {
  let auth = req.cookies.auth;
  let phone = req.body.phone;
  if (!phone) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }

  const [user] = await connection.query(
    "SELECT * FROM users WHERE phone = ? ",
    [phone]
  );

  if (user.length == 0) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }
  let userInfo = user[0];
  // cấp dưới trực tiếp all
  const [f1s] = await connection.query(
    "SELECT `phone`, `code`,`invite`, `time` FROM users WHERE `invite` = ? ",
    [userInfo.code]
  );

  // cấp dưới trực tiếp hôm nay
  let f1_today = 0;
  for (let i = 0; i < f1s.length; i++) {
    const f1_time = f1s[i].time; // Mã giới thiệu f1
    let check = timerJoin(f1_time) == timerJoin() ? true : false;
    if (check) {
      f1_today += 1;
    }
  }

  // tất cả cấp dưới hôm nay
  let f_all_today = 0;
  for (let i = 0; i < f1s.length; i++) {
    const f1_code = f1s[i].code; // Mã giới thiệu f1
    const f1_time = f1s[i].time; // time f1
    let check_f1 = timerJoin(f1_time) == timerJoin() ? true : false;
    if (check_f1) f_all_today += 1;
    // tổng f1 mời đc hôm nay
    const [f2s] = await connection.query(
      "SELECT `phone`, `code`,`invite`, `time` FROM users WHERE `invite` = ? ",
      [f1_code]
    );
    for (let i = 0; i < f2s.length; i++) {
      const f2_code = f2s[i].code; // Mã giới thiệu f2
      const f2_time = f2s[i].time; // time f2
      let check_f2 = timerJoin(f2_time) == timerJoin() ? true : false;
      if (check_f2) f_all_today += 1;
      // tổng f2 mời đc hôm nay
      const [f3s] = await connection.query(
        "SELECT `phone`, `code`,`invite`, `time` FROM users WHERE `invite` = ? ",
        [f2_code]
      );
      for (let i = 0; i < f3s.length; i++) {
        const f3_code = f3s[i].code; // Mã giới thiệu f3
        const f3_time = f3s[i].time; // time f3
        let check_f3 = timerJoin(f3_time) == timerJoin() ? true : false;
        if (check_f3) f_all_today += 1;
        const [f4s] = await connection.query(
          "SELECT `phone`, `code`,`invite`, `time` FROM users WHERE `invite` = ? ",
          [f3_code]
        );
        // tổng f3 mời đc hôm nay
        for (let i = 0; i < f4s.length; i++) {
          const f4_code = f4s[i].code; // Mã giới thiệu f4
          const f4_time = f4s[i].time; // time f4
          let check_f4 = timerJoin(f4_time) == timerJoin() ? true : false;
          if (check_f4) f_all_today += 1;
          // tổng f3 mời đc hôm nay
        }
      }
    }
  }

  // Tổng số f2
  let f2 = 0;
  for (let i = 0; i < f1s.length; i++) {
    const f1_code = f1s[i].code; // Mã giới thiệu f1
    const [f2s] = await connection.query(
      "SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ",
      [f1_code]
    );
    f2 += f2s.length;
  }

  // Tổng số f3
  let f3 = 0;
  for (let i = 0; i < f1s.length; i++) {
    const f1_code = f1s[i].code; // Mã giới thiệu f1
    const [f2s] = await connection.query(
      "SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ",
      [f1_code]
    );
    for (let i = 0; i < f2s.length; i++) {
      const f2_code = f2s[i].code;
      const [f3s] = await connection.query(
        "SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ",
        [f2_code]
      );
      if (f3s.length > 0) f3 += f3s.length;
    }
  }

  // Tổng số f4
  let f4 = 0;
  for (let i = 0; i < f1s.length; i++) {
    const f1_code = f1s[i].code; // Mã giới thiệu f1
    const [f2s] = await connection.query(
      "SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ",
      [f1_code]
    );
    for (let i = 0; i < f2s.length; i++) {
      const f2_code = f2s[i].code;
      const [f3s] = await connection.query(
        "SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ",
        [f2_code]
      );
      for (let i = 0; i < f3s.length; i++) {
        const f3_code = f3s[i].code;
        const [f4s] = await connection.query(
          "SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ",
          [f3_code]
        );
        if (f4s.length > 0) f4 += f4s.length;
      }
    }
  }
  // console.log("TOTAL_F_TODAY:" + f_all_today);
  // console.log("F1: " + f1s.length);
  // console.log("F2: " + f2);
  // console.log("F3: " + f3);
  // console.log("F4: " + f4);

  const [recharge] = await connection.query(
    "SELECT SUM(`money`) as total FROM recharge WHERE phone = ? AND status = 1 ",
    [phone]
  );
  const [withdraw] = await connection.query(
    "SELECT SUM(`money`) as total FROM withdraw WHERE phone = ? AND status = 1 ",
    [phone]
  );
  const [bank_user] = await connection.query(
    "SELECT * FROM user_bank WHERE phone = ? ",
    [phone]
  );
  const [telegram_ctv] = await connection.query(
    "SELECT `telegram` FROM point_list WHERE phone = ? ",
    [userInfo.ctv]
  );
  const [ng_moi] = await connection.query(
    "SELECT `phone` FROM users WHERE code = ? ",
    [userInfo.invite]
  );
  return res.status(200).json({
    message: "Success",
    status: true,
    datas: user,
    total_r: recharge,
    total_w: withdraw,
    f1: f1s.length,
    f2: f2,
    f3: f3,
    f4: f4,
    bank_user: bank_user,
    telegram: telegram_ctv[0],
    ng_moi: ng_moi[0],
    daily: userInfo.ctv,
  });
};

const recharge = async (req, res) => {
  let auth = req.cookies.auth;
  if (!auth) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }

  const [recharge] = await connection.query(
    "SELECT * FROM recharge WHERE status = 0 "
  );
  const [recharge2] = await connection.query(
    "SELECT * FROM recharge WHERE status != 0 "
  );
  const [withdraw] = await connection.query(
    "SELECT * FROM withdraw WHERE status = 0 "
  );
  const [withdraw2] = await connection.query(
    "SELECT * FROM withdraw WHERE status != 0 "
  );
  return res.status(200).json({
    message: "Success",
    status: true,
    datas: recharge,
    datas2: recharge2,
    datas3: withdraw,
    datas4: withdraw2,
  });
};

const settingGet = async (req, res) => {
  let auth = req.cookies.auth;
  if (!auth) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }

  const [bank_recharge] = await connection.query(
    "SELECT * FROM bank_recharge "
  );
  const [settings] = await connection.query("SELECT * FROM admin ");
  return res.status(200).json({
    message: "Success",
    status: true,
    settings: settings,
    datas: bank_recharge,
  });
};

const rechargeDuyet = async (req, res) => {
  let auth = req.cookies.auth;
  let id = req.body.id;
  let type = req.body.type;
  if (!auth || !id || !type) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }
  if (type == "confirm") {
    await connection.query(`UPDATE recharge SET status = 1 WHERE id = ?`, [id]);
    const [info] = await connection.query(
      `SELECT * FROM recharge WHERE id = ?`,
      [id]
    );
    const [userinfo] = await connection.query(
      `SELECT * FROM users WHERE phone = ?`,
      [info[0].phone]
    );
    const [rechcount] = await connection.query(
      `SELECT COUNT(*) as rech_count FROM recharge WHERE phone = ? AND  status = 1  `,
      [info[0].phone]
    );
    await connection.query(
      "UPDATE users SET money = money + ?, total_money = total_money + ? WHERE phone = ? ",
      [info[0].money, info[0].money, info[0].phone]
    );
    if (rechcount[0].rech_count == "1") {
      await connection.query(
        "UPDATE users SET money = money + ?, total_money = total_money + ? WHERE code = ? ",
        [100, 100, userinfo[0].invite]
      );
    }
    return res.status(200).json({
      message: "Successful application confirmation",
      status: true,
      datas: recharge,
    });
  }
  if (type == "delete") {
    await connection.query(`UPDATE recharge SET status = 2 WHERE id = ?`, [id]);

    return res.status(200).json({
      message: "Cancellation successful",
      status: true,
      datas: recharge,
    });
  }
};

const handlWithdraw = async (req, res) => {
  let auth = req.cookies.auth;
  let id = req.body.id;
  let type = req.body.type;
  if (!auth || !id || !type) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }
  if (type == "confirm") {
    await connection.query(`UPDATE withdraw SET status = 1 WHERE id = ?`, [id]);
    const [info] = await connection.query(
      `SELECT * FROM withdraw WHERE id = ?`,
      [id]
    );
    return res.status(200).json({
      message: "Successful application confirmation",
      status: true,
      datas: recharge,
    });
  }
  if (type == "delete") {
    await connection.query(`UPDATE withdraw SET status = 2 WHERE id = ?`, [id]);
    const [info] = await connection.query(
      `SELECT * FROM withdraw WHERE id = ?`,
      [id]
    );
    await connection.query(
      "UPDATE users SET money = money + ? WHERE phone = ? ",
      [info[0].money, info[0].phone]
    );
    return res.status(200).json({
      message: "Cancel successfully",
      status: true,
      datas: recharge,
    });
  }
};

const settingBank = async (req, res) => {
  let auth = req.cookies.auth;
  let name_bank = req.body.name_bank;
  let name = req.body.name;
  let info = req.body.info;
  let upi = req.body.upi;
  let typer = req.body.typer;
  if (!auth || !typer) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }
  if (typer == "bank") {
    await connection.query(
      `UPDATE bank_recharge SET name_bank = ?, name_user = ?, stk = ?, upi = ? WHERE type = 'bank'`,
      [name_bank, name, info, upi]
    );
    return res.status(200).json({
      message: "Successful change",
      status: true,
      datas: recharge,
    });
  }
  if (typer == "momo") {
    await connection.query(
      `UPDATE bank_recharge SET name_bank = ?, name_user = ?, stk = ?, upi = ? WHERE type = 'momo'`,
      [name_bank, name, info, upi]
    );
    return res.status(200).json({
      message: "Successful change",
      status: true,
      datas: recharge,
    });
  }
};

const settingCskh = async (req, res) => {
  let auth = req.cookies.auth;
  let telegram = req.body.telegram;
  let whatsapp = req.body.whatsapp;

  let cskh = req.body.cskh;
  let myapp_web = req.body.myapp_web;
  if (!auth || !cskh || !telegram) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }
  await connection.query(`UPDATE admin SET telegram = ?, cskh = ?, app = ?, whatsapp = ?`, [
    telegram,
    cskh,
    myapp_web,
    whatsapp
  ]);
  return res.status(200).json({
    message: "Successful change",
    status: true,
  });
};

const banned = async (req, res) => {
  let auth = req.cookies.auth;
  let id = req.body.id;
  let type = req.body.type;
  if (!auth || !id) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }
  if (type == "open") {
    await connection.query(`UPDATE users SET status = 1 WHERE id = ?`, [id]);
  }
  if (type == "close") {
    await connection.query(`UPDATE users SET status = 2 WHERE id = ?`, [id]);
  }
  return res.status(200).json({
    message: "Successful change",
    status: true,
  });
};

const createBonus = async (req, res) => {
  const randomString = (length) => {
    var result = "";
    var characters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  };
  function timerJoin(params = "") {
    let date = "";
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
    return years + "" + months + "" + days;
  }
  const d = new Date();
  const time = d.getTime();

  let auth = req.cookies.auth;
  let money = req.body.money;
  let type = req.body.type;
  let giftType = req.body.giftType;
  let giftCode = req.body.giftCode;


  if (!money || !auth) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }
  const [user] = await connection.query(
    "SELECT * FROM users WHERE token = ? ",
    [auth]
  );

  if (user.length == 0) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }
  let userInfo = user[0];

  if (type == "all") {
    let select = req.body.select;
    if (select == "1") {
      await connection.query(
        `UPDATE point_list SET money = money + ? WHERE level = 2`,
        [money]
      );
    } else {
      await connection.query(
        `UPDATE point_list SET money = money - ? WHERE level = 2`,
        [money]
      );
    }
    return res.status(200).json({
      message: "Successful change",
      status: true,
    });
  }

  if (type == "two") {
    let select = req.body.select;
    if (select == "1") {
      await connection.query(
        `UPDATE point_list SET money_us = money_us + ? WHERE level = 2`,
        [money]
      );
    } else {
      await connection.query(
        `UPDATE point_list SET money_us = money_us - ? WHERE level = 2`,
        [money]
      );
    }
    return res.status(200).json({
      message: "Successful change",
      status: true,
    });
  }

  if (type == "one") {
    let select = req.body.select;
    let phone = req.body.phone;
    const [user] = await connection.query(
      "SELECT * FROM point_list WHERE phone = ? ",
      [phone]
    );
    if (user.length == 0) {
      return res.status(200).json({
        message: "Failed",
        status: false,
        timeStamp: timeNow,
      });
    }
    if (select == "1") {
      await connection.query(
        `UPDATE point_list SET money = money + ? WHERE level = 2 and phone = ?`,
        [money, phone]
      );
    } else {
      await connection.query(
        `UPDATE point_list SET money = money - ? WHERE level = 2 and phone = ?`,
        [money, phone]
      );
    }
    return res.status(200).json({
      message: "Successful change",
      status: true,
    });
  }

  if (type == "three") {
    let select = req.body.select;
    let phone = req.body.phone;
    const [user] = await connection.query(
      "SELECT * FROM point_list WHERE phone = ? ",
      [phone]
    );
    if (user.length == 0) {
      return res.status(200).json({
        message: "Successfully",
        status: false,
        timeStamp: timeNow,
      });
    }
    if (select == "1") {
      await connection.query(
        `UPDATE point_list SET money_us = money_us + ? WHERE level = 2 and phone = ?`,
        [money, phone]
      );
    } else {
      await connection.query(
        `UPDATE point_list SET money_us = money_us - ? WHERE level = 2 and phone = ?`,
        [money, phone]
      );
    }
    return res.status(200).json({
      message: "Successful change",
      status: true,
    });
  }

  if (!type) {
    let id_redenvelops = String(timerJoin()) + randomString(16);
    let sql = `INSERT INTO redenvelopes SET id_redenvelope = ?, phone = ?, money = ?, used = ?, amount = ?, status = ?, time = ?, gift_type = ?`;
    console.log('GGGGGGGGGGGGGGGGGGGGGGGGGGGGG');
    console.log(sql);
    await connection.query(sql, [
      giftCode,
      userInfo.phone,
      money,
      1,
      1,
      0,
      time,
      giftType,
    ]);
    return res.status(200).json({
      message: "Successful change",
      status: true,
      id: id_redenvelops,
      money: money,
      giftCode: giftCode,
      time: time,
      user: user.phone
    });
  }
};

const listRedenvelops = async (req, res) => {
  let auth = req.cookies.auth;

  let [redenvelopes] = await connection.query(
    "SELECT * FROM redenvelopes WHERE status = 0 "
  );
  return res.status(200).json({
    message: "Successful change",
    status: true,
    redenvelopes: redenvelopes,
  });
};

const settingbuff = async (req, res) => {
  let auth = req.cookies.auth;
  let id_user = req.body.id_user;
  let buff_acc = req.body.buff_acc;
  let money_value = req.body.money_value;
  if (!id_user || !buff_acc || !money_value) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }
  const [user_id] = await connection.query(
    `SELECT * FROM users WHERE id_user = ?`,
    [id_user]
  );

  if (user_id.length > 0) {
    if (buff_acc == "1") {
      await connection.query(
        `UPDATE users SET money = money + ? WHERE id_user = ?`,
        [money_value, id_user]
      );
    }
    if (buff_acc == "2") {
      await connection.query(
        `UPDATE users SET money = money - ? WHERE id_user = ?`,
        [money_value, id_user]
      );
    }
    return res.status(200).json({
      message: "Successful change",
      status: true,
    });
  } else {
    return res.status(200).json({
      message: "Successful change",
      status: false,
    });
  }
};
const randomNumber = (min, max) => {
  return String(Math.floor(Math.random() * (max - min + 1)) + min);
};

const randomString = (length) => {
  var result = "";
  var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const ipAddress = (req) => {
  let ip = "";
  if (req.headers["x-forwarded-for"]) {
    ip = req.headers["x-forwarded-for"].split(",")[0];
  } else if (req.connection && req.connection.remoteAddress) {
    ip = req.connection.remoteAddress;
  } else {
    ip = req.ip;
  }
  return ip;
};

const timeCreate = () => {
  const d = new Date();
  const time = d.getTime();
  return time;
};

const register = async (req, res) => {
  let { username, password, invitecode } = req.body;
  let id_user = randomNumber(10000, 99999);
  let name_user = "Member" + randomNumber(10000, 99999);
  let code = randomString(5) + randomNumber(10000, 99999);
  let ip = ipAddress(req);
  let time = timeCreate();

  invitecode = "2cOCs36373";

  if (!username || !password || !invitecode) {
    return res.status(200).json({
      message: "ERROR!!!",
      status: false,
    });
  }

  if (!username) {
    return res.status(200).json({
      message: "phone error",
      status: false,
    });
  }

  try {
    const [check_u] = await connection.query(
      "SELECT * FROM users WHERE phone = ? ",
      [username]
    );
    if (check_u.length == 1) {
      return res.status(200).json({
        message: "注册账户", //Số điện thoại đã được đăng ký
        status: false,
      });
    } else {
      const sql = `INSERT INTO users SET 
            id_user = ?,
            phone = ?,
            name_user = ?,
            password = ?,
            money = ?,
            level = ?,
            code = ?,
            invite = ?,
            veri = ?,
            ip_address = ?,
            status = ?,
            time = ?`;
      await connection.execute(sql, [
        id_user,
        username,
        name_user,
        md5(password),
        0,
        2,
        code,
        invitecode,
        1,
        ip,
        1,
        time,
      ]);
      await connection.execute(
        "INSERT INTO point_list SET phone = ?, level = 2",
        [username]
      );
      return res.status(200).json({
        message: "注册成功", //Register Sucess
        status: true,
      });
    }
  } catch (error) {
    if (error) console.log(error);
  }
};

const profileUser = async (req, res) => {
  let phone = req.body.phone;
  if (!phone) {
    return res.status(200).json({
      message: "Phone Error",
      status: false,
      timeStamp: timeNow,
    });
  }
  let [user] = await connection.query(`SELECT * FROM users WHERE phone = ?`, [
    phone,
  ]);

  if (user.length == 0) {
    return res.status(200).json({
      message: "Phone Error",
      status: false,
      timeStamp: timeNow,
    });
  }
  let [recharge] = await connection.query(
    `SELECT * FROM recharge WHERE phone = ? ORDER BY id DESC LIMIT 10`,
    [phone]
  );
  let [withdraw] = await connection.query(
    `SELECT * FROM withdraw WHERE phone = ? ORDER BY id DESC LIMIT 10`,
    [phone]
  );
  return res.status(200).json({
    message: "Nhận thành công",
    status: true,
    recharge: recharge,
    withdraw: withdraw,
  });
};

const infoCtv = async (req, res) => {
  const phone = req.body.phone;

  const [user] = await connection.query(
    "SELECT * FROM users WHERE phone = ? ",
    [phone]
  );

  if (user.length == 0) {
    return res.status(200).json({
      message: "Phone Error",
      status: false,
    });
  }
  let userInfo = user[0];
  // cấp dưới trực tiếp all
  const [f1s] = await connection.query(
    "SELECT `phone`, `code`,`invite`, `time` FROM users WHERE `invite` = ? ",
    [userInfo.code]
  );

  // cấp dưới trực tiếp hôm nay
  let f1_today = 0;
  for (let i = 0; i < f1s.length; i++) {
    const f1_time = f1s[i].time; // Mã giới thiệu f1
    let check = timerJoin(f1_time) == timerJoin() ? true : false;
    if (check) {
      f1_today += 1;
    }
  }

  // tất cả cấp dưới hôm nay
  let f_all_today = 0;
  for (let i = 0; i < f1s.length; i++) {
    const f1_code = f1s[i].code; // Mã giới thiệu f1
    const f1_time = f1s[i].time; // time f1
    let check_f1 = timerJoin(f1_time) == timerJoin() ? true : false;
    if (check_f1) f_all_today += 1;
    // tổng f1 mời đc hôm nay
    const [f2s] = await connection.query(
      "SELECT `phone`, `code`,`invite`, `time` FROM users WHERE `invite` = ? ",
      [f1_code]
    );
    for (let i = 0; i < f2s.length; i++) {
      const f2_code = f2s[i].code; // Mã giới thiệu f2
      const f2_time = f2s[i].time; // time f2
      let check_f2 = timerJoin(f2_time) == timerJoin() ? true : false;
      if (check_f2) f_all_today += 1;
      // tổng f2 mời đc hôm nay
      const [f3s] = await connection.query(
        "SELECT `phone`, `code`,`invite`, `time` FROM users WHERE `invite` = ? ",
        [f2_code]
      );
      for (let i = 0; i < f3s.length; i++) {
        const f3_code = f3s[i].code; // Mã giới thiệu f3
        const f3_time = f3s[i].time; // time f3
        let check_f3 = timerJoin(f3_time) == timerJoin() ? true : false;
        if (check_f3) f_all_today += 1;
        const [f4s] = await connection.query(
          "SELECT `phone`, `code`,`invite`, `time` FROM users WHERE `invite` = ? ",
          [f3_code]
        );
        // tổng f3 mời đc hôm nay
        for (let i = 0; i < f4s.length; i++) {
          const f4_code = f4s[i].code; // Mã giới thiệu f4
          const f4_time = f4s[i].time; // time f4
          let check_f4 = timerJoin(f4_time) == timerJoin() ? true : false;
          if (check_f4) f_all_today += 1;
          // tổng f3 mời đc hôm nay
        }
      }
    }
  }

  // Tổng số f2
  let f2 = 0;
  for (let i = 0; i < f1s.length; i++) {
    const f1_code = f1s[i].code; // Mã giới thiệu f1
    const [f2s] = await connection.query(
      "SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ",
      [f1_code]
    );
    f2 += f2s.length;
  }

  // Tổng số f3
  let f3 = 0;
  for (let i = 0; i < f1s.length; i++) {
    const f1_code = f1s[i].code; // Mã giới thiệu f1
    const [f2s] = await connection.query(
      "SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ",
      [f1_code]
    );
    for (let i = 0; i < f2s.length; i++) {
      const f2_code = f2s[i].code;
      const [f3s] = await connection.query(
        "SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ",
        [f2_code]
      );
      if (f3s.length > 0) f3 += f3s.length;
    }
  }

  // Tổng số f4
  let f4 = 0;
  for (let i = 0; i < f1s.length; i++) {
    const f1_code = f1s[i].code; // Mã giới thiệu f1
    const [f2s] = await connection.query(
      "SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ",
      [f1_code]
    );
    for (let i = 0; i < f2s.length; i++) {
      const f2_code = f2s[i].code;
      const [f3s] = await connection.query(
        "SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ",
        [f2_code]
      );
      for (let i = 0; i < f3s.length; i++) {
        const f3_code = f3s[i].code;
        const [f4s] = await connection.query(
          "SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ",
          [f3_code]
        );
        if (f4s.length > 0) f4 += f4s.length;
      }
    }
  }

  const [list_mem] = await connection.query(
    "SELECT * FROM users WHERE ctv = ? AND status = 1 AND veri = 1 ",
    [phone]
  );
  const [list_mem_baned] = await connection.query(
    "SELECT * FROM users WHERE ctv = ? AND status = 2 AND veri = 1 ",
    [phone]
  );
  let total_recharge = 0;
  let total_withdraw = 0;
  for (let i = 0; i < list_mem.length; i++) {
    let phone = list_mem[i].phone;
    const [recharge] = await connection.query(
      "SELECT SUM(money) as money FROM recharge WHERE phone = ? AND status = 1 ",
      [phone]
    );
    const [withdraw] = await connection.query(
      "SELECT SUM(money) as money FROM withdraw WHERE phone = ? AND status = 1 ",
      [phone]
    );
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
    const [recharge_today] = await connection.query(
      "SELECT `money`, `time` FROM recharge WHERE phone = ? AND status = 1 ",
      [phone]
    );
    const [withdraw_today] = await connection.query(
      "SELECT `money`, `time` FROM withdraw WHERE phone = ? AND status = 1 ",
      [phone]
    );
    for (let i = 0; i < recharge_today.length; i++) {
      let today = timerJoin();
      let time = timerJoin(recharge_today[i].time);
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
    const [wins] = await connection.query(
      "SELECT `money`, `time` FROM minutes_1 WHERE phone = ? AND status = 1 ",
      [phone]
    );
    const [losses] = await connection.query(
      "SELECT `money`, `time` FROM minutes_1 WHERE phone = ? AND status = 2 ",
      [phone]
    );
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
  const [list_mem_today] = await connection.query(
    "SELECT * FROM users WHERE ctv = ? AND status = 1 AND veri = 1 ",
    [phone]
  );
  for (let i = 0; i < list_mem_today.length; i++) {
    let today = timerJoin();
    let time = timerJoin(list_mem_today[i].time);
    if (time == today) {
      list_mems.push(list_mem_today[i]);
    }
  }

  const [point_list] = await connection.query(
    "SELECT * FROM point_list WHERE phone = ? ",
    [phone]
  );
  let moneyCTV = point_list[0].money;

  let list_recharge_news = [];
  let list_withdraw_news = [];
  for (let i = 0; i < list_mem.length; i++) {
    let phone = list_mem[i].phone;
    const [recharge_today] = await connection.query(
      "SELECT `id`, `status`, `type`,`phone`, `money`, `time` FROM recharge WHERE phone = ? AND status = 1 ",
      [phone]
    );
    const [withdraw_today] = await connection.query(
      "SELECT `id`, `status`,`phone`, `money`, `time` FROM withdraw WHERE phone = ? AND status = 1 ",
      [phone]
    );
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

  const [redenvelopes_used] = await connection.query(
    "SELECT * FROM redenvelopes_used WHERE phone = ? ",
    [phone]
  );
  let redenvelopes_used_today = [];
  for (let i = 0; i < redenvelopes_used.length; i++) {
    let today = timerJoin();
    let time = timerJoin(redenvelopes_used[i].time);
    if (time == today) {
      redenvelopes_used_today.push(redenvelopes_used[i]);
    }
  }

  const [financial_details] = await connection.query(
    "SELECT * FROM financial_details WHERE phone = ? ",
    [phone]
  );
  let financial_details_today = [];
  for (let i = 0; i < financial_details.length; i++) {
    let today = timerJoin();
    let time = timerJoin(financial_details[i].time);
    if (time == today) {
      financial_details_today.push(financial_details[i]);
    }
  }

  return res.status(200).json({
    message: "Success",
    status: true,
    datas: user,
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
};

const infoCtv2 = async (req, res) => {
  const phone = req.body.phone;
  const timeDate = req.body.timeDate;

  function timerJoin(params = "") {
    let date = "";
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
    return years + "-" + months + "-" + days;
  }

  const [user] = await connection.query(
    "SELECT * FROM users WHERE phone = ? ",
    [phone]
  );

  if (user.length == 0) {
    return res.status(200).json({
      message: "Phone Error",
      status: false,
    });
  }
  let userInfo = user[0];
  const [list_mem] = await connection.query(
    "SELECT * FROM users WHERE ctv = ? AND status = 1 AND veri = 1 ",
    [phone]
  );

  let list_mems = [];
  const [list_mem_today] = await connection.query(
    "SELECT * FROM users WHERE ctv = ? AND status = 1 AND veri = 1 ",
    [phone]
  );
  for (let i = 0; i < list_mem_today.length; i++) {
    let today = timeDate;
    let time = timerJoin(list_mem_today[i].time);
    if (time == today) {
      list_mems.push(list_mem_today[i]);
    }
  }

  let list_recharge_news = [];
  let list_withdraw_news = [];
  for (let i = 0; i < list_mem.length; i++) {
    let phone = list_mem[i].phone;
    const [recharge_today] = await connection.query(
      "SELECT `id`, `status`, `type`,`phone`, `money`, `time` FROM recharge WHERE phone = ? AND status = 1 ",
      [phone]
    );
    const [withdraw_today] = await connection.query(
      "SELECT `id`, `status`,`phone`, `money`, `time` FROM withdraw WHERE phone = ? AND status = 1 ",
      [phone]
    );
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

  const [redenvelopes_used] = await connection.query(
    "SELECT * FROM redenvelopes_used WHERE phone = ? ",
    [phone]
  );
  let redenvelopes_used_today = [];
  for (let i = 0; i < redenvelopes_used.length; i++) {
    let today = timeDate;
    let time = timerJoin(redenvelopes_used[i].time);
    if (time == today) {
      redenvelopes_used_today.push(redenvelopes_used[i]);
    }
  }

  const [financial_details] = await connection.query(
    "SELECT * FROM financial_details WHERE phone = ? ",
    [phone]
  );
  let financial_details_today = [];
  for (let i = 0; i < financial_details.length; i++) {
    let today = timeDate;
    let time = timerJoin(financial_details[i].time);
    if (time == today) {
      financial_details_today.push(financial_details[i]);
    }
  }

  return res.status(200).json({
    message: "Success",
    status: true,
    datas: user,
    list_mems: list_mems,
    list_recharge_news: list_recharge_news,
    list_withdraw_news: list_withdraw_news,
    redenvelopes_used: redenvelopes_used_today,
    financial_details_today: financial_details_today,
  });
};

const listRechargeMem = async (req, res) => {
  let auth = req.cookies.auth;
  let phone = req.params.phone;
  let { pageno, limit } = req.body;

  if (!pageno || !limit) {
    return res.status(200).json({
      code: 0,
      msg: "No more data",
      data: {
        gameslist: [],
      },
      status: false,
    });
  }

  if (pageno < 0 || limit < 0) {
    return res.status(200).json({
      code: 0,
      msg: "No more data",
      data: {
        gameslist: [],
      },
      status: false,
    });
  }

  if (!phone) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }

  const [user] = await connection.query(
    "SELECT * FROM users WHERE phone = ? ",
    [phone]
  );
  const [auths] = await connection.query(
    "SELECT * FROM users WHERE token = ? ",
    [auth]
  );

  if (user.length == 0 || auths.length == 0) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }
  let { token, password, otp, level, ...userInfo } = user[0];

  const [recharge] = await connection.query(
    `SELECT * FROM recharge WHERE phone = ? ORDER BY id DESC LIMIT ${pageno}, ${limit} `,
    [phone]
  );
  const [total_users] = await connection.query(
    `SELECT * FROM recharge WHERE phone = ?`,
    [phone]
  );
  return res.status(200).json({
    message: "Success",
    status: true,
    datas: recharge,
    page_total: Math.ceil(total_users.length / limit),
  });
};

const listWithdrawMem = async (req, res) => {
  let auth = req.cookies.auth;
  let phone = req.params.phone;
  let { pageno, limit } = req.body;

  if (!pageno || !limit) {
    return res.status(200).json({
      code: 0,
      msg: "No more data",
      data: {
        gameslist: [],
      },
      status: false,
    });
  }

  if (pageno < 0 || limit < 0) {
    return res.status(200).json({
      code: 0,
      msg: "No more data",
      data: {
        gameslist: [],
      },
      status: false,
    });
  }

  if (!phone) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }

  const [user] = await connection.query(
    "SELECT * FROM users WHERE phone = ? ",
    [phone]
  );
  const [auths] = await connection.query(
    "SELECT * FROM users WHERE token = ? ",
    [auth]
  );

  if (user.length == 0 || auths.length == 0) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }
  let { token, password, otp, level, ...userInfo } = user[0];

  const [withdraw] = await connection.query(
    `SELECT * FROM withdraw WHERE phone = ? ORDER BY id DESC LIMIT ${pageno}, ${limit} `,
    [phone]
  );
  const [total_users] = await connection.query(
    `SELECT * FROM withdraw WHERE phone = ?`,
    [phone]
  );
  return res.status(200).json({
    message: "Success",
    status: true,
    datas: withdraw,
    page_total: Math.ceil(total_users.length / limit),
  });
};

const listRedenvelope = async (req, res) => {
  let auth = req.cookies.auth;
  let phone = req.params.phone;
  let { pageno, limit } = req.body;

  if (!pageno || !limit) {
    return res.status(200).json({
      code: 0,
      msg: "No more data",
      data: {
        gameslist: [],
      },
      status: false,
    });
  }

  if (pageno < 0 || limit < 0) {
    return res.status(200).json({
      code: 0,
      msg: "No more data",
      data: {
        gameslist: [],
      },
      status: false,
    });
  }

  if (!phone) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }

  const [user] = await connection.query(
    "SELECT * FROM users WHERE phone = ? ",
    [phone]
  );
  const [auths] = await connection.query(
    "SELECT * FROM users WHERE token = ? ",
    [auth]
  );

  if (user.length == 0 || auths.length == 0) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }
  let { token, password, otp, level, ...userInfo } = user[0];

  const [redenvelopes_used] = await connection.query(
    `SELECT * FROM redenvelopes_used WHERE phone_used = ? ORDER BY id DESC LIMIT ${pageno}, ${limit} `,
    [phone]
  );
  const [total_users] = await connection.query(
    `SELECT * FROM redenvelopes_used WHERE phone_used = ?`,
    [phone]
  );
  return res.status(200).json({
    message: "Success",
    status: true,
    datas: redenvelopes_used,
    page_total: Math.ceil(total_users.length / limit),
  });
};

const listBet = async (req, res) => {
  let auth = req.cookies.auth;
  let phone = req.params.phone;
  let { pageno, limit } = req.body;

  if (!pageno || !limit) {
    return res.status(200).json({
      code: 0,
      msg: "No more data",
      data: {
        gameslist: [],
      },
      status: false,
    });
  }

  if (pageno < 0 || limit < 0) {
    return res.status(200).json({
      code: 0,
      msg: "No more data",
      data: {
        gameslist: [],
      },
      status: false,
    });
  }

  if (!phone) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }

  const [user] = await connection.query(
    "SELECT * FROM users WHERE phone = ? ",
    [phone]
  );
  const [auths] = await connection.query(
    "SELECT * FROM users WHERE token = ? ",
    [auth]
  );

  if (user.length == 0 || auths.length == 0) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }
  let { token, password, otp, level, ...userInfo } = user[0];

  const [listBet] = await connection.query(
    `SELECT * FROM minutes_1 WHERE phone = ? AND status != 0 ORDER BY id DESC LIMIT ${pageno}, ${limit} `,
    [phone]
  );
  const [total_users] = await connection.query(
    `SELECT * FROM minutes_1 WHERE phone = ? AND status != 0`,
    [phone]
  );
  return res.status(200).json({
    message: "Success",
    status: true,
    datas: listBet,
    page_total: Math.ceil(total_users.length / limit),
  });
};

const listOrderOld = async (req, res) => {
  let { gameJoin } = req.body;

  let checkGame = ["1", "3", "5", "10"].includes(String(gameJoin));
  if (!checkGame) {
    return res.status(200).json({
      code: 0,
      msg: "No more data",
      data: {
        gameslist: [],
      },
      status: false,
    });
  }
  let game = Number(gameJoin);

  let join = "";
  if (game == 1) join = "k5d";
  if (game == 3) join = "k5d3";
  if (game == 5) join = "k5d5";
  if (game == 10) join = "k5d10";

  const [k5d] = await connection.query(
    `SELECT * FROM 5d WHERE status != 0 AND game = '${game}' ORDER BY id DESC LIMIT 10 `
  );
  const [period] = await connection.query(
    `SELECT period FROM 5d WHERE status = 0 AND game = '${game}' ORDER BY id DESC LIMIT 1 `
  );
  const [waiting] = await connection.query(
    `SELECT phone, money, price, amount, bet FROM result_5d WHERE status = 0 AND level = 0 AND game = '${game}' ORDER BY id ASC `
  );
  const [settings] = await connection.query(`SELECT ${join} FROM admin`);
  if (k5d.length == 0) {
    return res.status(200).json({
      code: 0,
      msg: "No more data",
      data: {
        gameslist: [],
      },
      status: false,
    });
  }
  if (!k5d[0] || !period[0]) {
    return res.status(200).json({
      message: "Error!",
      status: false,
    });
  }
  return res.status(200).json({
    code: 0,
    msg: "Nhận thành công",
    data: {
      gameslist: k5d,
    },
    bet: waiting,
    settings: settings,
    join: join,
    period: period[0].period,
    status: true,
  });
};

const listOrderOldK3 = async (req, res) => {
  let { gameJoin } = req.body;

  let checkGame = ["1", "3", "5", "10"].includes(String(gameJoin));
  if (!checkGame) {
    return res.status(200).json({
      code: 0,
      msg: "No more data",
      data: {
        gameslist: [],
      },
      status: false,
    });
  }
  let game = Number(gameJoin);

  let join = "";
  if (game == 1) join = "k3d";
  if (game == 3) join = "k3d3";
  if (game == 5) join = "k3d5";
  if (game == 10) join = "k3d10";

  const [k5d] = await connection.query(
    `SELECT * FROM k3 WHERE status != 0 AND game = '${game}' ORDER BY id DESC LIMIT 10 `
  );
  const [period] = await connection.query(
    `SELECT period FROM k3 WHERE status = 0 AND game = '${game}' ORDER BY id DESC LIMIT 1 `
  );
  const [waiting] = await connection.query(
    `SELECT phone, money, price, typeGame, amount, bet FROM result_k3 WHERE status = 0 AND level = 0 AND game = '${game}' ORDER BY id ASC `
  );
  const [settings] = await connection.query(`SELECT ${join} FROM admin`);
  if (k5d.length == 0) {
    return res.status(200).json({
      code: 0,
      msg: "No more data",
      data: {
        gameslist: [],
      },
      status: false,
    });
  }
  if (!k5d[0] || !period[0]) {
    return res.status(200).json({
      message: "Error!",
      status: false,
    });
  }
  return res.status(200).json({
    code: 0,
    msg: "Get success",
    data: {
      gameslist: k5d,
    },
    bet: waiting,
    settings: settings,
    join: join,
    period: period[0].period,
    status: true,
  });
};

const editResult = async (req, res) => {
  // console.log(req)
  let { game, list } = req.body;
  console.log(game, list);
  if (!list || !game) {
    return res.status(200).json({
      message: "ERROR!!!",
      status: false,
    });
  }

  let join = "";
  if (game == 1) join = "k5d";
  if (game == 3) join = "k5d3";
  if (game == 5) join = "k5d5";
  if (game == 10) join = "k5d10";

  const sql = `UPDATE admin SET ${join} = ?`;
  await connection.execute(sql, [list]);
  return res.status(200).json({
    message: "Editing is successful", //Register Sucess
    status: true,
  });
};

const editResult2 = async (req, res) => {
  let { game, list } = req.body;

  if (!list || !game) {
    return res.status(200).json({
      message: "ERROR!!!",
      status: false,
    });
  }

  let join = "";
  if (game == 1) join = "k3d";
  if (game == 3) join = "k3d3";
  if (game == 5) join = "k3d5";
  if (game == 10) join = "k3d10";

  const sql = `UPDATE admin SET ${join} = ?`;
  await connection.execute(sql, [list]);
  return res.status(200).json({
    message: "Editing is successful", //Register Sucess
    status: true,
  });
};




export const crashedPlaneSettings = async (req, res, next) => {
  try {
    if (!req.body) {
      return res.status(400).json({
        status: false,
        message: "Request body not defined",
      });
    }

    const [existingCrashedPlane] = await connection.query('SELECT * FROM crashedplane WHERE id = ?', [1]);

    if (!existingCrashedPlane.length) {
      await connection.query('INSERT INTO crashedplane (id) VALUES (1)');
    }

    const { nl, nh, sl, sh, sp, sm, ml, mh, mr, da } = req.body;

    let query = 'UPDATE crashedplane SET ';
    const params = [];

    if (nl && nh) {
      query += 'nl = ?, nh = ? ';
      params.push(String(nl), String(nh));
    } else if (sl && sh && sp && sm) {
      query += 'sl = ?, sh = ?, sp = ?, sm = ? ';
      params.push(String(sl), String(sh), String(sp), String(sm));
    } else if (ml && mh && da) {
      query += 'ml = ?, mh = ?, da = ? ';
      params.push(String(ml), String(mh), String(da));

      if (mr) {
        query += ', mr = ? ';
        params.push(String(mr));
      }
    } else {
      return res.status(200).json({
        status: false,
        message: "Please fill Required Fields",
      });
    }

    query += 'WHERE id = 1';
    await connection.query(query, params);

    return res.status(200).json({
      status: true,
      message: "Settings Updated",
    });
  } catch (err) {
    return res.status(401).json({
      status: false,
      message: err.message,
    });
  }
};




export const getCrashedPlaneSettings = async (req, res, next) => {
  try {
    const [rows] = await connection.query('SELECT * FROM crashedplane WHERE id = ?', [1]);
    const settings = rows[0];

    return res.status(200).json({
      status: true,
      message: "Data Found!....",
      data: settings,
    });
  } catch (err) {
    return res.status(401).json({
      status: false,
      message: err.message,
    });
  }
};





export const getCurrentRoundBets = async (req, res) => {
  try {
    const [autoaviatorData] = await connection.query('SELECT * FROM autoaviator ORDER BY betTime DESC');

    const totalBetAmount = autoaviatorData.reduce((total, item) => total + item.betAmount, 0);
    const totalWithdrawAmount = autoaviatorData.reduce((total, item) => total + (item.withdrawAmount || 0), 0);

    const uniquePhones = new Set(autoaviatorData.map(item => item.phone));
    const totalUniqueUsers = uniquePhones.size;

    const uniquePhonesWithWithdraw = new Set(
      autoaviatorData.filter(item => item.withdrawAmount !== 0).map(item => item.phone)
    );
    const uniqueWithdraw = uniquePhonesWithWithdraw.size;

    return res.status(200).json({
      status: true,
      message: "Data Fetched Successfully...",
      data: {
        totalmoney: totalBetAmount,
        totalwithdraw: totalWithdrawAmount,
        totalUsers: totalUniqueUsers,
        totalWithdrawUsers: uniqueWithdraw,
      },
    });
  } catch (err) {
    return res.status(401).json({
      status: false,
      message: err.message,
    });
  }
};





export const updateCrashData = async (req, res, next) => {
  try {
    if (!req.body) {
      return res.status(400).json({
        status: false,
        message: "Request body not defined",
      });
    }

    const { nl, nh, sl, sh, sp, sm, ml, mh, mr, da } = req.body;


    let query = 'UPDATE crashedplane SET nl = ?, nh = ?, sl = ?, sh = ?, sp = ?, sm = ?, ml = ?, mh = ?, da = ? , mr = ? WHERE id = 1';
    const params = [nl, nh, sl, sh, sp, sm, ml, mh, da, mr];

    // if (nl && nh) {
    //   query += 'nl = ?, nh = ? ';
    //   params.push(String(nl), String(nh));
    // }
    //  if (sl && sh && sp && sm) {
    //   query += 'sl = ?, sh = ?, sp = ?, sm = ? ';
    //   params.push(String(sl), String(sh), String(sp), String(sm));
    // }
    //  if (ml && mh && da) {
    //   query += 'ml = ?, mh = ?, da = ? ';
    //   params.push(String(ml), String(mh), String(da));

    //   if (mr) {
    //     query += ', mr = ? ';
    //     params.push(String(mr));
    //   }
    // } else {
    //   return res.status(400).json({
    //     status: false,
    //     message: "Please fill required fields",
    //   });
    // }

    // query += 'WHERE id = 1';
    try {
      await connection.query(query, params);

    } catch (error) {
      console.log(error);
      console.log('TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT');
    }

    return res.status(200).json({
      status: true,
      message: "Crash data updated",
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: err.message,
    });
  }
};




export const getCrashData = async (req, res, next) => {
  try {
    const [rows] = await connection.query('SELECT * FROM crashedplane WHERE id = ?', [1]);
    const crashData = rows[0];

    if (!crashData) {
      return res.status(404).json({
        status: false,
        message: "No crash data found.",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Crash data found.",
      data: crashData,
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: err.message,
    });
  }
};


const getAllAviatorData = async (req, res) => {

  const millisecondsToDateString = (milliseconds) => {
    const date = new Date(milliseconds);

    const pad = (n) => (n < 10 ? '0' : '') + n;

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1); // getMonth() returns 0-11
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };
  try {
    // Set startTime to the last one minute
    let startTime = Date.now() - 60000; // 60000 milliseconds = 1 minute
    const withdrawTime = millisecondsToDateString(startTime);

    // Get total bet amount
    const [betRows] = await connection.execute('SELECT betAmount FROM autoaviator');
    const totalBetAmount = betRows.reduce((sum, item) => sum + item.betAmount, 0);

    // Get count of total bets
    const totalBets = betRows.length;

    // Get total withdrawal amount
    // const [withdrawRows] = await connection.execute(
    //   'SELECT withdrawAmount FROM aviator WHERE withdrawAmount <> 0 AND withdrawTime >= ?',
    //   [withdrawTime]
    // );

    // Get total withdrawal amount
    const [withdrawRows] = await connection.execute(
      'SELECT withdrawAmount FROM aviator',
      [withdrawTime]
    );
    const totalWithdrawalAmount = withdrawRows.reduce((sum, item) => sum + item.withdrawAmount, 0);

    // Get count of total withdrawals
    const totalWithdrawals = withdrawRows.length;

    const totalAllBetUsers = 0;


    // Get crashed plane data
    const [crashedRows] = await connection.execute('SELECT * FROM crashedplane WHERE id = ?', [1]);

    return res.status(200).json({
      status: true,
      message: "Crash data found.",
      data: {
        status: true,
        message: "Crash data found.",
        totalBetAmount,
        totalWithdrawalAmount,
        totalWithdrawals,
        totalBets,
        totalAllBetUsers,
        totalBetAmount: totalBets,
        crashed: crashedRows[0],
      },
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: false,
      message: err.message,
    });
  }
};


module.exports = {
  ledgerHistory,
  paymentHistory,
  crashedPlaneSettings,
  getCurrentRoundBets,
  getCrashedPlaneSettings,
  enableBettingOnAviator,
  filterAgentHistory,
  myNetworkData,
  teamNetworkData,
  getSubordinateData,
  getAllAviatorData,
  updateCrashData,
  getCrashData,
  fundRequests,
  dashboard,
  wingoHistory,
  d5history,
  k3history,
  adminPage,
  adminPage3,
  adminPage5,
  adminPage10,
  totalJoin,
  middlewareAdminController,
  changeAdmin,
  membersPage,
  agentsStatistics,
  listMember,
  listAgents,
  listAgent,
  infoMember,
  userInfo,
  statistical,
  statistical2,
  rechargePage,
  recharge,
  rechargeDuyet,
  rechargeRecord,
  withdrawRecord,
  withdraw,
  handlWithdraw,
  settings,
  editResult2,
  settingBank,
  settingGet,
  settingCskh,
  settingbuff,
  register,
  ctvPage,
  listCTV,
  profileUser,
  ctvProfilePage,
  infoCtv,
  infoCtv2,
  giftPage,
  createBonus,
  listRedenvelops,
  updateAndCrash,
  banned,
  filterMember,
  listRechargeMem,
  listWithdrawMem,
  listRedenvelope,
  listBet,
  adminPage5d,
  listOrderOld,
  listOrderOldK3,
  editResult,
  adminPageK3,
  getAllRechargeDetails,
  getAllUserData,
  dashboardData,
  listFundRequests,
  updateFundRequestStatus,
  updateUserLevel,
  updateWithdrawRequestStatus,
  searchBetHistory,
  updateReferralCodeStatus,
  uploadBannerImages,
  listAllBets,
  updateRemark,
  searchFundRequests,
  ledgerView,
  betsHistoryPage,
  paymentSettings,
  AviatorCrashedPlane,
  getSettings,
  rebateRatio,
  saveWowpaySettings,
  saveUpiTokenSettings,
  SavePaymentSettings,
  updatePaymentSettings,
  updateReferralCode,
  referralCodesView,
  referralCodes,
  saveUpiSettings,
};
