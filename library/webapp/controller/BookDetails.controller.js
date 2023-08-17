sap.ui.define(["sap/ui/core/mvc/Controller"], function (BookDetails) {
  "use strict";

  return BookDetails.extend("library.controller.BookDetails", {
    onInit() {
      this.getOwnerComponent()
        .getRouter()
        .getRoute("BookDetails")
        .attachPatternMatched(this.oGetBookById, this);
      this.localStoredBooks = jQuery.sap.storage(jQuery.sap.storage.Type.local);
      const titleAndCoverFlexBox = this.getView().byId("flex-box-cover-book");
      titleAndCoverFlexBox.addStyleClass("sapUiMediumPadding");
      titleAndCoverFlexBox.addStyleClass("sapUiMediumMargin");
    },
    oGetBookById: async function () {
      const id = this.oGetIdFromUrl();
      let books = this.localStoredBooks.get("books");

      let index = books.findIndex((book) => {
        return book.id == id;
      });
      const cover = await this.oGetBookCover(books[index].title);

      const oModel = new sap.ui.model.json.JSONModel({
        title: books[index].title,
        author: books[index].author,
        genre: books[index].genre,
        year: books[index].year,
        cover: cover,
      });
      this.getView().setModel(oModel, "bookModel");
    },

    oGetIdFromUrl: function () {
      const hashParam = new URLSearchParams(window.location.hash);
      const id = hashParam.get("id");
      return id;
    },

    oGetBookCover: async function (title) {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${title}&orderBy=relevance&printType=BOOKS`
      );
      let cover =
        "https://images.unsplash.com/photo-1589998059171-988d887df646?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8b3BlbiUyMGJvb2t8ZW58MHx8MHx8fDA%3D&w=1000&q=80";
      const data = await response.json();
      if (data.totalItems > 0) {
       
        if(data.items[0].volumeInfo.imageLinks.hasOwnProperty('thumbnail')){
          cover = data.items[0].volumeInfo.imageLinks.thumbnail;
        }
    
      }
      return cover;
    },
    //TODO: Maybe add a description
    // onGetBookDescription: async function (title) {
    //   const response = await fetch(
    //     `https://www.googleapis.com/books/v1/volumes?q=${title}&orderBy=relevance&printType=BOOKS`
    //   );
    //   let description = "No description found.";
    //   const data = await response.json();
    //   if (data.totalItems > 0) {
    //     if (data.items[0].volumeInfo.imageLinks.thumbnail){
    //       console.log(typeof(data.items[0].volumeInfo.imageLinks));
    //       description = data.items[0].volumeInfo.imageLinks.thumbnail;
    //   }
    // }
    //   return cover;
    // },
  });
});
