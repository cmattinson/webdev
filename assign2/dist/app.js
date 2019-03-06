"use strict";
let identifier;
let attachListeners = () => {
    let submit = document.querySelector("#submit-button");
    submit.onclick = clickSubmit;
    let navPresenters = document.querySelector("#nav-presenters");
    navPresenters.onclick = clickPresenters;
    let navResponses = document.querySelector("#nav-responses");
    navResponses.onclick = clickResponses;
    let presentersList = document.querySelector("#presenters");
    presentersList.onclick = clickPresenter;
};
let clickSubmit = (evt) => {
    let input = document.querySelector("#id-box");
    identifier = input.value;
    if (input == null) {
        return;
    }
    loadPresentersList(identifier);
};
let clickPresenters = (evt) => {
    let sectionPresenters = document.querySelector("#presenters-section");
    let sectionAuth = document.querySelector("#auth-section");
    let sectionResponses = document.querySelector("#responses-section");
    sectionPresenters.className = "active";
    sectionResponses.className = "";
    console.log("Clicked presenters");
};
let clickPresenter = (evt) => {
    let target = evt.target;
    let fragment = target.getAttribute("href");
    if (fragment != null) {
        loadPresentationInfo(identifier, fragment.charAt(1));
        loadQuestions(identifier);
    }
};
let clickResponses = (evt) => {
    let sectionResponses = document.querySelector("#responses-section");
    let sectionPresenters = document.querySelector("#presenters-section");
    sectionResponses.className = "active";
    sectionPresenters.className = "";
};
let loadPresentersList = (identifier) => {
    let request = new XMLHttpRequest();
    request.onload = (evt) => {
        let target = document.querySelector("#presenters");
        let json = JSON.parse(request.responseText);
        console.log(json);
        let template = document.querySelector("#presenters-template");
        if (!template.textContent) {
            console.log("Template is missing");
            return;
        }
        let renderFunc = doT.template(template.textContent);
        target.innerHTML = renderFunc(json);
        let sectionAuth = document.querySelector("#auth-section");
        let sectionPresenters = document.querySelector("#presenters-section");
        let sectionNav = document.querySelector("#navigation");
        sectionAuth.className = "";
        sectionNav.className = "active";
        sectionPresenters.className = "active";
    };
    request.open("GET", "http://localhost:8080/api/v1/presenters");
    request.setRequestHeader("Authorization", "Bearer " + identifier);
    request.send();
    return;
};
let loadPresentationInfo = (identifier, fragment) => {
    let request = new XMLHttpRequest();
    let presentationID = parseInt(fragment, 10);
    request.onload = (evt) => {
        let target = document.querySelector("#presenter-info");
        let json = JSON.parse(request.responseText);
        console.log(json);
        let template = document.querySelector("#presenter-info-template");
        if (!template.textContent) {
            console.log("Template is missing");
            return;
        }
        let renderFunc = doT.template(template.textContent);
        target.innerHTML = renderFunc(json);
        let sectionPresenter = document.querySelector("#presenter-info-section");
        let sectionPresenters = document.querySelector("#presenters-section");
        sectionPresenters.className = "";
        sectionPresenter.className = "active";
    };
    let uri = "http://localhost:8080/api/v1/presenters/" + presentationID;
    request.open("GET", uri);
    request.setRequestHeader("Authorization", "Bearer " + identifier);
    request.send();
    return;
};
let loadQuestions = (identifier) => {
    let request = new XMLHttpRequest();
    request.onload = (evt) => {
        let target = document.querySelector("#questions");
        let json = JSON.parse(request.responseText);
        console.log(json);
        let template = document.querySelector("#question-template");
        if (!template.textContent) {
            console.log("#question-template is missing");
            return;
        }
        let renderFunc = doT.template(template.textContent);
        target.innerHTML = renderFunc(json);
        let sectionQuestions = document.querySelector("#questions-section");
        sectionQuestions.className = "active";
    };
    request.open("GET", "http://localhost:8080/api/v1/questions");
    request.setRequestHeader("Authorization", "Bearer " + identifier);
    request.send();
    return;
};
window.onload = () => {
    attachListeners();
};
