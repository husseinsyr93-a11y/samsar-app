import { Router, type IRouter } from "express";
import healthRouter from "./health";
import propertiesRouter from "./properties";
import favoritesRouter from "./favorites";
import matchesRouter from "./matches";
import messagesRouter from "./messages";
import neighborhoodsRouter from "./neighborhoods";
import reviewsRouter from "./reviews";
import aiRouter from "./ai";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use(propertiesRouter);
router.use(favoritesRouter);
router.use(matchesRouter);
router.use(messagesRouter);
router.use(neighborhoodsRouter);
router.use(reviewsRouter);
router.use(aiRouter);
router.use(statsRouter);

export default router;
