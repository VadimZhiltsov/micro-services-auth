const express = require('express');
const app = express();

const httpProxy = require('http-proxy');
const apiProxy = httpProxy.createProxyServer();

class AuthorizationError extends Error {}
class ProxyRedirectError extends Error {}

async function areCredentialsValid(user, password) {
    console.log(user, password)
    if (user === 'user' && password === 'password') {
        return true
    }

    return false
}

const SERVICE_TO_URL_MAP = {
    'platform': 'http://platform-service/'
}
function getTargetConfig(req) {
    const serviceName = req.param("service")
    
    if (!(serviceName in SERVICE_TO_URL_MAP)) {
        throw new ProxyRedirectError(`Service "${serviceName}" is not enabled`)
    }

    const serviceUrl = SERVICE_TO_URL_MAP[serviceName]
    
    console.dir(req.url)

    return {
        target: serviceUrl,
        url: req.url.replace(`/service/${serviceName}`, '')
    }
}

app.all('/api/service/:service/*', async function (req, res) {
    try {
        console.log('NEW REQ')
        const { authorization } = req.headers
        if (!authorization) {
            throw new AuthorizationError('No Authorization header provided')
        }
        
        let user, password;
        try {
            [user, password] = JSON.parse(authorization)
        } catch(e) {
            throw new AuthorizationError('Failed to parse Authorization header')
        }
        
        const areGoodCreds = await areCredentialsValid(user, password)
        if (!areGoodCreds) {
            throw new AuthorizationError(`No user/password pair provided. Please use following for the reference: Authorization: ["user", "password"]`)
        }

        const { target, url } = (() => {
            try {
                return getTargetConfig(req)
            } catch(e) {
                if (e instanceof ProxyRedirectError) {
                    console.log(e.message)
                    return res.sendStatus(404)
                } 

                throw e
            }
        })()

        req.url = url
        console.log("target URL", req.url, target)
        return apiProxy.web(req, res, {
            target
        })
    } catch(e) {
        if (e instanceof AuthorizationError) {
            console.log(e.message)
            return res.sendStatus(401)
        }

        throw e
    }
});

app.listen(80, function () {
    console.log('Auth service is listening on port 80!');
});
