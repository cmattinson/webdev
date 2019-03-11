"use strict";
let identifier;
let presentationID;
let attachListeners = () => {
    let submit = document.querySelector("#submit-button");
    submit.onclick = clickSubmit;
    let titleLinks = document.querySelectorAll("#title-items");
    for (let i = 0; i < titleLinks.length; i++) {
        let link = titleLinks[i];
        link.onclick = clickTitleLink;
    }
    let presentersList = document.querySelector("#presenters");
    presentersList.onclick = clickPresenter;
    let submitResponses = document.querySelector("#submit-responses");
    submitResponses.onclick = clickSubmitResponses;
    let otherPresentersSelect = document.querySelector("#other-presenters-select");
    otherPresentersSelect.onchange = changeOtherPresentersSelect;
    let otherPresentationsSelect = document.querySelector("#other-presentations-select");
    otherPresentationsSelect.onchange = changeOtherPresentationsSelect;
};
let parseQuestionNumber = (inputName) => {
    let questionNumber = parseInt(inputName[inputName.length - 1], 10);
    questionNumber++;
    return questionNumber;
};
let renderErrorPage = (json) => {
    let target = document.querySelector("#error");
    let template = document.querySelector("#error-template");
    let sectionError = document.querySelector("#error-page");
    let sectionAuth = document.querySelector("#auth-section");
    let sectionHeader = document.querySelector("#header-section");
    let sectionPresenters = document.querySelector("#presenters-section");
    let sectionQuestions = document.querySelector("#questions-section");
    let sectionPresenterInfo = document.querySelector("#presenter-info-section");
    if (!template.textContent) {
        console.log("#error-template is missing");
        return;
    }
    let renderFunc = doT.template(template.textContent);
    target.innerHTML = renderFunc(json);
    sectionError.className = "active";
    sectionAuth.className = "";
    sectionQuestions.className = "";
    sectionPresenterInfo.className = "";
    sectionHeader.className = "";
    sectionPresenters.className = "";
};
let testIsStudent = (identifier) => {
    let request = new XMLHttpRequest();
    request.onload = (evt) => {
        let json = JSON.parse(request.responseText);
        if (json.statusCode === 401) {
            renderErrorPage(json);
        }
        else {
            loadPresentersList(identifier);
            fillOtherPresentersBox(identifier);
            fillOtherPresentationsBox(identifier);
        }
    };
    request.open("GET", "http://localhost:8080/api/v1/presenters");
    request.setRequestHeader("Authorization", "Bearer " + identifier);
    request.send();
    return;
};
let fillOtherPresentersBox = (identifier) => {
    let request = new XMLHttpRequest();
    request.onload = (evt) => {
        let select = document.querySelector("#other-presenters-select");
        let json = JSON.parse(request.responseText);
        json.forEach(presenter => {
            let display = presenter.firstName + " " + presenter.lastName;
            let value = presenter.presentationID;
            select.options[select.options.length] = new Option(display, value);
        });
    };
    request.open("GET", "http://localhost:8080/api/v1/presenters");
    request.setRequestHeader("Authorization", "Bearer " + identifier);
    request.send();
    return;
};
let fillOtherPresentationsBox = (identifier) => {
    let request = new XMLHttpRequest();
    request.onload = (evt) => {
        let select = document.querySelector("#other-presentations-select");
        let json = JSON.parse(request.responseText);
        json.forEach(presentation => {
            let display = presentation.title;
            let value = presentation.presentationID;
            select.options[select.options.length] = new Option(display, value);
        });
    };
    request.open("GET", "http://localhost:8080/api/v1/presentations");
    request.setRequestHeader("Authorization", "Bearer " + identifier);
    request.send();
    return;
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
        let sectionHeader = document.querySelector("#header-section");
        let sectionPresenters = document.querySelector("#presenters-section");
        let sectionQuestions = document.querySelector("#questions-section");
        let sectionPresenterInfo = document.querySelector("#presenter-info-section");
        sectionAuth.className = "";
        sectionQuestions.className = "";
        sectionPresenterInfo.className = "";
        sectionHeader.className = "active";
        sectionPresenters.className = "active";
    };
    request.open("GET", "http://localhost:8080/api/v1/presenters");
    request.setRequestHeader("Authorization", "Bearer " + identifier);
    request.send();
    return;
};
let loadPresentationInfo = (identifier, idString) => {
    let request = new XMLHttpRequest();
    let presentationID = parseInt(idString, 10);
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
        if (json.answer === "unanswered") {
            sendResponse(responseJSON);
        }
        else if (json.answer === answer) {
            return;
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
        if (json.answer != "unanswered") {
            textArea.value = json.answer;
        }
    };
    let uri = "http://localhost:8080/api/v1/responses/" + presentationID + "/" + questionID;
    request.open("GET", uri);
    request.setRequestHeader("Authorization", "Bearer " + identifier);
    request.send();
};
let sendResponse = (responseJSON) => {
    let request = new XMLHttpRequest();
    request.open("POST", "http://localhost:8080/api/v1/presenters/" + presentationID);
    request.setRequestHeader("Authorization", "Bearer " + identifier);
    request.setRequestHeader("Content-Type", "application/json");
    request.send(responseJSON);
};
let updateResponse = (responseJSON) => {
    let request = new XMLHttpRequest();
    request.open("PUT", "http://localhost:8080/api/v1/presenters/" + presentationID);
    request.setRequestHeader("Authorization", "Bearer " + identifier);
    request.setRequestHeader("Content-Type", "application/json");
    request.send(responseJSON);
};
let showComboBoxes = () => {
    let comboBox1 = document.querySelector("#other-presenters-select");
    let comboBox2 = document.querySelector("#other-presentations-select");
    comboBox1.className = "active";
    comboBox2.className = "active";
};
let hideComboBoxes = () => {
    let comboBox1 = document.querySelector("#other-presenters-select");
    let comboBox2 = document.querySelector("#other-presentations-select");
    comboBox1.className = "";
    comboBox2.className = "";
};
let clearComboBoxes = () => {
    let comboBox1 = document.querySelector("#other-presenters-select");
    let comboBox2 = document.querySelector("#other-presentations-select");
    for (let i = comboBox1.options.length - 1; i >= 0; i--) {
        comboBox1.remove(i);
    }
    for (let i = comboBox2.options.length - 1; i >= 0; i--) {
        comboBox2.remove(i);
    }
};
window.onload = () => {
    attachListeners();
};
