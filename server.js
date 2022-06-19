import { createServer } from 'http';
import { v4 as uuidv4, validate } from 'uuid';

const database = [
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

const server = createServer((req, res) => {
    let body = '';
    switch (req.method) {
        case 'GET':
            // /api/users || /api/users/
            if (req.url === '/api/users' || req.url === '/api/users/') {
                res.writeHead(200, 'Content-type', 'application/json');
                res.write(JSON.stringify(database));
                res.end();
                return;
            }
            // /api/users/id
            else if (req.url.match(/\/api\/users\/.+/)) {
                const id = req.url.split('/')[3];
                if (id.length === 0 || !validate(id)) {
                    res.writeHead(400, 'Content-type', 'text/html');
                    res.end('Incorrect uuid');
                    return;
                }

                const user = database.find(user => user.id === id);

                if (user) {
                    res.writeHead(200, 'Content-type', 'application/json');
                    res.end(JSON.stringify(user));
                    return;
                }
                else {
                    res.writeHead(404, 'Content-type', 'text/html');
                    res.end(`User ${id} doesn't exist`);
                    return;
                }
            }
            res.writeHead(404, 'Content-type', 'text/html');
            res.end('Error 404');
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
                    res.writeHead(400, 'Content-type', 'text/html');
                    res.end('object must have properties: username: string, age: number, hobbies: array');
                    return;
                }

                body = { ...body, id: uuidv4() };
                database.push(body);

                res.writeHead(201, 'Content-type', 'application/json');
                res.end(JSON.stringify(body));
            });
            break;

        case 'PUT':
            if (!req.url.match(/\/api\/users\/.+/)) {
                res.writeHead(404, 'Content-type', 'text/html');
                res.end('Error 404');
                return;
            }

            const id = req.url.split('/')[3];
            if (id.length === 0 || !validate(id)) {
                res.writeHead(400, 'Content-type', 'application/json');
                res.end(JSON.stringify({ message: 'Incorrect id' }));
                return;
            }

            let userDatabaseId = database.findIndex(user => user.id === req.url.split('/')[3]);
            if (userDatabaseId === -1) {
                res.writeHead(404, 'Content-type', 'application/json');
                    res.end(JSON.stringify({ message: 'User doesn\'t exist' }));
                    return;
            }

            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', () => {
                body = JSON.parse(body);

                database[userDatabaseId] = { ...database[userDatabaseId], ...body, id: database[userDatabaseId].id };
                res.writeHead(200, 'Content-type', 'application/json');
                res.end(JSON.stringify(database[userDatabaseId]));
                return;
            });
            break;

        default:
            res.writeHead(404, 'Content-type', 'text/html');
            res.end('Error 404');
            break;
    }
});

server.listen(PORT, () => console.log('Server running on port ' + PORT));