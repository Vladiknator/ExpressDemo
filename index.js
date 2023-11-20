import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
const app = express();
const port = 3000;
// set the public folder to be expresses static folder
app.use(express.static('public'));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// Set EJS as templating engine
app.set('view engine', 'ejs');

// Read items and categories from file
let items = [];
let categories = [];
fs.readFile('items.json', (err, data) => {
    if (err) throw err;
    if (data.length !== 0) {
        items = JSON.parse(data);
    }
});
fs.readFile('categories.json', (err, data) => {
    if (err) throw err;
    if (data.length !== 0) {
        categories = JSON.parse(data);
    }
});


app.get('/', (req, res) => {
    res.render('index', { items: items, categories: categories, selectedItem: null });
});

app.get('/edit/:itemId', (req, res) => {
    const itemId = req.params.itemId;
    const selectedItem = items.find(item => item.id === itemId);
    res.render('index', { items: items, categories: categories, selectedItem: selectedItem });
});

app.post('/add', (req, res) => {
    //create item from the request body
    const item = {
        id: req.body.id || uuidv4(),
        name: req.body.name,
        category: req.body.category
    };

    //check if item with matching ID already exists, if it does then overwrite the item
    //if not then add item to item array
    const existingItemIndex = items.findIndex(i => i.id === item.id);
    if (existingItemIndex > -1) {
        items[existingItemIndex] = item;
    } else {
        items.push(item);
    }
    // Write items to file
    fs.writeFile('items.json', JSON.stringify(items), (err) => {
        if (err) throw err;
    });
    res.redirect('/');
});

app.post('/add-category', (req, res) => {
    const category = req.body.newCategory;
    categories.push(category);
    // Write categories to file
    fs.writeFile('categories.json', JSON.stringify(categories), (err) => {
        if (err) throw err;
    });
    res.redirect('/');
});

app.post('/delete', (req, res) => {
    const itemId = req.body.itemId;
    items = items.filter(item => item.id !== itemId);
    // Write items to file
    fs.writeFile('items.json', JSON.stringify(items), (err) => {
        if (err) throw err;
    });
    res.redirect('/');
});

app.listen(port,  () => {
    console.log(`our server is running on port ${port}`);
});

