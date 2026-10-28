const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const {username, password} = req.body;
  if (!username || !password) {
    return res.status(400).json({message: "Username and password are required"});
  }
  if (users.some(user => user.username === username)) {
    return res.status(409).json({message: "User already exists!"});
  }
  users.push({username, password});
  return res.status(200).json({message: "User successfully registered. Now you can login"});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const book = books[req.params.isbn];
  if (book) {
    return res.status(200).send(JSON.stringify(book, null, 4));
  }
  return res.status(404).json({message: "Book not found"});
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author.toLowerCase();
  const matches = Object.keys(books)
    .filter(isbn => books[isbn].author.toLowerCase() === author)
    .map(isbn => ({isbn, ...books[isbn]}));
  if (matches.length > 0) {
    return res.status(200).send(JSON.stringify({booksbyauthor: matches}, null, 4));
  }
  return res.status(404).json({message: "No books found for this author"});
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title.toLowerCase();
  const matches = Object.keys(books)
    .filter(isbn => books[isbn].title.toLowerCase() === title)
    .map(isbn => ({isbn, ...books[isbn]}));
  if (matches.length > 0) {
    return res.status(200).send(JSON.stringify({booksbytitle: matches}, null, 4));
  }
  return res.status(404).json({message: "No books found with this title"});
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const book = books[req.params.isbn];
  if (book) {
    return res.status(200).send(JSON.stringify(book.reviews, null, 4));
  }
  return res.status(404).json({message: "Book not found"});
});

// Axios clients that consume the routes above (promise callbacks / async-await)
const BASE_URL = "http://localhost:5000";

// Get all books using a promise callback
const getAllBooks = () => {
  return axios.get(`${BASE_URL}/`)
    .then(response => response.data)
    .catch(error => { throw new Error(`Failed to get books: ${error.message}`); });
};

// Get book details by ISBN using async/await
const getBookByISBN = async (isbn) => {
  try {
    const response = await axios.get(`${BASE_URL}/isbn/${encodeURIComponent(isbn)}`);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to get book by ISBN: ${error.message}`);
  }
};

// Get books by author using async/await
const getBooksByAuthor = async (author) => {
  try {
    const response = await axios.get(`${BASE_URL}/author/${encodeURIComponent(author)}`);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to get books by author: ${error.message}`);
  }
};

// Get books by title using a promise callback
const getBooksByTitle = (title) => {
  return axios.get(`${BASE_URL}/title/${encodeURIComponent(title)}`)
    .then(response => response.data)
    .catch(error => { throw new Error(`Failed to get books by title: ${error.message}`); });
};

module.exports.general = public_users;
module.exports.getAllBooks = getAllBooks;
module.exports.getBookByISBN = getBookByISBN;
module.exports.getBooksByAuthor = getBooksByAuthor;
module.exports.getBooksByTitle = getBooksByTitle;
