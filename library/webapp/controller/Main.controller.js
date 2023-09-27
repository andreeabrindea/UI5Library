sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/m/MessageToast", "sap/m/MessageBox"],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller, MessageToast, MessageBox) {
    "use strict";

    return Controller.extend("library.controller.Main", {
      onInit: function () {
        this.localStorage = jQuery.sap.storage(
          jQuery.sap.storage.Type.local
        );
        this.populateTable();

        //Some button costumization
        const addButton = this.getView().byId("add-book-button");
        addButton.addStyleClass("sapUiSmallPadding");
        addButton.addStyleClass("sapUiSmallMargin");
        addButton.addStyleClass("sapUiTextHighlight");

        const ROImage = new sap.m.Image({ src: "/images/romanian.png", width: "4vh"});
        ROImage.attachPress(function () {
          this.toLanguagePage('sap-language=RO');
        }, this);
        

        const UkImage = new sap.m.Image({ src: "/images/united-kingdom.png", width: "4vh"});
        UkImage.attachPress(function () {
          this.toLanguagePage('sap-language=EN');
        }, this);
        
        const FlexBoxImages = this.getView().byId("flex-box-images");
        let currentWindow = window.location.href;

        if (currentWindow.includes("&sap-language=EN")) {
          FlexBoxImages.addItem(ROImage);
        }
        if (currentWindow.includes("&sap-language=RO")) {
          FlexBoxImages.addItem(UkImage);
        }
        if (currentWindow.includes("&sap-language=RO") === false && currentWindow.includes("&sap-language=EN") === false) {
          FlexBoxImages.addItem(ROImage);
        }
      },

      openDialogForAddNewBook: function () {
        this.addBookDialog = sap.ui.xmlfragment(
          "library.view.dialogs.AddBook",
          this
        );
        this.getView().addDependent(this.addBookDialog);
        this.addBookDialog.open();
      },

      onAfterCloseAddDialog: function () {
        this.addBookDialog.close();
        this.addBookDialog.destroy();
      },

      onAddBook: function () {
        const table = this.getView().byId("books-table");

        const titleInput = sap.ui.getCore().byId("title-input-dialog");
        const authorInput = sap.ui.getCore().byId("author-input-dialog");
        const genreInput = sap.ui.getCore().byId("genre-input-dialog");
        const yearInput = sap.ui.getCore().byId("year-input-dialog");

        const title = titleInput.getValue();
        const author = authorInput.getValue();
        const genre = genreInput.getValue();
        const year = yearInput.getValue();

        if (title != "" && author != "" && genre != "" && year != "") {
          if (year > 1000 && year <= 2023) {
            const cellTitle = new sap.m.Text({ text: title });
            const cellAuthor = new sap.m.Text({ text: author });
            const cellYear = new sap.m.Text({ text: year });
            const cellGenre = new sap.m.Text({ text: genre });
            const newItem = new sap.m.ColumnListItem({
              cells: [cellTitle, cellAuthor, cellGenre, cellYear],
            });
            titleInput.setValueState(sap.ui.core.ValueState.None);
            authorInput.setValueState(sap.ui.core.ValueState.None);
            genreInput.setValueState(sap.ui.core.ValueState.None);
            yearInput.setValueState(sap.ui.core.ValueState.None);

            table.addItem(newItem);
            this.counter = this.localStorage.get("counter") ?? 0;
            this.localStorage.put("books", [
              ...(this.localStorage.get("books") ?? []),
              {
                title: title,

                author: author,

                genre: genre,

                year: year,
                id: this.counter
              },
            ]);
            this.counter = this.counter + 1;
            this.localStorage.put("counter", this.counter)
            this.addBookDialog.close();
            this.addBookDialog.destroy();
          } else {
            yearInput.setValueState("Error");
            MessageToast.show("Invalid year");
          }
        } else {
          //nedded the function in order to determine which input texts are empty, without a lot of if checks
          this.verifyBookInputs(title, titleInput);
          this.verifyBookInputs(author, authorInput);
          this.verifyBookInputs(genre, genreInput);
          this.verifyBookInputs(year, yearInput);
          MessageToast.show("All the fields are required");
        }
        this.localStorage
      },

      clearTable: function () {
        const table = this.getView().byId("books-table");
        table.removeAllItems();
      },

      populateTable: function () {
        const table = this.getView().byId("books-table");
        let books = this.localStorage.get("books") ?? [];

        books.forEach((item) => {
          const cellTitle = new sap.m.Text({ text: item.title });
          const cellAutor = new sap.m.Text({ text: item.author });
          const cellYear = new sap.m.Text({ text: item.year });
          const cellGenre = new sap.m.Text({ text: item.genre });
          const bookItem1 = new sap.m.ColumnListItem({
            cells: [cellTitle, cellAutor, cellGenre, cellYear],
          });
          table.addItem(bookItem1);
        });
      },

      openDialogForUpdateDelete: function (oEvent) {
        const selected = oEvent.getParameter("listItem");
        this.updateBookDialog = sap.ui.xmlfragment(
          "library.view.dialogs.EditBook",
          this
        );
        this.getView().addDependent(this.updateBookDialog);
        this.updateBookDialog.open();

        const titleInput = sap.ui.getCore().byId("title-input-dialog");
        const authorInput = sap.ui.getCore().byId("author-input-dialog");
        const genreInput = sap.ui.getCore().byId("genre-input-dialog");
        const yearInput = sap.ui.getCore().byId("year-input-dialog");

        titleInput.setValue(selected.getCells()[0].getText());
        authorInput.setValue(selected.getCells()[1].getText());
        genreInput.setValue(selected.getCells()[2].getText());
        yearInput.setValue(selected.getCells()[3].getText());
      },

      onAfterCloseUpdateDeleteDialog: function () {
        this.updateBookDialog.close();
        this.updateBookDialog.destroy();
      },

      updateBookData: function () {
        const table = this.getView().byId("books-table");
        const titleInput = sap.ui.getCore().byId("title-input-dialog");
        const authorInput = sap.ui.getCore().byId("author-input-dialog");
        const genreInput = sap.ui.getCore().byId("genre-input-dialog");
        const yearInput = sap.ui.getCore().byId("year-input-dialog");

        const selected = table.getSelectedItem();

        if (selected) {
          let books = this.localStorage.get("books");
          //find the index of the selected item from the table
          let index = books.findIndex((book) => {
            return (
              book.title === selected.getCells()[0].getText() &&
              book.author === selected.getCells()[1].getText() &&
              book.genre === selected.getCells()[2].getText() &&
              book.year === selected.getCells()[3].getText()
            );
          });

          const title = titleInput.getValue();
          const author = authorInput.getValue();
          const genre = genreInput.getValue();
          const year = yearInput.getValue();

          selected.getCells()[0].setText(title);
          selected.getCells()[1].setText(author);
          selected.getCells()[2].setText(genre);
          selected.getCells()[3].setText(year);

          //update the values from local storage too
          books[index] = {
            title: title,
            author: author,
            genre: genre,
            year: year,
          };
          this.localStorage.put("books", books);

          this.updateBookDialog.close();
          this.updateBookDialog.destroy();
        }
      },

      onDeleteBook: function () {
        const deleteMessage = this.getView()
          .getModel("i18n")
          .getResourceBundle()
          .getText("deleteMessage");
        MessageBox.confirm(deleteMessage, {
          actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
          emphasizedAction: MessageBox.Action.OK,
          onClose: (sAction) => {
            if (sAction === MessageBox.Action.OK) {
              const table = this.getView().byId("books-table");
              const selected = table.getSelectedItem();

              if (selected) {
                table.removeItem(selected);
                let books = this.localStorage.get("books");

                let index = books.findIndex((book) => {
                  return (
                    book.title === selected.getCells()[0].getText() &&
                    book.author === selected.getCells()[1].getText() &&
                    book.genre === selected.getCells()[2].getText() &&
                    book.year === selected.getCells()[3].getText()
                  );
                });

                books.splice(index, 1);
                this.localStorage.put("books", books);

                this.updateBookDialog.close();
                this.updateBookDialog.destroy();
              }
            }
          },
        });
      },

      onViewDetails: function () {
        const table = this.getView().byId("books-table");
        const selected = table.getSelectedItem();
        let books = this.localStorage.get("books");

        let index = books.findIndex((book) => {
          return (
            book.title === selected.getCells()[0].getText() &&
            book.author === selected.getCells()[1].getText() &&
            book.genre === selected.getCells()[2].getText() &&
            book.year === selected.getCells()[3].getText()
          );
        });

        this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        this.oRouter.navTo("BookDetails", { id: books[index].id });

        this.updateBookDialog.close();
        this.updateBookDialog.destroy();
        location.reload();
      },

      verifyBookInputs: function (inputText, inputField) {
        if (inputText === "") {
          inputField.setValueState("Error");
        }
      },

      toLanguagePage: function (language) {
        let currentWindow = window.location.href;
        if (currentWindow.includes("&sap-language=EN")) {
          currentWindow = currentWindow.replace("&sap-language=EN", "");
        }
        if (currentWindow.includes("&sap-language=RO")) {
          currentWindow = currentWindow.replace("&sap-language=RO", "");
        }

        let sNewUrl = currentWindow + '&' + language;
        window.location.href = sNewUrl;
      },
    });
  }
);
