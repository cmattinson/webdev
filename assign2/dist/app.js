"use strict";
let identifier;
let presentationID;
let attachListeners = () => {
    let submit = document.querySelector("#submit-button");
    submit.onclick = clickSubmit;
    let navPresenters = document.querySelector("#nav-presenters");
    navPresenters.onclick = clickPresenters;
    let navResponses = document.querySelector("#nav-responses");
    navResponses.onclick = clickResponses;
    let presentersList = document.querySelector("#presenters");
    presentersList.onclick = clickPresenter;
    let submitResponses = document.querySelector("#submit-responses");
    submitResponses.onclick = clickSubmitResponses;
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
    let buttonPresenters = document.querySelector("#nav-presenters");
    let buttonResponses = document.querySelector("#nav-responses");
    sectionPresenters.className = "active";
    sectionResponses.className = "";
    buttonPresenters.className = "active";
    buttonResponses.className = "";
};
let clickPresenter = (evt) => {
    let target = evt.target;
    let fragment = target.getAttribute("href");
    let presID = fragment.charAt(1);
    if (fragment != null) {
        presentationID = parseInt(presID, 10);
        loadPresentationInfo(identifier, presID);
        loadQuestions(identifier);
    }
};
let clickResponses = (evt) => {
    let sectionResponses = document.querySelector("#responses-section");
    let sectionPresenters = document.querySelector("#presenters-section");
    let buttonPresenters = document.querySelector("#nav-presenters");
    let buttonResponses = document.querySelector("#nav-responses");
    sectionResponses.className = "active";
    sectionPresenters.className = "";
    buttonPresenters.className = "";
    buttonResponses.className = "active";
};
let clickSubmitResponses = (evt) => {
    let textAreas = document.querySelectorAll("textarea");
    for (let i = 0; i < textAreas.length; i++) {
        let textArea = textAreas[i];
        let boxName = textArea.name;
        let answer = textArea.value;
        let questionNumber = parseQuestionNumber(boxName);
        manageResponse(identifier, presentationID, "Open", questionNumber, answer);
    }
};
let clickRadioButton = (evt) => {
    let element = evt.target;
    let choiceName = element.name;
    let questionNumber = parseQuestionNumber(choiceName);
    manageResponse(identifier, presentationID, "M/C", questionNumber, element.value);
};
let parseQuestionNumber = (inputName) => {
    let questionNumber = parseInt(inputName[inputName.length - 1], 10);
    questionNumber++;
    return questionNumber;
};
let loadPresentersList = (identifier) => {
    let request = new XMLHttpRequest();
    request.onload = (evt) => {
        let target = document.querySelector("#presenters");
        let json = JSON.parse(request.responseText);
        let template = document.querySelector("#presenters-template");
        if (!template.textContent) {
            console.log("#presenters-template is missing");
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
        let template = document.querySelector("#presenter-info-template");
        if (!template.textContent) {
            console.log("#presenters-info-template is missing");
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
        let template = document.querySelector("#question-template");
        if (!template.textContent) {
            console.log("#question-template is missing");
            return;
        }
        let renderFunc = doT.template(template.textContent);
        target.innerHTML = renderFunc(json);
        let sectionQuestions = document.querySelector("#questions-section");
        sectionQuestions.className = "active";
        let radioButtons = document.querySelectorAll("input[type=radio]");
        let buttonGroupSet = new Set();
        for (let i = 0; i < radioButtons.length; i++) {
            let radioButton = radioButtons[i];
            radioButton.onclick = clickRadioButton;
            buttonGroupSet.add(radioButton.name);
        }
        let iterator = buttonGroupSet.values();
        for (let i = 0; i < buttonGroupSet.size; i++) {
            checkRadioButton(iterator.next().value);
        }
        let textAreas = document.querySelectorAll("textarea");
        for (let i = 0; i < textAreas.length; i++) {
            let textArea = textAreas[i];
            fillPreviousResponse(textArea.name);
        }
    };
    request.open("GET", "http://localhost:8080/api/v1/questions");
    request.setRequestHeader("Authorization", "Bearer " + identifier);
    request.send();
    return;
};
let manageResponse = (responderID, presentationID, questionType, questionNumber, answer) => {
    let request = new XMLHttpRequest();
    let questionID;
    if (questionType === "M/C") {
        questionID = "mc" + questionNumber;
    }
    else if (questionType === "Open") {
        questionID = "open" + questionNumber;
    }
    else {
        return;
    }
    request.onload = (evt) => {
        let json = JSON.parse(request.responseText);
        let questionResponse = new Response();
        questionResponse.responderID = responderID;
        questionResponse.presentationID = presentationID;
        questionResponse.questionType = questionType;
        questionResponse.number = questionNumber;
        questionResponse.answer = answer;
        let responseJSON = JSON.stringify(questionResponse);
        if (json.answer === "") {
            sendResponse(responseJSON);
        }
        else {
            updateResponse(responseJSON);
        }
    };
    let uri = "http://localhost:8080/api/v1/responses/" + presentationID + "/" + questionID;
    request.open("GET", uri);
    request.setRequestHeader("Authorization", "Bearer " + identifier);
    request.send();
};
let checkRadioButton = (buttonGroupName) => {
    let request = new XMLHttpRequest();
    let questionNumber = parseQuestionNumber(buttonGroupName);
    let questionID = "mc" + questionNumber;
    request.onload = (evt) => {
        let json = JSON.parse(request.responseText);
        let buttonGroup = document.querySelectorAll("input[name=" + buttonGroupName + "]");
        for (let i = 0; i < buttonGroup.length; i++) {
            let button = buttonGroup[i];
            if (json.answer === button.value) {
                button.checked = true;
            }
        }
    };
    let uri = "http://localhost:8080/api/v1/responses/" + presentationID + "/" + questionID;
    request.open("GET", uri);
    request.setRequestHeader("Authorization", "Bearer " + identifier);
    request.send();
};
let fillPreviousResponse = (textAreaName) => {
    let request = new XMLHttpRequest();
    let questionNumber = parseQuestionNumber(textAreaName);
    let questionID = "open" + questionNumber;
    request.onload = (evt) => {
        let json = JSON.parse(request.responseText);
        let textArea = document.querySelector("textarea[name=" + textAreaName + "]");
        if (json.answer != "") {
            textArea.value = json.answer;
        }
    };
    let uri = "http://localhost:8080/api/v1/responses/" + presentationID + "/" + questionID;
    request.open("GET", uri);
    request.setRequestHeader("Authorization", "Bearer " + identifier);
    request.send();
};
let sendResponse = (json) => {
    let request = new XMLHttpRequest();
    request.open("POST", "http://localhost:8080/api/v1/presenters/" + presentationID);
    request.setRequestHeader("Authorization", "Bearer " + identifier);
    request.setRequestHeader("Content-Type", "application/json");
    request.send(json);
};
let updateResponse = (json) => {
    let request = new XMLHttpRequest();
    request.open("PUT", "http://localhost:8080/api/v1/presenters/" + presentationID);
    request.setRequestHeader("Authorization", "Bearer " + identifier);
    request.setRequestHeader("Content-Type", "application/json");
    request.send(json);
};
window.onload = () => {
    attachListeners();
};
