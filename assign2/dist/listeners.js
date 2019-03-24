"use strict";
let clickSubmit = (evt) => {
    let input = document.querySelector("#id-box");
    identifier = input.value;
    if (input === null) {
        return;
    }
    testIsStudent(identifier);
};
let clickTitleLink = (evt) => {
    let target = evt.target;
    let href = target.getAttribute("href");
    if (href === null) {
        return;
    }
    else if (href === "#all-presenters") {
        loadPresentersList(identifier);
        hideComboBoxes();
    }
    else if (href === "#log-out") {
        let sections = document.querySelectorAll("section");
        for (let i = 0; i < sections.length; i++) {
            let section = sections[i];
            section.className = "";
        }
        let sectionAuth = document.querySelector("#auth-section");
        sectionAuth.className = "active";
        clearComboBoxes();
    }
};
let clickPresenter = (evt) => {
    let target = evt.target;
    let idString = target.getAttribute("href");
    if (idString != null) {
        let presID = idString.charAt(1);
        presentationID = parseInt(presID, 10);
        loadPresentationInfo(identifier, presID);
        loadQuestions(identifier);
        let select1 = document.querySelector("#other-presentations-select");
        let select2 = document.querySelector("#other-presenters-select");
        select1.selectedIndex = 0;
        select2.selectedIndex = 0;
        showComboBoxes();
    }
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
    loadPresentersList(identifier);
    hideComboBoxes();
};
let clickRadioButton = (evt) => {
    let element = evt.target;
    let choiceName = element.name;
    let questionNumber = parseQuestionNumber(choiceName);
    manageResponse(identifier, presentationID, "M/C", questionNumber, element.value);
};
let changeOtherPresentersSelect = (evt) => {
    let select = document.querySelector("#other-presenters-select");
    let deselect = document.querySelector("#other-presentations-select");
    deselect.selectedIndex = 0;
    presentationID = parseInt(select.value, 10);
    loadPresentationInfo(identifier, select.value);
    loadQuestions(identifier);
};
let changeOtherPresentationsSelect = (evt) => {
    let select = document.querySelector("#other-presentations-select");
    let deselect = document.querySelector("#other-presenters-select");
    deselect.selectedIndex = 0;
    presentationID = parseInt(select.value, 10);
    loadPresentationInfo(identifier, select.value);
    loadQuestions(identifier);
};
