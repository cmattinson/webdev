"use strict";
var attachListeners = function () {
    var submit = document.querySelector("#submit-button");
    submit.onclick = clickSubmit;
    var navPresenters = document.querySelector("#nav-presenters");
    navPresenters.onclick = clickPresenters;
    var navResponses = document.querySelector("#nav-responses");
    navResponses.onclick = clickResponses;
};
var clickSubmit = function (evt) {
    var input = document.querySelector("#id-box");
    if (input == null) {
        return false;
    }
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            var body = document.querySelector("#presenters-list");
            body.innerHTML = request.responseText;
        }
    };
    request.open("GET", "http://localhost:8080/api/v1/presenters");
    request.setRequestHeader("Authorization", "Bearer " + input.value);
    request.send();
    var sectionAuth = document.querySelector("#auth-section");
    var sectionPresenters = document.querySelector("#presenters-section");
    var sectionNav = document.querySelector("#navigation");
    sectionAuth.className = "";
    sectionNav.className = "active";
    sectionPresenters.className = "active";
    console.log("Clicked submit");
    return false;
};
var clickPresenters = function (evt) {
    var sectionPresenters = document.querySelector("#presenters-section");
    var sectionAuth = document.querySelector("#auth-section");
    var sectionResponses = document.querySelector("#responses-section");
    sectionPresenters.className = "active";
    sectionResponses.className = "";
    console.log("Clicked presenters");
};
var clickResponses = function (evt) {
    var sectionResponses = document.querySelector("#responses-section");
    var sectionPresenters = document.querySelector("#presenters-section");
    sectionResponses.className = "active";
    sectionPresenters.className = "";
    console.log("Clicked responses");
};
window.onload = function () {
    attachListeners();
};
