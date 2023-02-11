import { Router, Request, Response } from "express";

interface PostScore extends Request {
  body: {
    score: number;
  };
}

const router = Router();

let highestScore: number = 0;

export const getScore = router.get("/score", (req: Request, res: Response) => {
  res.json({ highestScore });
});

export const updateScore = router.post(
  "/score",
  (req: PostScore, res: Response) => {
    if (typeof req.body.score !== "number")
      return res.status(400).json({ message: "invalid parameters" });
    const newScore = req.body.score;
    if (newScore > highestScore) highestScore = newScore;
    res.json({ highestScore });
  }
);
