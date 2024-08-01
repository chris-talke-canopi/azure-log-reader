import { database } from "../app";
import express, { Request, Response } from "express";
import path from "path";
import { getLogsByOperationId, getOperationIds, getOperationNames, UTC_Timestamps } from "../controllers/azure/applicationInsights";
import { isAuthenticated } from "../controllers/azure/authentication";

const router = express.Router();

router.get("/", (req: Request, res: Response) => {
    return res.sendFile(path.join(__dirname, "/public/index.html"));
});

router.get("/api/tenants", isAuthenticated, async (req: Request, res: Response) => {
    try {
        const data = await database.query.tenant.findMany();
        res.json(data);
    } catch (error) {
        console.error(error);
        res.json(null);
    }
});

router.get("/api/references/:tenantId", isAuthenticated, async (req: Request, res: Response) => {
    try {
        const  { tenantId } = req.params;
        const data = await database.query.reference.findMany({ 
            where : (reference, { eq }) => eq(reference.tenantId, Number(tenantId))
        });
        res.json(data);
    } catch (error) {
        console.error(error);
        res.json(null);
    }
});

router.get("/api/references/:tenantId/operation_names", isAuthenticated, async (req: Request, res: Response) => {
    try {
        const  { tenantId } = req.params;
        const tenant = await database.query.tenant.findFirst({
            where : (tenant, { eq }) => eq(tenant.id, Number(tenantId))
        })
        
        if (tenant) {
            let config = {
                app_version: tenant.tenant_version as string,
                app_id: tenant.tenant_id as string,
                api_key: tenant.tenant_key as string
            };

            const data = await getOperationNames(config);
            return res.json(data);
        }
        return res.json(null);
    } catch (error) {
        console.error(error);
        return res.json(null);
    }
});

router.get("/api/references/:tenantId/operation_ids", isAuthenticated, async (req: Request, res: Response) => {
    try {
        const  { tenantId } = req.params as unknown as { tenantId?: string };
        const { operation_names, start, end } = req.query as unknown as { operation_names?: string[], start?: string, end?: string }
        const tenant = await database.query.tenant.findFirst({
            where : (tenant, { eq }) => eq(tenant.id, Number(tenantId))
        })

        if (tenant) {

            let timestamps = {} as UTC_Timestamps | undefined;
                start && timestamps ? timestamps.start = start : null;
                end && timestamps ? timestamps.end = end : null;
            if (!timestamps?.start && !timestamps?.end) {
                timestamps = undefined;
            }

            let config = {
                app_version: tenant.tenant_version as string,
                app_id: tenant.tenant_id as string,
                api_key: tenant.tenant_key as string
            };

            const data = await getOperationIds(config, timestamps, operation_names);

            return res.json(data);
        }
        return res.json(null);
    } catch (error) {
        console.error(error);
        return res.json(null);
    }
});

router.get("/api/references/:tenantId/logs/:operationId", isAuthenticated, async (req: Request, res: Response) => {
    try {
        const  { tenantId, operationId } = req.params as unknown as { tenantId?: string, operationId?: string };
        const tenant = await database.query.tenant.findFirst({
            where : (tenant, { eq }) => eq(tenant.id, Number(tenantId))
        })

        if (tenant && operationId) {

            let config = {
                app_version: tenant.tenant_version as string,
                app_id: tenant.tenant_id as string,
                api_key: tenant.tenant_key as string
            };

            const data = await getLogsByOperationId(config, operationId);

            return res.json(data);
        }
        return res.json(null);
    } catch (error) {
        console.error(error);
        return res.json(null);
    }
});

router.get("*", (req: Request, res: Response) => {
    return res.sendFile(path.join(__dirname, "../public/index.html"));
});

export default router;
