import mysql from "mysql2";

export const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",      
    database: "investiq_db"
});

db.connect(err => {
    if (err) {
        console.error("DB connection failed:", err);
    } else {
        console.log("Connected to InvestIQ database");
    }
});
