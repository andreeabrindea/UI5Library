sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, MessageToast) {
        "use strict";

        return Controller.extend("library.controller.Main", {
            arrayOfBooks: [{

                title: "Harry Potter",

                author: "J.K. Rowling",

                genre: "Fantasy",

                year: "1997"

            },

            {

                title: "The Lord of the Rings",

                author: "J.R.R. Tolkien",

                genre: "Fantasy",

                year: "1954"



            }, {

                title: "The Hobbit",

                author: "J.R.R. Tolkien",

                genre: "Fantasy",

                year: "1937"

            }, {

                title: "The Little Prince",

                author: "Antoine de Saint-Exupéry",

                genre: "Fantasy",

                year: "1943"

            }, {

                title: "Alice's Adventures in Wonderland",

                author: "Lewis Carroll",

                genre: "Fantasy",

                year: "1865"

            }],
            onInit: function () {
                this.clearTable();
                this.populateTable();

            },
            addNewBook: function addNewBook() {
    
                const table = this.getView().byId("books-table");

                const titleInput = this.getView().byId("title-input");
                const authorInput = this.getView().byId("author-input");
                const genreInput = this.getView().byId("genre-input");
                const yearInput = this.getView().byId("year-input");

                const title = titleInput.getValue();
                const author = authorInput.getValue();
                const genre = genreInput.getValue();
                const year = yearInput.getValue();

                if (title != "" && author != "" && genre != "" && year != "") {
                    if (year > 1000 && year <= 2023){
                    this.clearTable();
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

                    this.populateTable();
                    table.addItem(newItem);
                    this.clearBookInputs();

                }
            else{
                yearInput.setValueState("Error");
                MessageToast.show("Invalid year");
            }}
                else{
                    //nedded the function in order to determine which input texts are empty, without a lot of if checks
                    this.verifyBookInputs(title, titleInput);
                    this.verifyBookInputs(author, authorInput);
                    this.verifyBookInputs(genre, genreInput);
                    this.verifyBookInputs(year, yearInput);
                    MessageToast.show("All the fields are required");
                }

            },

            clearTable: function clearTable() {
                const table = this.getView().byId("books-table");
                table.removeAllItems();
            },
            populateTable: function populateTable() {
                const table = this.getView().byId("books-table");
                this.arrayOfBooks.forEach(item => {
                    const cellTitle = new sap.m.Text({ text: item.title });
                    const cellAutor = new sap.m.Text({ text: item.author });
                    const cellYear = new sap.m.Text({ text: item.year });
                    const cellGenre = new sap.m.Text({ text: item.genre });
                    const bookItem1 = new sap.m.ColumnListItem({

                        cells: [cellAutor, cellTitle, cellGenre, cellYear],

                    });
                    table.addItem(bookItem1);

                })

            },
            updateBook: function updateBook(oEvent) {
                const titleInput = this.getView().byId("title-input");
                const authorInput = this.getView().byId("author-input");
                const genreInput = this.getView().byId("genre-input");
                const yearInput = this.getView().byId("year-input");
                const selected = oEvent.getSource().getSelectedItem();
                titleInput.setValue(selected.getCells()[0].getText());
                authorInput.setValue(selected.getCells()[1].getText());
                genreInput.setValue(selected.getCells()[2].getText());
                yearInput.setValue(selected.getCells()[3].getText());

                const title = titleInput.getValue();
                const author = authorInput.getValue();
                const genre = genreInput.getValue();
                const year = yearInput.getValue();

                const cellTitle = new sap.m.Text({ text: title });
                const cellAuthor = new sap.m.Text({ text: author });
                const cellYear = new sap.m.Text({ text: year });
                const cellGenre = new sap.m.Text({ text: genre });
                const newItem = new sap.m.ColumnListItem({

                    cells: [cellTitle, cellAuthor, cellGenre, cellYear],

                });
                table.removeItem();
                table.insertItem(newItem, table.indexOfItem(selected));

            },
            getReadyBook: function getReadyBook() {
                const titleInput = this.getView().byId("title-input");
                const authorInput = this.getView().byId("author-input");
                const genreInput = this.getView().byId("genre-input");
                const yearInput = this.getView().byId("year-input");
                const title = titleInput.getValue();
                const author = authorInput.getValue();
                const genre = genreInput.getValue();
                const year = yearInput.getValue();

                const cellTitle = new sap.m.Text({ text: title });
                const cellAuthor = new sap.m.Text({ text: author });
                const cellYear = new sap.m.Text({ text: year });
                const cellGenre = new sap.m.Text({ text: genre });
                const book = new sap.m.ColumnListItem({

                    cells: [cellTitle, cellAuthor, cellGenre, cellYear],

                });
                return book;

            }, 

            verifyBookInputs: function verifyBookInputs(inputText, inputField){
                if (inputText=== ""){
                    inputField.setValueState("Error");
                }
            },
            clearBookInputs: function clearBookInputs(){
                const titleInput = this.getView().byId("title-input");
                const authorInput = this.getView().byId("author-input");
                const genreInput = this.getView().byId("genre-input");
                const yearInput = this.getView().byId("year-input");

                titleInput.setValue("");
                authorInput.setValue("");
                genreInput.setValue("");
                yearInput.setValue("");
                

            }


        });
    });
