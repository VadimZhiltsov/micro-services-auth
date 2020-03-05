var express = require('express');
var app = express();

app.get('/api/goods', function (req, res) {
    res.json({
        goods: [
            'apples',
            'oranges',
            'bullshit'
        ]
    });
});

app.listen(80, function () {
    console.log('Platform service is listening on port 80!');
});
