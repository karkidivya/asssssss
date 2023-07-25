/********************************************************************************* 

WEB322 – Assignment 02 
I declare that this assignment is my own work in accordance with Seneca
Academic Policy.  No part of this assignment has been copied manually or 
electronically from any other source (including 3rd party web sites) or 
distributed to other students. I acknoledge that violation of this policy
to any degree results in a ZERO for this assignment and possible failure of
the course. 

Name:   
Student ID:   
Date:  
Cyclic Web App URL:  
GitHub Repository URL:  

********************************************************************************/
const Sequelize = require("sequelize");
var sequelize = new Sequelize("fttopwel", "fttopwel", "qaZeBGuEf4Z2fSzBSyD6yL-g-4idcitp", {
  host: "stampy.db.elephantsql.com",
  dialect: "postgres",
  port: 5432,
  dialectOptions: {
    ssl: { rejectUnauthorized: false }
  },
  query: { raw: true },
});

// Define the Item model
const Item = sequelize.define("item", {
  body: Sequelize.TEXT,
  title: Sequelize.STRING,
  postDate: Sequelize.DATE,
  featureImage: Sequelize.STRING,
  published: Sequelize.BOOLEAN,
  price: Sequelize.DOUBLE,
});

// Define the Category model
const Category = sequelize.define("category", {
  category: Sequelize.STRING,
});

// Define the relationship: Item belongs to Category
Item.belongsTo(Category, { foreignKey: "categoryId" });

// Export the models
module.exports = {
  Item,
  Category,
};

// Initialize the database
module.exports.initialize = function () {
  return new Promise((resolve, reject) => {
    sequelize
      // .sync()
      .authenticate()
      .then(() => {
        sequelize.sync()
        resolve();
      })
      .catch((error) => {
        console.error("Error synchronizing models:", error);
        reject("unable to sync the database");
      });
    
  });
};

module.exports.getAllItems = function () {
  return new Promise((resolve, reject) => {
    Item.findAll()
      .then((data) => {
        if (data.length > 0) {
          resolve(data);
        } else {
          reject("no results returned");
        }
      })
      .catch((err) => {
        reject("no results returned");
      });
  });
};

module.exports.getItemsByCategory = function (category) {
  return new Promise((resolve, reject) => {
    Item.findAll({
      where: {
        categoryId: category,
      },
    })
      .then((data) => {
        if (data.length > 0) {
          resolve(data);
        } else {
          reject("no results returned");
        }
      })
      .catch((err) => {
        reject("no results returned");
      });
  });
};

module.exports.getItemsByMinDate = function (minDateStr) {
  return new Promise((resolve, reject) => {
    Item.findAll({
      where: {
        postDate: {
          [Sequelize.Op.gte]: new Date(minDateStr),
        },
      },
    })
      .then((data) => {
        if (data.length > 0) {
          resolve(data);
        } else {
          reject("no results returned");
        }
      })
      .catch((err) => {
        reject("no results returned");
      });
  });
};

module.exports.getItemById = function (id) {
  return new Promise((resolve, reject) => {
    Item.findAll({
      where: {
        id: id,
      },
    })
      .then((data) => {
        if (data.length > 0) {
          resolve(data[0]);
        } else {
          reject("no results returned");
        }
      })
      .catch((err) => {
        reject("no results returned");
      });
  });
};

module.exports.addItem = function (itemData) {
  return new Promise((resolve, reject) => {
    itemData.published = itemData.published ? true : false;
    for (const prop in itemData) {
      if (itemData[prop] === "") {
        itemData[prop] = null;
      }
    }
    itemData.postDate = new Date();
    Item.create(itemData)
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject("unable to create post");
      });
  });
};

module.exports.getPublishedItems = function () {
  return new Promise((resolve, reject) => {
    Item.findAll({
      where: {
        published: true,
      },
    }).then((data) => {
      if (data.length > 0) {
        resolve(data);
      } else {
        reject("no results returned");
      }
    });
  });
};

module.exports.getPublishedItemsByCategory = function (category) {
  return new Promise((resolve, reject) => {
    Item.findAll({
      where: {
        categoryId: category,
        published: true,
      },
    })
      .then((data) => {
        if (data.length > 0) {
          resolve(data);
        } else {
          reject("no results returned");
        }
      })
      .catch((err) => {
        reject("no results returned");
      });
  });
};

module.exports.getCategories = function () {
  return new Promise((resolve, reject) => {
    Category.findAll()
      .then((data) => {
        if (data.length > 0) {
          resolve(data);
        } else {
          reject("no results returned");
        }
      })
      .catch((err) => {
        reject("no results returned");
      });
  });
};

module.exports.addCategory = function (categoryData) {
  return new Promise((resolve, reject) => {
    if (categoryData === "") {
      categoryData[prop] = null;
    }
    Category.create({category: categoryData})
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject("unable to create category");
      });
  });
};

module.exports.deleteCategoryById = function (id) {
  return new Promise((resolve, reject) => {
    Category.destroy({
      where: {
        id: id,
      },
    })
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject("unable to delete category");
      });
  });
};

module.exports.deleteItemById = function (id) {
  return new Promise((resolve, reject) => {
    Item.destroy({
      where: {
        id: id,
      },
    })
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject("unable to delete post");
      });
  });
};

module.exports.deletePostById = function (id) {
  return new Promise((resolve, reject) => {
    Item.destroy({
      where: {
        id: id,
      },
    })
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject("unable to delete post");
      });
  });
}
