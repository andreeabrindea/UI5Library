sap.ui.define(["sap/ui/core/mvc/Controller"], function (BookDetails) {
  "use strict";

  return BookDetails.extend("library.controller.BookDetails", {
    onInit() {
      this.getOwnerComponent()
        .getRouter()
        .getRoute("BookDetails")
        .attachPatternMatched(this.myFunction, this);
      this.localStoredBooks = jQuery.sap.storage(jQuery.sap.storage.Type.local);
    },
    myFunction: function () {
      const hashParams = new URLSearchParams(window.location.hash.substr(1));
      const id = hashParams.get("id");
      let books = this.localStoredBooks.get("books");

      const oModel = new sap.ui.model.json.JSONModel({
        title: books[id].title,
        author: books[id].author,
        genre: books[id].genre,
        year: books[id].year,
      });
       this.getView().setModel(oModel);
     // const oView = sap.ui.xmlview({});
      this.setModel(oModel);
      this.placeAt("content");
    },
  });
});
