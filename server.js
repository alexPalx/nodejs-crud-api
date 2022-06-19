import { createServer } from 'http';
import { v4 as uuidv4, validate } from 'uuid';

let database = [
    {
        id: uuidv4(),
        username: 'Catherine',
        age: 24,
        hobbies: ['UX/UI design']
    },
    {
        id: uuidv4(),
        username: 'Steven',
        age: 28,
        hobbies: ['cooking']
    },
    {
        id: uuidv4(),
        username: 'Rebecca',
        age: 19,
        hobbies: []
    }
];

const PORT = 5000;

/**
 * If the URL doesn't match the pattern /api/users/..., then return a 404 error. Otherwise, return true
 * @param req - The request object
 * @param res - The response object
 * @returns true if the URL is valid
 */
const checkURL = (req, res) => {
    if (!req.url.match(/\/api\/users\/.+/)) {
        res.writeHead(404, 'Content-type', 'application/json');
        res.end(JSON.stringify({ message: 'Invalid URL' }));
        return;
    }
    return true;
};

/**
 * It checks if the uuid is valid and if it is not, it sends a 400 response
 * @param req - The request object
 * @param res - The response object
 * @returns true if the uuid is valid
 */
const checkId = (req, res) => {
    const id = req.url.split('/')[3];
    if (id.length === 0 || !validate(id)) {
        res.writeHead(400, 'Content-type', 'application/json');
        res.end(JSON.stringify({ message: 'Invalid userId' }));
        return;
    }
    return true;
};

/**
 * It checks if the user exists in the database. If it doesn't, it sends a 404 response
 * @param req - The request object
 * @param res - The response object
 * @returns true if the user exists
 */
const checkUser = (req, res) => {
    const id = req.url.split('/')[3];
    const user = database.find(user => user.id === id);

    if (!user) {
        res.writeHead(404, 'Content-type', 'application/json');
        res.end(JSON.stringify({ message: 'User doesn\'t exist' }));
        return;
    }
    return true;
};

/**
 * Sends response an array of all users from the database
 * @param res - The response object
 * @returns true
 */
const getUsers = (res) => {
    res.writeHead(200, 'Content-type', 'application/json');
    res.write(JSON.stringify(database));
    res.end();
    return true;
};

/**
 * Sends a user from the database as a response. if it doesn't exist then sends a 404 response
 * @param req - The request object
 * @param res - The response object
 * @returns true if the user exists
 */
const getUser = (req, res) => {
    const id = req.url.split('/')[3];
    const user = database.find(user => user.id === id);

    if (user) {
        res.writeHead(200, 'Content-type', 'application/json');
        res.end(JSON.stringify(user));
        return true;
    }
    else {
        res.writeHead(404, 'Content-type', 'application/json');
        res.end(JSON.stringify({ message: 'User doesn\'t exist' }));
        return;
    }
};

/**
 * If the body object doesn't have a username property that is a string, an age property that is a
 * number, or a hobbies property that is an array, then send a 400 response
 * @param body - the body of the request
 * @param res - The response object
 * @returns true if the object is valid
 */
const checkObject = (body, res) => {
    if (!body.username || typeof body.username !== 'string' ||
        !body.age || typeof body.age !== 'number' ||
        !body.hobbies || !Array.isArray(body.hobbies)
    ) {
        res.writeHead(400, 'Content-type', 'application/json');
        res.end(JSON.stringify({ message: 'Object must have properties: username: string, age: number, hobbies: array' }));
        return;
    }
    return true;
};

const server = createServer((req, res) => {
    try {
        let body = '';
        switch (req.method) {
            case 'GET':
                // /api/users || /api/users/
                if (req.url === '/api/users' || req.url === '/api/users/') {
                    getUsers(res);
                    return;
                }
                // /api/users/id
                else if (req.url.match(/\/api\/users\/.+/)) {
                    if (!checkId(req, res)) return;
                    if (!getUser(req, res)) return;
                }

                checkURL(req, res);
                break;

            case 'POST':
                req.on('data', chunk => {
                    body += chunk.toString();
                });
                req.on('end', () => {
                    body = JSON.parse(body);

                    if (!checkObject(body, res)) return;

                    body = { ...body, id: uuidv4() };
                    database.push(body);

                    res.writeHead(201, 'Content-type', 'application/json');
                    res.end(JSON.stringify(body));
                });
                break;

            case 'PUT':
                if (!checkURL(req, res)) return;
                if (!checkId(req, res)) return;
                if (!checkUser(req, res)) return;

                req.on('data', chunk => {
                    body += chunk.toString();
                });
                req.on('end', () => {
                    body = JSON.parse(body);

                    if (!checkObject(body, res)) return;

                    const userDatabaseId = database.findIndex(user => user.id === req.url.split('/')[3]);

                    if (userDatabaseId === -1) {
                        res.writeHead(404, 'Content-type', 'application/json');
                        res.end(JSON.stringify({ message: 'User doesn\'t exist' }));
                        return;
                    }

                    database[userDatabaseId] = { ...body, id: database[userDatabaseId].id };
                    res.writeHead(200, 'Content-type', 'application/json');
                    res.end(JSON.stringify(database[userDatabaseId]));
                    return;
                });
                break;

            case 'DELETE':
                if (!checkURL(req, res)) return;
                if (!checkId(req, res)) return;
                if (!checkUser(req, res)) return;

                database = database.filter(user => user.id !== req.url.split('/')[3]);

                res.statusCode = 204;
                res.end();
                break;

            default:
                checkURL(req, res);
                break;
        }
    }
    catch {
        res.writeHead(500, 'Content-type', 'application/json');
        res.end(JSON.stringify({ message: 'Server error' }));
    }
});

server.listen(PORT, () => console.log('Server running on port ' + PORT));