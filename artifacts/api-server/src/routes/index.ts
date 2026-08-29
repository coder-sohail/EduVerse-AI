import { Router, type IRouter } from "express";
import healthRouter from "./health";
import eduverseRouter from "./eduverse";

const router: IRouter = Router();

router.use(healthRouter);
router.use(eduverseRouter);

export default router;
