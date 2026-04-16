const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;

app.use((req, res, next) => {
    if (req.path.indexOf('.html') >= 0) {
        const cleanPath = req.path.replace(/\.html$/, '');
        const query = req.url.slice(req.path.length);
        return res.redirect(301, cleanPath + query);
    }
    next();
});

app.use(express.static(__dirname, {
    extensions: ['html'], 
    index: 'index.html'
}));

app.use((req, res) => {
    res.status(404);
    res.sendFile(path.join(__dirname, '404.html'), (err) => {
        if (err) {
            res.send(`
                <html lang="pt-BR">
                <head>
                    <title>404</title>
                    <style>
                        body { background: #141414; color: white; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }
                        h1 { font-size: 3rem; margin-bottom: 10px; }
                        p { font-size: 1.2rem; color: #b3b3b3; }
                        a { margin-top: 20px; padding: 10px 20px; background: #e50914; color: white; text-decoration: none; border-radius: 4px; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <h1>404</h1>
                    <p>Página não encontrada.</p>
                    <a href="/">Voltar</a>
                </body>
                </html>
            `);
        }
    });
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
    });
}

module.exports = app;