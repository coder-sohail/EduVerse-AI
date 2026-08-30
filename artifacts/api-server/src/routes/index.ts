import { Router, type IRouter } from "express";
import healthRouter from "./health";
import eduverseRouter from "./eduverse";
import { requireSupabaseAuth } from "../middlewares/supabaseAuth";

const router: IRouter = Router();

router.use(healthRouter);
router.use(requireSupabaseAuth);
router.use(eduverseRouter);

export default router;
