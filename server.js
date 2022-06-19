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
        
        default:
            res.writeHead(404, 'Content-type', 'text/html');
            res.end('Error 404');
            break;
    }
});

server.listen(PORT, () => console.log('Server running on port ' + PORT));