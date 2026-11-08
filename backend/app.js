const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const session = require('express-session');

const app = express();
app.use(express.urlencoded({extended: true}));
app.use(express.static('static'));

app.use(session({
    secret: 'your_secret_key_here',
    resave: false,
    saveUninitialized: false
}));

app.set('views', 'templates');
app.set('view engine', 'ejs');

const db = new sqlite3.Database('./RestRed.db');

db.run(`CREATE TABLE IF NOT EXISTS users(
        user_id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        email TEXT UNIQUE,
        password TEXT
)`);

db.run(`CREATE TABLE IF NOT EXISTS posts(
        post_id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT,
        user_id TEXT,
        title TEXT,
        content TEXT 
)`);

db.run(`CREATE TABLE IF NOT EXISTS replies(
    reply_id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER,
    content TEXT,
    username TEXT,
    user_id TEXT
)`)

app.get('/', (req, res) => {
    res.render('login');
});

app.get('/signup', async (req, res) => {
    res.render('signup');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/home', (req, res) => {
    const sql = `SELECT * FROM posts`

    db.all(sql, (err, general_posts) => {
        res.render('home', { 
            userId: req.session.userId,
            username: req.session.username,
            posts: general_posts
        });
    });
});

app.get('/personal', (req, res) => {
    const sql = `SELECT * FROM posts WHERE user_id = ?`

    db.all(sql, [req.session.userId], (err, personal_posts) => {
        res.render('personal', { 
            userId: req.session.userId,
            username: req.session.username,
            posts: personal_posts
        });
    });
})

app.get('/add-post', (req, res) => {
    res.render('add-post');
});

app.get('/post_info/:id', (req, res) => {
    db.get(`SELECT * FROM posts WHERE post_id = ?`, [req.params.id], (err, post) => {
        const sql = `SELECT * FROM replies WHERE post_id = ?`;

        db.all(sql, [req.params.id], (err, replies) => {
            res.render('post-info', {
                post_id: req.params.id,
                post_title: post.title,
                post_content: post.content,
                post_username: post.username,
                replies: replies,
                post_owner_id: post.user_id,
                user_id: req.session.userId
            });
        });
    });
});

app.post('/signup', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;

    const hash = await bcrypt.hash(password, 10);

    const sql = `INSERT INTO users(username, email, password) VALUES (?, ?, ?)`;

    db.run(sql, [username, email, hash], (err) => {
        if (err) {
            return res.send("Error: Username or email already taken. <a href='/signup'>Try again</a>");
        }

        res.redirect('/login');
    });
});

app.post('/login', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    const sql = `SELECT * FROM users WHERE username = ?`;

    db.get(sql, [username], async (err, user) => {
        if(!user) return res.send("User not found. <a href='/login'>Try again</a>");

        const match = await bcrypt.compare(password, user.password);

        if(match){
            req.session.userId = user.user_id;
            req.session.username = user.username;
            res.redirect('/home');
        }
        else{
            res.send("Wrong password. <a href='/login'>Try again</a>");
        }
    });
});

app.post('/add-post', (req, res) => {
    const title = req.body.title;
    const content = req.body.content;
    const user_id = req.session.userId;
    const username = req.session.username;

    const sql = `INSERT INTO posts (user_id, title, content, username) VALUES (?, ?, ?, ?)`;

    db.run(sql, [user_id, title, content, username], (err) => {
        if(err) return res.send("error while adding post");

        res.redirect('/home');
    });
});

app.post('/add-reply/:id', (req, res) => {
    const sql = `INSERT INTO replies (post_id, username, content, user_id) VALUES (?, ?, ?, ?)`;

    db.run(sql, [req.params.id, req.session.username, req.body.content, req.session.userId], (err) => {
        if(err) return res.send("there was a problem with adding your reply");

        res.redirect(`/post_info/${req.params.id}`);
    });
});

app.post('/delete-post/:id', (req, res) => {
    db.get(`SELECT * FROM posts WHERE post_id = ?`, [req.params.id], (err, post) => {
        if (err || !post) {
            return res.send("Post not found");
        }

        if(req.session.userId != post.user_id){
            return res.send("You cannot delete someone else's post");
        }

        db.run(`DELETE FROM posts WHERE post_id = ?`, [req.params.id], (err) => {
            db.run(`DELETE FROM replies WHERE post_id = ?`, [req.params.id], (err) => {
                if(err) return res.send("error with deleting your post");

                res.redirect('/home');
            });
        });
    });
});

app.post('/delete-reply/:id', (req, res) => {
    db.get(`SELECT * FROM replies WHERE reply_id = ?`, [req.params.id], (err, reply) => {
        if(err || !reply) return res.send("No such reply");

        if(reply.user_id != req.session.userId) return res.send("You cannot delete someone else's reply");

        db.run(`DELETE FROM replies WHERE reply_id = ?`, [req.params.id], (err) => {
            if(err) return res.send("There was an error with deleting your reply");

            res.redirect(`/post_info/${reply.post_id}`);
        });
    });
});

app.get('/search', (req, res) => {
    const sql = `SELECT * FROM posts WHERE title LIKE ? OR username LIKE ? OR content LIKE ?`;
    db.all(sql, [req.query.search, req.query.search, req.query.search], (err, query) => {
        if(err) return res.send("There was a problem with your query");

        res.render('home', {
            userId: req.session.userId,
            username: req.session.username,
            posts: query
        });
    });
});

app.get('/search-personal', (req, res) => {
    const sql = `SELECT * FROM posts WHERE user_id = ? AND (title LIKE ? OR username LIKE ? OR content LIKE ?)`;
    db.all(sql, [req.session.userId, req.query.search, req.query.search, req.query.search], (err, query) => {
        if(err) return res.send("There was a problem with your query");

        res.render('personal', {
            userId: req.session.userId,
            username: req.session.username,
            posts: query
        });
    });
});

app.post('/edit-post/:id', (req, res) => {
    db.get(`SELECT * FROM posts WHERE post_id = ?`, [req.params.id], (err, post) => {
        if (err || !post) return res.send("Post not found");
        if (req.session.userId != post.user_id) return res.send("Not your post");

        const sql = `UPDATE posts SET title = ?, content = ? WHERE post_id = ?`;

        db.run(sql, [req.body.title, req.body.content, req.params.id], (err) => {
            if (err) return res.send("Error updating post");
            res.redirect(req.get('Referer') || '/home');
        });
    });
});

app.post('/edit-reply/:id', (req, res) => {
    db.get(`SELECT * FROM replies WHERE reply_id = ?`, [req.params.id], (err, reply) => {
        if (err || !reply) return res.send("Reply not found");
        if (req.session.userId != reply.user_id) return res.send("Not your reply");

        db.run(`UPDATE replies SET content = ? WHERE reply_id = ?`,
            [req.body.content, req.params.id], (err) => {
                if (err) return res.send("Error updating reply");
                res.redirect(`/post_info/${reply.post_id}`);
            });
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});