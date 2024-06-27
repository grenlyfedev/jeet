import connection from "../config/connectDB";
import jwt from "jsonwebtoken";
import md5 from "md5";
import request from "request";
import e from "express";
require("dotenv").config();

let timeNow = Date.now();

const randomString = (length) => {
  var result = "";
  var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const randomNumber = (min, max) => {
  return String(Math.floor(Math.random() * (max - min + 1)) + min);
};

const isNumber = (params) => {
  let pattern = /^[0-9]*\d$/;
  return pattern.test(params);
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

const loginPage = async (req, res) => {
  return res.render("account/login.ejs");
};

const registerPage = async (req, res) => {
  return res.render("account/register.ejs");
};

const forgotPage = async (req, res) => {
  return res.render("account/forgot.ejs");
};

const login = async (req, res) => {
  console.log("laksdfhjlj");
  let { username, pwd } = req.body;

  if (!username || !pwd) {
    //!isNumber(username)
    return res.status(200).json({
      message: "ERROR!!!",
    });
  }

  try {
    const [rows] = await connection.query(
      "SELECT * FROM users WHERE phone = ? AND password = ? ",
      [username, md5(pwd)]
    );
    if (rows.length == 1) {
      if (rows[0].status == 1) {
        const {
          password,
          money,
          ip,
          veri,
          ip_address,
          status,
          time,
          ...others
        } = rows[0];
        console.log(username);
        const accessToken = jwt.sign(
          {
            phone: username,
          },
          process.env.JWT_ACCESS_TOKEN,
          { expiresIn: "7d" }
        );
        await connection.execute(
          "UPDATE `users` SET `token` = ? WHERE `phone` = ? ",
          [md5(accessToken), username]
        );
        res.cookie("jayesh", accessToken, { sameSite: "None", secure: true });
        return res.status(200).json({
          message: "Login Sucess",
          status: true,
          token: accessToken,
          value: md5(accessToken),
        });
      } else {
        return res.status(200).json({
          message: "Account has been locked",
          status: false,
        });
      }
    } else {
      return res.status(200).json({
        message: "Incorrect Username or Password",
        status: false,
      });
    }
  } catch (error) {
    if (error) console.log(error);
  }
};

// const register = async (req, res) => {
//   let now = new Date().getTime();
//   let { username, pwd, invitecode, otp } = req.body;

//   let id_user = randomNumber(10000, 99999);
//   let name_user = "MJW" + randomNumber(10000, 99999);
//   let code = randomString(5) + randomNumber(10000, 99999);
//   let ip = ipAddress(req);
//   let time = timeCreate();

//   if (!username || !pwd) {
//     return res.status(200).json({
//       message: "ERROR!!!",
//       status: false,
//     });
//   }

//   if (invitecode === '' || invitecode === null) {
//     invitecode = 'MYJEETWIN';
//   }

//   if (username.length < 9 || username.length > 10 || !isNumber(username)) {
//     return res.status(200).json({
//       message: "phone error",
//       status: false,
//     });
//   }

//   try {
//     const [check_u] = await connection.query(
//       "SELECT * FROM users WHERE phone = ? ",
//       [username]
//     );
//     const [check_i] = await connection.query(
//       "SELECT * FROM users WHERE code = ? ",
//       [invitecode]
//     );
//     let invitecode1;
//     let referredBy_ID = null;

//     if (check_i.length == 1) {
//       invitecode1 = invitecode;
//       referredBy_ID = check_i[0].id; // Get the ID of the user with the invite code
//       const newTotalMoney = check_i[0].money + 0;
//       await connection.query("UPDATE users SET money = ? WHERE code = ?", [
//         newTotalMoney,
//         invitecode,
//       ]);
//     } else {
//       invitecode1 = "";
//     }

//     if (check_u.length == 1 && check_u[0].veri == 1) {
//       return res.status(200).json({
//         message: "Registered phone number",
//         status: false,
//       });
//     } else {
//       const [rows] = await connection.query(
//         "SELECT * FROM users WHERE `phone` = ?",
//         [username]
//       );
//       if (rows.length == 0) {
//         return res.status(200).json({
//           message: "otp error",
//           status: false,
//           timeStamp: now,
//         });
//       } else {
//         let user = rows[0];
//         if (user.time_otp - now > 0) {
//           if (user.otp == otp) {
//             let ctv = "";
//             if (check_i[0]?.level == 2) {
//               ctv = check_i[0].phone;
//             } else {
//               ctv = check_i[0]?.ctv || 0;
//             }
//             const deletesql = "DELETE FROM users WHERE `users`.`phone` = ?";
//             await connection.execute(deletesql, [username]);
//             const sql =
//               "INSERT INTO users SET id_user = ?,phone = ?,name_user = ?,password = ?,money = ?,code = ?,invite = ?,ctv = ?,veri = ?,otp = ?,ip_address = ?,status = ?,time = ?, referredBy_ID = ?";
//             await connection.execute(sql, [
//               id_user,
//               username,
//               name_user,
//               md5(pwd),
//               0,
//               code,
//               invitecode1,
//               ctv,
//               1,
//               otp,
//               ip,
//               1,
//               time,
//               referredBy_ID 
//             ]);
//             await connection.execute("INSERT INTO point_list SET phone = ?", [
//               username,
//             ]);
//             return res.status(200).json({
//               message: "Register Success",
//               status: true,
//             });
//           } else {
//             return res.status(200).json({
//               message: "OTP code is incorrect",
//               status: false,
//               timeStamp: now,
//             });
//           }
//         } else {
//           return res.status(200).json({
//             message: "OTP code has expired",
//             status: false,
//             timeStamp: now,
//           });
//         }
//       }
//     }
//   } catch (error) {
//     console.error("Error:", error);
//     return res.status(500).json({
//       message: "Internal server error",
//       status: false,
//     });
//   }
// };


// const register = async (req, res) => {
//   let now = new Date().getTime();
//   let { username, pwd, invitecode, otp } = req.body;

//   // const [users_count] = await connection.query(
//   //   "SELECT * FROM users"
//   // );

//   let id_user = randomNumber(10000, 99999);
//   // let id_user = users_count + 1;
//   // let otp2 = randomNumber(100000, 999999);
//   let name_user = "MJW" + randomNumber(10000, 99999);
//   let code = randomString(5) + randomNumber(10000, 99999);
//   let ip = ipAddress(req);
//   let time = timeCreate();

//   if (!username || !pwd) {
//     return res.status(200).json({
//       message: "ERROR!!!",
//       status: false,
//     });
//   }

//   if (invitecode === '' || invitecode === null) {
//     invitecode = 'MYJEETWIN';
//   }

//   if (username.length < 9 || username.length > 10 || !isNumber(username)) {
//     return res.status(200).json({
//       message: "phone error",
//       status: false,
//     });
//   }

//   try {
//     const [check_u] = await connection.query(
//       "SELECT * FROM users WHERE phone = ? ",
//       [username]
//     );
//     const [check_i] = await connection.query(
//       "SELECT * FROM users WHERE code = ? ",
//       [invitecode]
//     );
//     let invitecode1;
//     if (check_i.length == 1) {
//       invitecode1 = invitecode;
//       const newTotalMoney = check_i[0].money + 0;
//       await connection.query("UPDATE users SET money = ? WHERE code = ?", [
//         newTotalMoney,
//         invitecode,
//       ]);
//     } else {
//       invitecode1 = "";
//     }

//     if (check_u.length == 1 && check_u[0].veri == 1) {
//       return res.status(200).json({
//         message: "Registered phone number",
//         status: false,
//       });
//     } else {
//       const [rows] = await connection.query(
//         "SELECT * FROM users WHERE `phone` = ?",
//         [username]
//       );
//       if (rows.length == 0) {
//         return res.status(200).json({
//           message: "otp error",
//           status: false,
//           timeStamp: timeNow,
//         });
//       } else {
//         let user = rows[0];
//         if (user.time_otp - now > 0) {
//           if (user.otp == otp) {
//             let ctv = "";
//             if (check_i[0]?.level == 2) {
//               ctv = check_i[0].phone;
//             } else {
//               ctv = check_i[0]?.ctv || 0;
//             }
//             const deletesql = "DELETE FROM users WHERE `users`.`phone` = ?";
//             await connection.execute(deletesql, [username]);
//             const sql =
//               "INSERT INTO users SET id_user = ?,phone = ?,name_user = ?,password = ?,money = ?,code = ?,invite = ?,ctv = ?,veri = ?,otp = ?,ip_address = ?,status = ?,time = ?";
//             await connection.execute(sql, [
//               id_user,
//               username,
//               name_user,
//               md5(pwd),
//               0,
//               code,
//               invitecode1,
//               ctv,
//               1,
//               otp,
//               ip,
//               1,
//               time,
//             ]);
//             await connection.execute("INSERT INTO point_list SET phone = ?", [
//               username,
//             ]);
//             return res.status(200).json({
//               message: "Register Sucess",
//               status: true,
//             });
//           } else {
//             return res.status(200).json({
//               message: "OTP code is incorrect",
//               status: false,
//               timeStamp: timeNow,
//             });
//           }
//         } else {
//           return res.status(200).json({
//             message: "OTP code has expired",
//             status: false,
//             timeStamp: timeNow,
//           });
//         }
//       }
//     }
//   } catch (error) {
//     if (error) console.log(error);
//   }
// };
const register = async (req, res) => {
  let now = new Date().getTime();
  let { username, pwd, invitecode, otp } = req.body;

  let id_user = randomNumber(10000, 99999);
  let name_user = "MJW" + randomNumber(10000, 99999);
  let code = randomString(5) + randomNumber(10000, 99999);
  let ip = ipAddress(req);
  let time = timeCreate();

  if (!username || !pwd) {
    return res.status(200).json({
      message: "ERROR!!!",
      status: false,
    });
  }

  if (invitecode === '' || invitecode === null) {
    invitecode = 'MYJEETWIN';
  }

  if (username.length < 9 || username.length > 10 || !isNumber(username)) {
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

    const [check_i] = await connection.query(
      "SELECT * FROM users WHERE code = ? ",
      [invitecode]
    );

    let invitecode1 = 'MYJEETWIN';
    let referredBy_ID = null;

    if (check_i.length == 1) {
      invitecode1 = invitecode;
      referredBy_ID = check_i[0].id; // Get the ID of the user with the invite code
      const newTotalMoney = check_i[0].money + 0;
      await connection.query("UPDATE users SET money = ? WHERE code = ?", [
        newTotalMoney,
        invitecode,
      ]);
    } else {
      // Check for the default 'MYJEETWIN' user
      const [check_default] = await connection.query(
        "SELECT * FROM users WHERE code = ? ",
        ['MYJEETWIN']
      );
      if (check_default.length == 1) {
        referredBy_ID = check_default[0].id;
      }
    }

    if (check_u.length == 1 && check_u[0].veri == 1) {
      return res.status(200).json({
        message: "Registered phone number",
        status: false,
      });
    } else {
      const [rows] = await connection.query(
        "SELECT * FROM users WHERE `phone` = ?",
        [username]
      );
      if (rows.length == 0) {
        return res.status(200).json({
          message: "otp error",
          status: false,
          timeStamp: now,
        });
      } else {
        let user = rows[0];
        if (user.time_otp - now > 0) {
          if (user.otp == otp) {
            let ctv = "";
            if (check_i[0]?.level == 2) {
              ctv = check_i[0].phone;
            } else {
              ctv = check_i[0]?.ctv || 0;
            }
            const deletesql = "DELETE FROM users WHERE `users`.`phone` = ?";
            await connection.execute(deletesql, [username]);
            const sql =
              "INSERT INTO users SET id_user = ?,phone = ?,name_user = ?,password = ?,money = ?,code = ?,invite = ?,ctv = ?,veri = ?,otp = ?,ip_address = ?,status = ?,time = ?, referredBy_ID = ?";
            await connection.execute(sql, [
              id_user,
              username,
              name_user,
              md5(pwd),
              0,
              code,
              invitecode1,
              ctv,
              1,
              otp,
              ip,
              1,
              time,
              referredBy_ID,
            ]);

            await connection.execute("INSERT INTO point_list SET phone = ?", [
              username,
            ]);

            console.log("Inserted user with referredBy_ID:", referredBy_ID);

            return res.status(200).json({
              message: "Register Success",
              status: true,
            });
          } else {
            return res.status(200).json({
              message: "OTP code is incorrect",
              status: false,
              timeStamp: now,
            });
          }
        } else {
          return res.status(200).json({
            message: "OTP code has expired",
            status: false,
            timeStamp: now,
          });
        }
      }
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      message: "Internal server error",
      status: false,
    });
  }
};

const verifyCode = async (req, res) => {
  let phone = req.body.phone;
  let now = new Date().getTime();
  let timeEnd = +new Date() + 1000 * (60 * 2 + 0) + 500;
  let otp = randomNumber(100000, 999999);
  if (phone.length < 9 || phone.length > 10 || !isNumber(phone)) {
    return res.status(200).json({
      message: "phone error",
      status: false,
    });
  }

  const [rows] = await connection.query(
    "SELECT * FROM users WHERE `phone` = ?",
    [phone]
  );
  if (rows.length == 0) {
    await request(
      `https://www.fast2sms.com/dev/bulkV2?authorization=izN2PrfjOg40tJvwWkBa59TyoDEnhVM7Zp3GCSAlm1FYebQLIxTJnRY8drPMLSuqcOVQslB4h23Zv96E&variables_values=${otp}&route=otp&numbers=${phone}`,
      async (error, response, body) => {
        let data = JSON.parse(body);
        console.log(data.message);
        if (data.message == "SMS sent successfully.") {
          await connection.execute(
            "INSERT INTO users SET phone = ?, otp = ?, veri = 0, time_otp = ? ",
            [phone, otp, timeEnd]
          );
          return res.status(200).json({
            message: "SMS sent sucessfully",
            status: true,
            timeStamp: timeNow,
            timeEnd: timeEnd,
          });
        }
      }
    );
  } else {
    let user = rows[0];
    if (user.time_otp - now <= 0) {
      request(
        `https://www.fast2sms.com/dev/bulkV2?authorization=izN2PrfjOg40tJvwWkBa59TyoDEnhVM7Zp3GCSAlm1FYebQLIxTJnRY8drPMLSuqcOVQslB4h23Zv96E&variables_values=${otp}&route=otp&numbers=${phone}`,
        async (error, response, body) => {
          let data = JSON.parse(body);
          if (data.message == "SMS sent successfully.") {
            await connection.execute(
              "UPDATE users SET otp = ?, time_otp = ? WHERE phone = ? ",
              [otp, timeEnd, phone]
            );
            return res.status(200).json({
              message: "Submitted successfully",
              status: true,
              timeStamp: timeNow,
              timeEnd: timeEnd,
            });
          }
        }
      );
    } else {
      return res.status(200).json({
        message: "Send SMS regularly",
        status: false,
        timeStamp: timeNow,
      });
    }
  }
};

const verifyCodePass = async (req, res) => {
  let phone = req.body.phone;
  let now = new Date().getTime();
  let timeEnd = +new Date() + 1000 * (60 * 2 + 0) + 500;
  let otp = randomNumber(100000, 999999);

  if (phone.length < 9 || phone.length > 10 || !isNumber(phone)) {
    return res.status(200).json({
      message: "phone error",
      status: false,
    });
  }

  const [rows] = await connection.query(
    "SELECT * FROM users WHERE `phone` = ? AND veri = 1",
    [phone]
  );
  if (rows.length == 0) {
    return res.status(200).json({
      message: "Account does not exist",
      status: false,
      timeStamp: timeNow,
    });
  } else {
    let user = rows[0];
    if (user.time_otp - now <= 0) {
      request(
        `https://www.fast2sms.com/dev/bulkV2?authorization=izN2PrfjOg40tJvwWkBa59TyoDEnhVM7Zp3GCSAlm1FYebQLIxTJnRY8drPMLSuqcOVQslB4h23Zv96E&variables_values=${otp}&route=otp&numbers=${phone}`,
        async (error, response, body) => {
          let data = JSON.parse(body);
          if (data.message == "SMS sent successfully.") {
            await connection.execute(
              "UPDATE users SET otp = ?, time_otp = ? WHERE phone = ? ",
              [otp, timeEnd, phone]
            );
            return res.status(200).json({
              message: "Submitted successfully",
              status: true,
              timeStamp: timeNow,
              timeEnd: timeEnd,
            });
          }
        }
      );
    } else {
      return res.status(200).json({
        message: "Send SMS regularly",
        status: false,
        timeStamp: timeNow,
      });
    }
  }
};

const forGotPassword = async (req, res) => {
  let username = req.body.username;
  let otp = req.body.otp;
  let pwd = req.body.pwd;
  let now = new Date().getTime();
  let timeEnd = +new Date() + 1000 * (60 * 2 + 0) + 500;
  let otp2 = randomNumber(100000, 999999);

  if (username.length < 9 || username.length > 10 || !isNumber(username)) {
    return res.status(200).json({
      message: "phone error",
      status: false,
    });
  }

  const [rows] = await connection.query(
    "SELECT * FROM users WHERE `phone` = ? AND veri = 1",
    [username]
  );
  if (rows.length == 0) {
    return res.status(200).json({
      message: "Account does not exist",
      status: false,
      timeStamp: timeNow,
    });
  } else {
    let user = rows[0];
    if (user.time_otp - now > 0) {
      if (user.otp == otp) {
        await connection.execute(
          "UPDATE users SET password = ?, otp = ?, time_otp = ? WHERE phone = ? ",
          [md5(pwd), otp2, timeEnd, username]
        );
        return res.status(200).json({
          message: "Change password successfully",
          status: true,
          timeStamp: timeNow,
          timeEnd: timeEnd,
        });
      } else {
        return res.status(200).json({
          message: "OTP code is incorrect",
          status: false,
          timeStamp: timeNow,
        });
      }
    } else {
      return res.status(200).json({
        message: "OTP code has expired",
        status: false,
        timeStamp: timeNow,
      });
    }
  }
};

module.exports = {
  login,
  register,
  loginPage,
  registerPage,
  forgotPage,
  verifyCode,
  verifyCodePass,
  forGotPassword,
};
