//jshint esversion:6
//jshint esversion:8

import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';

// https://forkify-api.herokuapp.com/api/v2/recipes/5ed6604591c37cdc054bc886
//API call

if (module.hot) {
  module.hot.accept();
}

const controlRecipes = async function () {
  try {
    let id = window.location.hash.slice(1) || '5ed6604591c37cdc054bcce6';
    //setting a default recipe
    // if (!id) {
    // id = '5ed6604591c37cdc054bcce6';
    //   return;
    // }

    recipeView.renderSpinner();
    //update results view to mark selected search results
    resultsView.update(model.getSearchResultsPage());
    bookmarksView.update(model.state.bookmarks);
    //loading recipe
    await model.loadRecipe(id);

    //rendering recipe

    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
  }
};

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();

    //get search query
    //default search query
    const query = searchView.getQuery() || 'noodle';

    // let query = searchView.getQuery();
    // if (!query) return;

    //PUT DEFAULT HERE?????

    //load search results
    await model.loadSearchResults(query);
    //render results
    resultsView.render(model.getSearchResultsPage(1));
    //render pagination buttons
    paginationView.render(model.state.search);
  } catch (err) {
    recipeView.renderError();
  }
};

const controlPagination = function (goToPage) {
  //render NEW results
  resultsView.render(model.getSearchResultsPage(goToPage));
  //render NEW pagination buttons
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  //update recipe servings(in state)
  model.updateServings(newServings);
  //update the view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  //add or remove bookmark
  if (!model.state.recipe.bookmarked) {
    model.addBookmark(model.state.recipe);
  } else {
    model.deleteBookmark(model.state.recipe.id);
  }
  //update recipe view
  recipeView.update(model.state.recipe);
  //render bookmarks view
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    //upload new data here
    addRecipeView.renderSpinner();
    await model.uploadRecipe(newRecipe);

    console.log(model.state.recipe);
    recipeView.render(model.state.recipe);
    //success message
    addRecipeView.renderMessage();
    //render bookmark view
    bookmarksView.render(model.state.bookmarks);
    //change id in url
    window.history.pushState(null, '', `#${model.state.recipe.id}`);
    //close form window
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.log(err);
    addRecipeView.renderError(err.message);
  }
};

const init = function () {
  controlSearchResults();
  controlPagination();
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};

init();

//for testing
const clearBookmarks = function () {
  localStorage.clear('bookmarks');
};
