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

const checkURL = (req, res) => {
    if (!req.url.match(/\/api\/users\/.+/)) {
        res.writeHead(404, 'Content-type', 'application/json');
        res.end(JSON.stringify({ message: 'Invalid URL' }));
        return;
    }
    return true;
};

const checkId = (req, res) => {
    const id = req.url.split('/')[3];
    if (id.length === 0 || !validate(id)) {
        res.writeHead(400, 'Content-type', 'application/json');
        res.end(JSON.stringify({ message: 'Invalid userId' }));
        return;
    }
    return true;
};

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

const getUsers = (res) => {
    res.writeHead(200, 'Content-type', 'application/json');
    res.write(JSON.stringify(database));
    res.end();
    return true;
};


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
    
                    if (!body.username ||
                        !body.age ||
                        !body.hobbies ||
                        !Array.isArray(body.hobbies)
                    ) {
                        res.writeHead(400, 'Content-type', 'application/json');
                        res.end(JSON.stringify({ message: 'Object must have properties: username: string, age: number, hobbies: array' }));
                        return;
                    }
    
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
    
                    const userDatabaseId = database.findIndex(user => user.id === req.url.split('/')[3]);
    
                    if (userDatabaseId === -1) {
                        res.writeHead(404, 'Content-type', 'application/json');
                        res.end(JSON.stringify({ message: 'User doesn\'t exist' }));
                        return;
                    }
    
                    database[userDatabaseId] = { ...database[userDatabaseId], ...body, id: database[userDatabaseId].id };
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