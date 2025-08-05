// Quick server test
const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.static('public'));

app.get('/test', (req, res) => {
    res.json({ message: 'Server is working!', slides: 133 });
});

app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`📊 Test the server at: http://localhost:${PORT}/test`);
});
