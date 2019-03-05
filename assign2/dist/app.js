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
        return;
    }
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            var target = document.querySelector("#presenters-list");
            var json = JSON.parse(request.responseText);
            console.log(json);
            var template = document.querySelector("#presenters-template");
            if (!template.textContent) {
                console.log("Template is missing");
                return;
            }
            var renderFunc = doT.template(template.textContent);
            target.innerHTML = renderFunc(json);
            var sectionAuth = document.querySelector("#auth-section");
            var sectionPresenters = document.querySelector("#presenters-section");
            var sectionNav = document.querySelector("#navigation");
            sectionAuth.className = "";
            sectionNav.className = "active";
            sectionPresenters.className = "active";
        }
        if (this.readyState === 4 && this.status === 401) {
            var target = document.querySelector("#error");
            var response = request.responseText;
            var split = response.split("\n");
            split.splice(0, 1);
            var message = split.join("\n");
            var json = JSON.parse(message);
            var template = document.querySelector("#error-template");
            if (!template.textContent) {
                console.log("#error-template is missing");
                return;
            }
            var renderFunc = doT.template(template.textContent);
            target.innerHTML = renderFunc(json);
            var sectionError = document.querySelector("#error-page");
            var sectionAuth = document.querySelector("#auth-section");
            sectionError.className = "active";
            sectionAuth.className = "";
        }
    };
    request.open("GET", "http://localhost:8080/api/v1/presenters");
    request.setRequestHeader("Authorization", "Bearer " + input.value);
    request.send();
    console.log("Clicked submit");
    return;
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
var clickHello = function (evt) {
    console.log("Clicked");
};
window.onload = function () {
    attachListeners();
};
