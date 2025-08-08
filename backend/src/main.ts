import express, { Request, Response } from "express";
import crypto from "crypto";
import pgp from "pg-promise";
import { validateCpf } from "./validateCpf";
const app = express();
app.use(express.json()); ////npx nodemon --legacy-watch src/main.ts

const connection = pgp()("postgres://postgres:123456@db:5432/app");

function validatePassword(password: string): boolean {
   if(password.length < 8) { return false; }
   if( !password.match(/[a-z]/)) { return false; }
   if( !password.match(/[A-Z]/)) { return false; }
   if( !password.match(/[0-9]/)) { return false; }
   return true;
}

app.post("/signup", async (req: Request, res: Response) => {
    const account = req.body;
    console.log("/signup", account);
    const accountId = crypto.randomUUID();    
    if(!account.name.match(/[a-zA-Z]+ [a-zA-Z]+/)) {
        res.status(422).json({
            message: "Invalid name"
        });
        return;
    }
    if(!account.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        res.status(422).json({
            message: "Invalid email"
        });
        return;
    }
    if(!validateCpf(account.document)) {
        res.status(422).json({
            message: "Invalid document"
        });
        return;
    }
     if(!validateCpf(account.document)) {
        res.status(422).json({
            message: "Invalid document"
        });
        return;
    }
     if(!validatePassword(account.password)) {
        res.status(422).json({
            message: "Invalid password"
        });
        return;
    }
    await connection.query("insert into ccca.account (account_id, name, email, document, password) values ($1, $2, $3, $4, $5)", [accountId, account.name, account.email, account.document, account.password]);
    res.json({
        accountId
    });
});

app.get("/accounts/:accountId", async (req: Request, res: Response) => {
    const accountId = req.params.accountId
    console.log(`/accounts/${accountId}`);
    const [account] = await connection.query("select * from ccca.account", []);
    res.json(account);
});

app.listen(3000);