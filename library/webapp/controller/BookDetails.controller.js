sap.ui.define(["sap/ui/core/mvc/Controller"], function (BookDetails) {
  "use strict";

  return BookDetails.extend("library.controller.BookDetails", {
    onInit() {
      this.getOwnerComponent()
        .getRouter()
        .getRoute("BookDetails")
        .attachPatternMatched(this.oGetBookById, this);
      this.localStoredBooks = jQuery.sap.storage(jQuery.sap.storage.Type.local);
    },
    oGetBookById: function () {
      const id = this.oGetIdFromUrl();
      let books = this.localStoredBooks.get("books");

      let index = books.findIndex((book) => {
        return book.id == id;
      });

      const oModel = new sap.ui.model.json.JSONModel({
        title: books[index].title,
        author: books[index].author,
        genre: books[index].genre,
        year: books[index].year,
      });
      this.getView().setModel(oModel);
      //TODO: It is a good idea to set a name to the Model e.g.
      //this.getView().setModel(oModel , "bookModel");
    },

    oGetIdFromUrl: function () {
      const hashParam = new URLSearchParams(window.location.hash);
      const id = hashParam.get("id");
      return id;
    },
  });
});
