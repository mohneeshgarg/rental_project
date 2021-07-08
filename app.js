const express = require('express');
const ejs = require('ejs');
const app = express();
const ejsMate = require('ejs-mate');
const mongoose = require('mongoose');
const Add = require('./models/addSchema.js');
const multer = require('multer');
const {cloudinary} = require('./cloudinary');
const {storage} = require('./cloudinary');
const upload = multer({storage});
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user.js');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const bodyParser = require('body-parser')

let currentUser;
mongoose.connect('mongodb://localhost:27017/myapp', {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useNewUrlParser: true, useFindAndModify: false})
.then(()=>{
    console.log('Yeh mongoose connected!');
})
.catch(err=>{
    console.log('There is some error');
    console.log(err);
})
const sessionConfig = {
    secret: 'thisismysecret',
    resave: 'true',
    saveUninitialized: 'true',
    cookie:{
        httpOnly: true,
        expires: Date.now() + 1000*60*60*24*7,
        maxAge : 1000*60*60*24*7
    }
};
app.use(bodyParser.json())
app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(flash())
app.use(session(sessionConfig));
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use((req, res, next)=>{
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currentUser = currentUser;
    next();
});
app.set('view engine', 'ejs');
app.engine('ejs', ejsMate);

const isLoggedIn = function(req, res, next){
    if(currentUser){
        next();
    }
    else{
        req.flash('error', 'You need to login first!');
        res.redirect('/login');
    }
}
app.get('/', async (req, res)=>{
    const allitems = await Add.find({});
    res.render('home', {allitems});
})
app.get('/item/:id', async (req, res)=>{
    const item = await Add.findById(req.params.id);
    res.render('show', {item});
})
app.get('/item/:id/edit', async (req, res)=>{
    const item = await Add.findById(req.params.id);
    res.render('edit', {item});
})
app.put('/item/:id/edit', upload.array('image'),async (req, res)=>{
    const {title, contact, location, price} = req.body;
    const id = req.params.id;
    const item = await Add.findById(id);
    await Add.findByIdAndUpdate(id, {title, contact, location, price});
    
    if(req.body.deleteImages){
        for(let img of req.body.deleteImages){
            let i = 0;
            for(let item_img of item.Image){
                if(item_img.filename===img){
                    item.Image.splice(i, 1);
                }
                i+=1;
            }
            cloudinary.uploader.destroy(img);
        }
    }
    const newImages = req.files.map(f=>({filename: f.filename, url: f.path}));
    item.Image.push(...newImages);
    item.save()
    .then(()=>{
        console.log('Item updated!');
    })
    .catch(err=>{
        console.log('There is some error in updation!');
    })
    req.flash('success', 'Item updated!');
    res.redirect('/');
})

app.get('/additems', isLoggedIn, (req, res)=>{
    res.render('new_item');
})
app.post('/additems', upload.array("image"), async (req, res)=>{
    console.log(req.body);
    const {title, contact, location, price} = req.body;
    const newAdd = await new Add({title, contact, location, price});
    newAdd.owner = currentUser;
    newAdd.Image = req.files.map(f=>({filename: f.filename, url: f.path}));
    console.log('check');
    newAdd.save()
    .then(()=>{
        console.log('Add has been added');
    }).catch(err=>{
        console.log('There is some error');
        console.log(err);
    })
    req.flash('success', 'Your item has been added for rent!');
    res.redirect('/');
})

app.delete('/item/:id', async (req, res)=>{
    const id = req.params.id;
    const add = await Add.findById(id);
    for(img of add.Image){
        await cloudinary.uploader.destroy(img.filename);
    }
    await Add.findByIdAndDelete(id);
    req.flash('success', 'Your item deleted successfully');
    res.redirect('/');
})

app.get('/login', (req, res)=>{
    res.render('login');
})
const passportMiddleWare = passport.authenticate('local', {failureFlash: true, failureRedirect:'/login'});
app.post('/login', passportMiddleWare, (req, res)=>{
    req.flash('success', `Welcome back ${req.body.username}`);
    currentUser = req.body.username;
    res.redirect('/');
})
app.get('/logout', (req, res)=>{
    req.logout();
    req.flash('success', 'Successfully log you out!');
    currentUser = undefined;
    res.redirect('/');
})
app.get('/register', (req, res)=>{
    res.render('register');
})
app.post('/register', async (req, res)=>{
    console.log(req.body);
    currentUser = req.body.username;
    const {name, username, password, contact} = req.body;
    const newUser = await new User({name, username, contact});
    const user = await User.register(newUser, password);
    req.flash('success', 'Welcome to out site');
    res.redirect('/');
})

app.listen(3000, ()=>{
    console.log("Listening on port 3000");
})