import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { Request, Response, NextFunction } from 'express';

const { AZURE_TENANT_ID, AZURE_CLIENT_ID } = require('../../config.json');

const client = jwksClient({
    jwksUri: `https://login.microsoftonline.com/${AZURE_TENANT_ID}/discovery/v2.0/keys`
});

function getKey(header: any, callback: any) {
    client.getSigningKey(header.kid, (err, key) => {
        if (err) {
            callback(err, null);
        } else if (key) {
            const signingKey = key.getPublicKey();
            callback(null, signingKey);
        }
    });
}

export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
    const authorizationHeader = req.headers['authorization'];

    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const token = authorizationHeader.split(' ')[1];

    jwt.verify(token, getKey, {
        audience: `api://${AZURE_CLIENT_ID}`,
        issuer: `https://sts.windows.net/${AZURE_TENANT_ID}/`
    }, (err, decoded) => {
        if (err) {
            console.error(err)
            return res.status(401).json({ error: 'Token verification failed', details: err.message });
        }
        req.user = decoded;
        next();
    });
}
