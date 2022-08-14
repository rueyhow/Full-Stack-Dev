const express = require("express");
const router = express.Router();
const flashMessage = require("../helpers/messenger");
const Product = require("../models/Product");
// Required for file upload
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { Storage } = require("@google-cloud/storage");
let projectId = "handyhandphone";
const storage = new Storage({
  projectId,
  keyfilename: path.join(__dirname, "../handyhandphone-1075b995e1de.json"),
});

const bucket = storage.bucket("handyhandphone");

router.get("/product", (req, res) => {
  res.render("/product/product");
});

router.get("/productpage", (req, res) => {
  Product.findAll({}).then((products) => {
    res.render("product/productpage", { products: products });
  });
});

router.get("/productmobile", (req, res) => {
  Product.findAll({ where: { category: "Mobile Device" } }).then((products) => {
    console.log(products);
    res.render("product/productmobile", { products: products });
  });
});

router.get("/productaccessories", (req, res) => {
  Product.findAll({ where: { category: "Accessories" } }).then((products) => {
    console.log(products);
    res.render("product/productaccessories", { products: products });
  });
});

router.get("/productadmin", (req, res) => {
  Product.findAll({}).then((products) => {
    res.render("product/productadmin", { products: products });
  });
});

router.get("/addproduct", (req, res) => {
  res.render("product/addproduct");
});

router.post("/addproduct", (req, res) => {
  var buffer = require("buffer/").Buffer;
  let name = req.body.name;
  let category = req.body.category;
  let price = req.body.price;
  let stock = req.body.stock;
  let description = req.body.description;
  let img = req.files.productPic.name;
  var date = Date.now().toString();
  const mainFile = req.files.productPic;
  const blob = bucket.file(date + mainFile.name);
  const blobStream = blob.createWriteStream({
    resumable: false,
    gzip: true,
  });
  blobStream.on("finish", async () => {
    let product = await Product.create({
      name: name,
      category: category,
      price: price,
      stock: stock,
      description: description,
      productPic: date + mainFile.name,
    });
    res.redirect("/product/productadmin");
  });
  blobStream.end(mainFile.data);
});

router.get("/productdetails/:id", (req, res) => {
  var id = req.params.id;
  Product.findByPk(id)
    .then((product) => {
      res.render("product/productdetails", { product: product });
    })
    .catch((err) => console.log(err));
});

router.get("/editProduct/:id", (req, res) => {
  var id = req.params.id;
  Product.findByPk(id)
    .then((product) => {
      res.render("product/editProduct", { product: product });
    })
    .catch((err) => console.log(err));
});

router.post("/editProduct/:id", (req, res) => {
  let { name, price, stock, description } = req.body;
  var id = req.params.id;
  Product.update({ name, price, stock, description }, { where: { id: id } });
  res.redirect("/product/productpage");
});

router.get("/deleteProduct/:id", async function (req, res) {
  let product = await Product.findByPk(req.params.id);
  let result = await Product.destroy({ where: { id: product.id } });
  res.redirect("back");
});
module.exports = router;
