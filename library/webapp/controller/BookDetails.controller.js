sap.ui.define(["sap/ui/core/mvc/Controller"], function (BookDetails) {
  "use strict";

  return BookDetails.extend("library.controller.BookDetails", {
    onInit() {
      this.getOwnerComponent()
        .getRouter()
        .getRoute("BookDetails")
        .attachPatternMatched(this.getBookById, this);
      this.localStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);

      this.costumizeFlexBoxes();

      this.ratingIndicator = this.getView().byId("book-rating-indicator");
      this.ratingIndicator.setValue(this.getAverageRating());
      this.ratingIndicator.setEnabled(false);

      this.populateTableOfReviews();
    },

    getBookById: async function () {
      const id = this.getIdFromUrl();
      let books = this.localStorage.get("books");

      let index = books.findIndex((book) => {
        return book.id == id;
      });
      const cover = await this.getBookCover(books[index].title);
      let average = this.getAverageRating();
      if (average == "NaN") {
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

    getIdFromUrl: function () {
      const hashParam = new URLSearchParams(window.location.hash);
      const id = hashParam.get("id");
      return id;
    },

    getBookCover: async function (title) {
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

    costumizeFlexBoxes: function () {
      const titleAndCoverFlexBox = this.getView().byId("flex-box-cover-book");
      titleAndCoverFlexBox.addStyleClass("sapUiMediumPadding");
      titleAndCoverFlexBox.addStyleClass("sapUiMediumMargin");
    },

    onHandleChange: function () {
      let idBook = this.getIdFromUrl();
      this.localStorage.put("ratingValues", [
        ...(this.localStorage.get("ratingValues") ?? []),
        { idBook: idBook, value: this.ratingIndicator.getValue() },
      ]);
    },

    getAverageRating: function () {
      // let ratingValues = this.localStorage.get("ratingValues") ?? [];
      const reviews = this.localStorage.get("reviews") ?? [];
      let idOfCurrentBook = this.getIdFromUrl();

      let sum = 0;
      let counter = 0;
      let average = 0;

      reviews.forEach((review) => {
        if (review.idBook === idOfCurrentBook) {
          sum = sum + review.value;
          counter++;
        }
      });
      average = sum / counter;
      average = average.toFixed(1);
      return average;
    },

    onPostComment: function () {
      const inputText = this.getView().byId("user-feed-input");
      const stars = this.getView().byId("ratinging-indicator-leave-review");
      const tableOfReviews = this.getView().byId("book-reviews");

      //First post the stars:
      const cellStars = new sap.m.RatingIndicator({
        value: stars.getValue(),
        enabled: false,
      });
      const starsToBePosted = new sap.m.ColumnListItem({
        cells: [cellStars],
      });
      tableOfReviews.addItem(starsToBePosted);

      //Add the comment then:
      const flexBox = new sap.m.FlexBox({
        width: "94vw",
        backgroundDesign: "Transparent",
        direction: "Row",
        items: [
          new sap.m.Image({
            src: "/images/student.png",
            height: "5vh",
          }),
          new sap.m.Text({
            text: inputText.getValue(),
          }),
        ],
      });

      const commentToBePosted = new sap.m.ColumnListItem({
        cells: [flexBox],
      });
      const idBook = this.getIdFromUrl();
      const value = stars.getValue();
      const comment = inputText.getValue();

      tableOfReviews.addItem(commentToBePosted);

      //set review to the local storage
      this.localStorage.put("reviews", [
        ...(this.localStorage.get("reviews") ?? []),
        { idBook: idBook, value: value, comment: comment },
      ]);
      location.reload();

      stars.setValue(0);
      this.ratingIndicator.setValue(this.getAverageRating());
    },

    populateTableOfReviews: function () {
      const tableOfReviews = this.getView().byId("book-reviews");
      const currentBookId = this.getIdFromUrl();
      const reviews = this.localStorage.get("reviews") ?? [];
      reviews.forEach((review) => {
        if (review.idBook === currentBookId) {
          const cellStars = new sap.m.RatingIndicator({
            value: review.value,
            enabled: false,
          });
          const starsToBePosted = new sap.m.ColumnListItem({
            cells: [cellStars],
          });
          tableOfReviews.addItem(starsToBePosted);

          const flexBox = new sap.m.FlexBox({
            width: "94vw",
            backgroundDesign: "Transparent",
            direction: "Row",
            items: [
              new sap.m.Image({
                src: "/images/student.png",
                height: "5vh",
              }),
              new sap.m.Text({
                text: review.comment,
              }),
            ],
          });

          const commentToBePosted = new sap.m.ColumnListItem({
            cells: [flexBox],
          });

          tableOfReviews.addItem(commentToBePosted);
        }
      });
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
