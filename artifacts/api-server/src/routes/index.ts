import { Router, type IRouter } from "express";
import healthRouter from "./health";
import usersRouter from "./users";
import contactsRouter from "./contacts";
import locationRouter from "./location";
import alertsRouter from "./alerts";
import recordingsRouter from "./recordings";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(usersRouter);
router.use(contactsRouter);
router.use(locationRouter);
router.use(alertsRouter);
router.use(recordingsRouter);
router.use(dashboardRouter);

export default router;
