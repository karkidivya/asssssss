/********************************************************************************* 

WEB322 – Assignment 05
I declare that this assignment is my own work in accordance with Seneca
Academic Policy.  No part of this assignment has been copied manually or 
electronically from any other source (including 3rd party web sites) or 
distributed to other students. I acknoledge that violation of this policy
to any degree results in a ZERO for this assignment and possible failure of
the course. 

Name:   Bibek Prasad Kafle
Student ID:   152656211
Date:  24th July, 2023
Cyclic Web App URL: https://successful-vestments-bass.cyclic.app 
GitHub Repository URL:  https://github.com/Bibek16/Web322_App

********************************************************************************/

const express = require("express");
const itemData = require("./store-service");
const path = require("path");
const clientSessions = require("client-sessions");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

const exphbs = require("express-handlebars");
const { Console, log } = require("console");

 const authData = require('./auth-service')
const dotenv =   require('dotenv')
// const Database = require('./utils/db.js')
dotenv.config()
// const db = new Database();
const URI = process.env.MONGODB_URI
//await
//  db.connectDB( URI )
// authData.initialize(URI);
// let userData = {userName : "divya", userAgent :'eee', email: 'karkidivya5@gmail.com', password : 'test123'}
// authData.register(userData);
cloudinary.config({
  cloud_name: "dmnjamutp",
  api_key: "685879682414194",
  api_secret: "fAtx9wUxPUe1SceuMwjT38TkrCY",

  secure: true,
});
const upload = multer(); 

const app = express();
// app.use(express.json())
const HTTP_PORT = process.env.PORT || 8080;

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.use(function (req, res, next) {
  let route = req.path.substring(1);

  app.locals.activeRoute =
    "/" +
    (isNaN(route.split("/")[1])
      ? route.replace(/\/(?!.*)/, "")
      : route.replace(/\/(.*)/, ""));

  app.locals.viewingCategory = req.query.category;
  
  next();
});

app.engine(
  ".hbs",
  exphbs.engine({
    extname: ".hbs",
    defaultLayout: 'main',
    helpers: {
      // Session : function(){
      //   return(true)
      // },

      navLink: function (url, options) {
        return (
          '<li class="nav-item"><a ' +
          (url == app.locals.activeRoute
            ? ' class="nav-link active" '
            : ' class="nav-link" ') +
          ' href="' +
          url +
          '">' +
          options.fn(this) +
          "</a></li>"
        );
      },
      
      equal: function (lvalue, rvalue, options) {
        if (arguments.length < 3)
          throw new Error("Handlebars Helper equal needs 2 parameters");
        if (lvalue != rvalue) {
          return options.inverse(this);
        } else {
          return options.fn(this);
        }
      },
      formatDate: function (dateObj) {
        let year = dateObj.getFullYear();
        let month = (dateObj.getMonth() + 1).toString();
        let day = dateObj.getDate().toString();
        return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      },
      
    },
  })
);
// app.locals.Session = req.session.user;
app.use(clientSessions({
  cookieName: "session", // this is the object name that will be added to 'req'
  secret: "week10example_web322", // this should be a long un-guessable string.
  duration: 2 * 60 * 1000, // duration of the session in milliseconds (2 minutes)
  activeDuration: 1000 * 60 // the session will be extended by this many ms each request (1 minute)
}));

app.use(function(req, res, next) {
  res.locals.session = req.session;
  next();
});


app.set("view engine", ".hbs");

app.get("/", (req, res) => {
  res.redirect("/login");
});
app.get("/login", (req, res) => {
  res.render("login");
});
app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/shop", async (req, res) => {
  let viewData = {};

  try {
    let items = [];

    if (req.query.category) {
      console.log("categories");
      items = await itemData.getPublishedItemsByCategory(req.query.category);
    } else {
      items = await itemData.getPublishedItems();
    }

    items.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

    let item = items[0];

    viewData.items = items;
    viewData.item = item;
  } catch (err) {
    viewData.message = "no results";
  }

  try {
    let categories = await itemData.getCategories();

    viewData.categories = categories;
  } catch (err) {
    viewData.categoriesMessage = "no results";
  }
  res.render("shop", { data: viewData });
});

app.get("/items",ensureLogin, (req, res) => {
  let queryPromise = null;

  if (req.query.category) {
    queryPromise = itemData.getItemsByCategory(req.query.category);
  } else if (req.query.minDate) {
    queryPromise = itemData.getItemsByMinDate(req.query.minDate);
  } else {
    queryPromise = itemData.getAllItems();
  }

  queryPromise
    .then((data) => {
      if (data.length > 0) {
        res.render("items", { items: data });
      } else {
        res.render("items", { message: "no results" });
      }
    })
    .catch((err) => {
      res.render("items", { message: "no results" });
    });
});


