const bodyparser = require('body-parser'),
methodoverride = require('method-override');
expresssanitizer = require('express-sanitizer');
mongoose = require('mongoose'),
express = require('express'),
ejs = require('ejs'),
app = express();

// App Config
mongoose.set('useUnifiedTopology', true);
mongoose.set('useFindAndModify', false);
mongoose.connect('mongodb://localhost/blog-app',{useNewUrlParser: true});
app.use(express.static('public'));
app.use(bodyparser.urlencoded({extended:true}));
app.use(expresssanitizer());
app.use(methodoverride('_method'));

let blogSchema =  new mongoose.Schema({
    tittle : String,
    image :  String,
    body : String,
    created : {type : Date, default : Date.now()}
}); 

let blogdb = mongoose.model("blogs",blogSchema);

// Restfull Routes

app.get('/',function(req,res){
    res.redirect('/blogs');
});

// Index route
app.get('/blogs',function(req,res){
    blogdb.find({},function(err,blogs){
        if(!err){
            res.render("index.ejs",{
                blogs : blogs
            });
        }
    });
});

// new route
app.get('/blogs/new',function(req,res){
    res.render('new.ejs');
});

// create route
app.post('/blogs',function(req,res){
    req.body.blog.body = req.sanitize(req.body.blog.body);
    blogdb.create(req.body.blog,function(err,newblog){
        if(err)
            res.render("new.ejs");
        else
            res.redirect('/');
    });
});

// show route
app.get('/blogs/:id',function(req,res){
    blogdb.findById(req.params.id,function(err,foundblog){
        if(err)
            res.redirect('/');
        else{
            res.render("show.ejs",{
                blog : foundblog
            });
        }
    });
});

// edit route
app.get('/blogs/:id/edit',function(req,res){
    blogdb.findById(req.params.id,function(err,foundblog){
        if(err)
            res.redirect('/');
        else{
            res.render("edit.ejs",{
                blog : foundblog
            });
        }
    });

});

// update route
app.put('/blogs/:id',function(req,res){
    req.body.blog.body = req.sanitize(req.body.blog.body);
    blogdb.findByIdAndUpdate(req.params.id,req.body.blog,function(err,updatedblog){
        if(err)
            res.redirect('/');
        else{
            res.redirect('/blogs/'+req.params.id);
        }
    });
});

// Delete route

app.delete('/blogs/:id',function(req,res){
    blogdb.findByIdAndRemove(req.params.id,function(err){
        if(err){
            console.log("error in delete route");
            res.redirect('/');
        }
        else{
            res.redirect('/');
        }
    });
});

app.listen(3000,function(){
    console.log("server has started");
})