const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  return users.some(user => user.username === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
  return users.some(user => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const {username, password} = req.body;
  if (!username || !password) {
    return res.status(400).json({message: "Username and password are required"});
  }
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({message: "Invalid login. Check username and password"});
  }
  const accessToken = jwt.sign({data: username}, "access", {expiresIn: 60 * 60});
  req.session.authorization = {accessToken, username};
  return res.status(200).json({message: "User successfully logged in"});
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const book = books[req.params.isbn];
  if (!book) {
    return res.status(404).json({message: "Book not found"});
  }
  const review = req.query.review;
  if (!review) {
    return res.status(400).json({message: "Review text is required (?review=...)"});
  }
  const username = req.session.authorization.username;
  const existed = book.reviews[username] !== undefined;
  book.reviews[username] = review;
  return res.status(200).json({
    message: `Review ${existed ? "modified" : "added"} for book with ISBN ${req.params.isbn}`,
    reviews: book.reviews
  });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const book = books[req.params.isbn];
  if (!book) {
    return res.status(404).json({message: "Book not found"});
  }
  const username = req.session.authorization.username;
  if (book.reviews[username] === undefined) {
    return res.status(404).json({message: "No review found for this user"});
  }
  delete book.reviews[username];
  return res.status(200).json({
    message: `Review for book with ISBN ${req.params.isbn} deleted`,
    reviews: book.reviews
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
