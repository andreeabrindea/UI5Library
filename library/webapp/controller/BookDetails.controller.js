sap.ui.define(["sap/ui/core/mvc/Controller"], function (BookDetails) {
  "use strict";

  return BookDetails.extend("library.controller.BookDetails", {
    onInit() {
      this.getOwnerComponent()
        .getRouter()
        .getRoute("BookDetails")
        .attachPatternMatched(this.onGetBookById, this);
      this.localStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);

      this.ratingIndicator = this.getView().byId("book-rating-indicator");
      this.onCostumizeFlexBoxes();
    },
    onGetBookById: async function () {
      const id = this.onGetIdFromUrl();
      let books = this.localStorage.get("books");

      let index = books.findIndex((book) => {
        return book.id == id;
      });
      const cover = await this.onGetBookCover(books[index].title);
      let average = this.getAverageRating();
      if (average == 'NaN'){
        average = 0;
      }
      

      const oModel = new sap.ui.model.json.JSONModel({
        title: books[index].title,
        author: books[index].author,
        genre: books[index].genre,
        year: books[index].year,
        cover: cover,
        average: average,
      });
      this.getView().setModel(oModel, "bookModel");
    },

    onGetIdFromUrl: function () {
      const hashParam = new URLSearchParams(window.location.hash);
      const id = hashParam.get("id");
      return id;
    },

    onGetBookCover: async function (title) {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${title}&orderBy=relevance&printType=BOOKS`
      );
      let cover =
        "https://images.unsplash.com/photo-1589998059171-988d887df646?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8b3BlbiUyMGJvb2t8ZW58MHx8MHx8fDA%3D&w=1000&q=80";
      const data = await response.json();
      if (data.totalItems > 0) {
        if (data.items[0].hasOwnProperty("volumeInfo")) {
          if (data.items[0].volumeInfo.hasOwnProperty("imageLinks")) {
            if (
              data.items[0].volumeInfo.imageLinks.hasOwnProperty("thumbnail")
            ) {
              cover = data.items[0].volumeInfo.imageLinks.thumbnail;
            }
          }
        }
      }
      return cover;
    },
    onCostumizeFlexBoxes: function () {
      const titleAndCoverFlexBox = this.getView().byId("flex-box-cover-book");
      titleAndCoverFlexBox.addStyleClass("sapUiMediumPadding");
      titleAndCoverFlexBox.addStyleClass("sapUiMediumMargin");
    },

    // onUpdateRatingIndicator: function () {
    //   this.ratingCounter = this.localStorage.get("ratingCounter") ?? 0;
    //   this.localStorage.put("ratingValues", [
    //     ...(this.localStorage.get("ratingValues") ?? []),
    //     {
    //       value: ratingIndicator.getValue(),
    //     },
    //   ]);
    // },
    onHandleChange: function () {
      let idBook = this.onGetIdFromUrl();
      this.localStorage.put("ratingValues", [
        ...(this.localStorage.get("ratingValues") ?? []),
        { idBook: idBook, value: this.ratingIndicator.getValue() },
      ]);
    },
    getAverageRating: function () {
      let ratingValues = this.localStorage.get("ratingValues") ?? [];

      let sum = 0;
      let counter = 0;
      let average = 0;
      let idOfCurrentBook = this.onGetIdFromUrl();

      ratingValues.forEach((element) => {
        if (element.idBook == idOfCurrentBook) {
          counter++;
          sum = sum + element.value;
        }
      });
      average = sum / counter;
      return average.toFixed(1);
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
