// import { dateFormat } from "./../utils/DateFormat.js";
import connection from "../config/connectDB.js";

export const getK3History = async (req, res) => {
  try {
    const [rows] = await connection.execute("SELECT * FROM result_k3");
    return res.status(200).json({
      message: "k3 game History!",
      resultK3: rows,
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const get5dHistory = async (req, res) => {
  try {
    const [rows] = await connection.execute("SELECT * FROM result_5d");
    return res.status(200).json({
      message: "5d game History!",
      result5d: rows,
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};


export const getWingoHistory = async (req, res) => {
    try {
      const [rows] = await connection.execute("SELECT * FROM minutes_1");
      return res.status(200).json({
        message: "wingo game History!",
        resultWingo: rows,
      });
    } catch (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
  };
  