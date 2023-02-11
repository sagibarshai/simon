import express, { Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import { getScore, updateScore } from "./routes/score";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use("/api", getScore);
app.use("/api", updateScore);
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.message);
  res.status(500).json({ message: "Internal Server Error" });
});

app.listen(4000, () => {
  console.log("server listen on port 4000 !");
});
