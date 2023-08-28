sap.ui.define(
    ["sap/ui/core/mvc/Controller"],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
      "use strict";
  
      return Controller.extend("library.controller.Base", {
        onInit: function () {},
        toLanguagePage: function (language) {
          let currentWindow = window.location.href;
          if (currentWindow.includes("&sap-language=EN")) {
            currentWindow = currentWindow.replace("&sap-language=EN", "");
          }
          if (currentWindow.includes("&sap-language=RO")) {
            currentWindow = currentWindow.replace("&sap-language=RO", "");
          }
  
          let sNewUrl = currentWindow + '&'+ language;
          window.location.href = sNewUrl;
        },
    });
}
);

  