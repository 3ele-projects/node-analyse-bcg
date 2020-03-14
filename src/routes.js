const express = require('express')
const router = express.Router()

router.use(express.json());
var multer = require('multer');

const csv = require('csv-parser')
const fs = require('fs')
const results = [];



router.get('/', (req, res) => {

    res.render('form_upload', {
        'title': 'Tools & Automation'


    })

});

var storage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, './uploads');
    },
    filename: function(req, file, callback) {
        callback(null, file.fieldname + '-' + Date.now());
    }
});

var upload = multer({ storage: storage }).single('csv');


router.post('/analyze', function(req, res) {
    upload(req, res, function(err) {
        if (err) {
            return res.end("Error uploading file.");
        }
        console.log(req.file);
        console.log(req.file.path);
        fs.createReadStream(req.file.path)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => {
                const Klicks = [];
                const Impressionen = [];
                const Position = [];
                const merging = [];
                const Suchanfrage = [];
                /* 
                Wert1 = 200
                Wert2 = 250
                */
                /* y = Wert1/max(Wert1) */
                /* x =(-(Wert2)+max(Wert2))/Max(Wert2)  */
                const a = 250;
                const b = 200
                const sum = new Function('a', 'b', 'return a + b');

                results.forEach(function(data) {
                    Klicks.push(data.Klicks);
                    Impressionen.push(data.Impressionen);
                    Position.push(data.Position);
                    Suchanfrage.push(data.Suchanfrage);
                    merging.push({ 'Position': data.Position, 'Impressionen': data.Impressionen, 'Suchanfrage': data.Suchanfrage })


                });
                console.log(Impressionen);

                var max_imp = Impressionen.reduce(function(a, b) {
                    return Math.max(a, b);
                });

                var max_position = Position.reduce(function(a, b) {
                    return Math.max(a, b);
                });
                // var highest_imp = Math.max.apply(Math, Impressionen.map(function(o) {
                //     return o.Impressionen;
                // }));

                // var highest_suchanfrage = Math.max.apply(Math, merging.map(function(o) {
                //     return o.Suchanfrage;
                // }));

                // var highest_pos = Math.max.apply(Math, merging.map(function(o) {
                //     return o.Position;
                // }));

                console.log(max_imp);

                console.log(max_position);


                data_objects = [];
                merging.forEach(function(data) {



                    const positions = new Function('a', 'amax', 'return a');

                    /* x =(-(Wert2)+max(Wert2))/Max(Wert2)  */

                    const impressionen = new Function('a', 'amax', 'return a');
                    data_objects.push({
                        'Position': positions(data.Position, max_position),
                        'Impressionen': impressionen(data.Impressionen, max_imp),
                        'Suchanfrage': data.Suchanfrage


                    })


                });



                console.log(data_objects);


                res.render('chart', {
                    'title': 'Tools & Automation',
                    'datas': data_objects,
                    'stream': data_objects


                })
            });

    });

});








module.exports = router