app.get("/items/add",ensureLogin, (req, res) => {
  itemData
    .getCategories()
    .then((data) => {
      res.render("addItem", { categories: data });
    })
    .catch((err) => {
      res.render("addItem", { categories: [] });
    });
});

app.post("/items/add", upload.single("featureImage"), (req, res) => {
  if (req.file) {
    let streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream((error, result) => {
          if (result) {
            resolve(result);
          } else {
            reject(error);
          }
        });

        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    async function upload(req) {
      let result = await streamUpload(req);

      console.log(result);

      return result;
    }

    upload(req)
      .then((uploaded) => {
        processItem(uploaded.url);
      })
      .catch((err) => {
        processItem("");
      });
  } else {
    processItem("");
  }

  function processItem(imageUrl) {
    req.body.featureImage = imageUrl;
    itemData
      .addItem(req.body)
      .then((post) => {
        res.redirect("/items");
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
});
app.get("/item/:id", (req, res) => {
  itemData
    .getItemById(req.params.id)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json({ message: err });
    });
});

app.get("/categories",ensureLogin, (req, res) => {
  itemData
    .getCategories()
    .then((data) => {
      if (data.length > 0) {
        res.render("categories", { categories: data });
      } else {
        res.render("categories", { message: "no results" });
      }
    })
    .catch((err) => {
      res.render("categories", { message: "no results" });
    });
});

app.get("/shop/:id", async (req, res) => {
  let viewData = {};

  try {
    let items = [];

    if (req.query.category) {
      items = await itemData.getPublishedItemsByCategory(req.query.category);
    } else {
      items = await itemData.getPublishedItems();
    }

    items.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

    viewData.items = items;
  } catch (err) {
    viewData.message = "no results";
  }

  try {
    viewData.item = await itemData.getItemById(req.params.id);
  } catch (err) {
    viewData.message = "no results";
  }

  try {
    let categories = await itemData.getCategories();

    viewData.categories = categories;
  } catch (err) {
    viewData.categoriesMessage = "no results";
  }
  res.render("shop", { data: viewData });
});

app.get("/categories/add", (req, res) => {
  console.log(1212);
  res.render("addCategory");
});


app.post("/categories/add", (req, res) => {
  const category = req.body.category.trim();
  if (category) {
    itemData
      .addCategory(category)
      .then((post) => {
        res.redirect("/categories");
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  } else {
    res.render("addCategory", { message: "Category is required" });
  }
});
// const user = {
//   userName: "d",
//   password: "d",
//   email: "karkidivya5@gmail.com"
// };
function ensureLogin(req, res, next) {
  if (!req.session.user) {
    res.redirect("/login");
  } else {
    next();
  }
}

app.post("/login", (req, res) => {
  req.body.userAgent = req.get('User-Agent');
  const userData = req.body
  authData.CheckUser(userData)
  .then((data) => {
    console.log(data, 'gggggggg')
    req.session.user = {
        userName: data.userName,
        email : data.email,
        loginHistory : data.loginHistory
       }
   res.redirect('/items');
})
.catch((err) => {
  res.render("login",{errorMessage: err, userName: req.body.userName});
});

})



// Log a user out by destroying their session
// and redirecting them to /login
app.get("/logout", function(req, res) {
  req.session.reset();
  res.redirect("/login");
});

app.get("/userHistory", function(req,res){
  res.render("userHistory")
})



app.post("/register", (req, res) => {
  const userData = req.body;
    authData.register(userData)
    .then((post)=>{
      res.redirect("/register");
    })
    .catch((err)=>{
      res.status(500).send(err);
    })
      


});

app.get("/categories/delete/:id", (req, res) => {
  itemData
    .deleteCategoryById(req.params.id)
    .then((data) => {
      res.redirect("/categories");
    })
    .catch((err) => {
      res.render("categories", { message: "Unable to Remove Category / Category not found" });
    });
});

app.get("/items/delete/:id", (req, res) => {
  itemData
    .deleteItemById(req.params.id)
    .then((data) => {
      res.redirect("/items");
    })
    .catch((err) => {
      res.status(500).send("Unable to Remove Post / Post not found");
    });
});


app.use((req, res) => {
  res.status(404).render("404");
});



itemData
  .initialize()
  .then( authData.initialize )
  .then(() => {
    app.listen(HTTP_PORT, () => {
      console.log("server listening on: " + HTTP_PORT);
    });
  })
  .catch((err) => {
    console.log(err);
  });

