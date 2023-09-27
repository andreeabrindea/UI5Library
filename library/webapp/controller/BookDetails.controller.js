sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/ui/core/UIComponent",],

  function (BookDetails, UIComponent) {
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

        this.populateTableOfReviews();
      },

      getRouter: function () {
        return UIComponent.getRouterFor(this);
      },

      navToMainPage: function () {
        this.getRouter().navTo("RouteMain");
      },

      getBookById: async function () {
        const id = this.getIdFromUrl();
        let books = this.localStorage.get("books");

        let index = books.findIndex((book) => {
          return book.id == id;
        });

        let average = this.getAverageRating();
        if (average == "NaN") {
          average = 0;
        }

        const result = await this.getBookInfo(books[index].title);

        const oBookDetailsModel = new sap.ui.model.json.JSONModel({
          title: result.title,
          author: result.author,
          genre: result.genre,
          year: result.publisedDate,
          cover: result.cover,
          average: average,
          description: result.description
        });
        this.getView().setModel(oBookDetailsModel, "bookModel");
      },

      getIdFromUrl: function () {
        const hashParam = new URLSearchParams(window.location.hash);
        const id = hashParam.get("id");
        return id;
      },

      getBookInfo: async function (title) {
        try {
          const response = await fetch(
            `https://www.googleapis.com/books/v1/volumes?q=${title}&orderBy=relevance&printType=BOOKS`
          );
          const data = await response.json();
          const book = data.items?.[0]?.volumeInfo;
          return {
            cover: book?.imageLinks?.thumbnail || "https://images.unsplash.com/photo-1589998059171-988d887df646?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8b3BlbiUyMGJvb2t8ZW58MHx8MHx8fDA%3D&w=1000&q=80",
            description: book?.description,
            author: book?.authors?.[0],
            publisedDate: book?.publishedDate,
            genre: book?.categories?.[0],
            title: book?.title
          };
        } catch (error) {
          console.log("There was a problem while fetching the information about the book", error);
          return null;
        }
      },

      costumizeFlexBoxes: function () {
        const titleAndCoverFlexBox = this.getView().byId("flex-box-cover-book");
        titleAndCoverFlexBox.addStyleClass("sapUiMediumPadding");
        titleAndCoverFlexBox.addStyleClass("sapUiMediumMargin");
      },

      getAverageRating: function () {
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
        this.counterForReviews = this.localStorage.get("counterReviews") ?? 0;

        const idBook = this.getIdFromUrl();

        //verify if there are more than 3 reviews for the current book
        const allTheReviews = this.localStorage.get("reviews") ?? [];
        let reviewsForCurrentBook = [];

        allTheReviews.forEach((review) => {
          if (review.idBook === idBook) {
            reviewsForCurrentBook.push(review);
          }
        });
        if (reviewsForCurrentBook.length <= 2) {
          this.addRateIndicatorToTable(stars.getValue(), tableOfReviews);
          this.addCommentToTable(inputText.getValue(), tableOfReviews);

          const value = stars.getValue();
          const comment = inputText.getValue();

          //set review to the local storage
          this.localStorage.put("reviews", [
            ...(this.localStorage.get("reviews") ?? []),
            {
              idReview: this.counterForReviews,
              idBook: idBook,
              value: value,
              comment: comment,
            },
          ]);

          //increase the counter
          this.counterForReviews = this.counterForReviews + 1;
          stars.setValue(0);

          //Update the current rating
          const currentRating = this.getAverageRating();
          this.ratingIndicator.setValue(currentRating);
          const averageRatingLabel = this.getView().byId("average-rating");
          const averageRatingText = currentRating + "/5";
          averageRatingLabel.setText(averageRatingText);
        } else {
          this.openDialogForWarning();
          stars.setValue(0);
        }
      },

      openDialogForWarning: function () {
        this.addWarningDialog = sap.ui.xmlfragment(
          "library.view.dialogs.AddReviewWarning",
          this
        );
        this.getView().addDependent(this.addWarningDialog);
        this.addWarningDialog.open();
      },

      onAfterCloseWarningDialog: function () {
        this.addWarningDialog.close();
        this.addWarningDialog.destroy();
      },

      onDeleteReview: function () {
        let reviews = this.controller.localStorage.get("reviews") ?? [];

        reviews = reviews.filter((review) => {
          return review.comment != this.param1;
        });
        this.controller.localStorage.put("reviews", reviews);

        const table = this.controller.getView().byId("book-reviews");
        table.removeAllItems();
        this.controller.populateTableOfReviews();

        //Update the current rating
        const currentRating = this.controller.getAverageRating();
        this.controller.ratingIndicator.setValue(currentRating);
        const averageRatingLabel = this.controller.getView().byId("average-rating");
        const averageRatingText = currentRating + "/5";
        averageRatingLabel.setText(averageRatingText);

      },

      populateTableOfReviews: function () {
        const tableOfReviews = this.getView().byId("book-reviews");
        const currentBookId = this.getIdFromUrl();
        const reviews = this.localStorage.get("reviews") ?? [];
        reviews.forEach((review) => {
          if (review.idBook === currentBookId) {
            this.addRateIndicatorToTable(review.value, tableOfReviews);
            this.addCommentToTable(review.comment, tableOfReviews);
          }
        });
      },

      addRateIndicatorToTable(value, tableOfReviews) {
        const stars = new sap.m.RatingIndicator({
          value: value,
          enabled: false,
        });
        const flexBox = new sap.m.FlexBox({
          width: "94vw",
          backgroundDesign: "Transparent",
          direction: "Row",
          items: [stars],
        });

        const starsToBePosted = new sap.m.ColumnListItem({
          cells: [flexBox],
        });
        tableOfReviews.addItem(starsToBePosted);
      },

      addCommentToTable(textOfTheReview, tableOfReviews) {
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
              text: textOfTheReview,
            }),
          ],
        });

        const commentToBePosted = new sap.m.ColumnListItem({
          cells: [flexBox],
        });

        tableOfReviews.addItem(commentToBePosted);

        const deleteButton = new sap.m.Button({
          type: "Reject",
          text: "Delete",
        });
        deleteButton.attachPress(this.onDeleteReview, {
          param1: textOfTheReview,
          controller: this,
        });
        const buttonToBeAdded = new sap.m.ColumnListItem({
          cells: [deleteButton],
        });
        tableOfReviews.addItem(buttonToBeAdded);
      },
    });
  });
