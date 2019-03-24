/**
 * CMPT 315 - Assignment 2
 * Author: Chris Mattinson
 * 
 * This program handles the event listeners for the Presentation Feedback System
 */

/**
 * Event listener for the Submit button on the authentication page
 * @param evt Click event
 */
let clickSubmit = (evt: MouseEvent): void => {
    let input = <HTMLInputElement>document.querySelector("#id-box");
    identifier = input.value;

    if (input === null) {
        return;
    }

    testIsStudent(identifier);
}

let clickTitleLink = (evt: MouseEvent): void => {
    let target = <HTMLElement>evt.target;
    let href = target.getAttribute("href");

    if (href === null) {
        return;
    } else if (href === "#all-presenters") {
        loadPresentersList(identifier);
        hideComboBoxes();
    } else if (href === "#log-out") {
        let sections = document.querySelectorAll("section");

        for (let i = 0; i < sections.length; i++) {
            let section = <HTMLElement>sections[i];
            section.className = "";
        }
    
        let sectionAuth = <HTMLElement>document.querySelector("#auth-section");
        sectionAuth.className = "active";

        clearComboBoxes();
    }    
}

/**
 * Event listener for clicking a presenter in the presenters list
 * @param evt Click event
 */
let clickPresenter = (evt: MouseEvent): void => {
    let target = <HTMLElement>evt.target;

    let idString = <string>target.getAttribute("href");

    if (idString != null) {
        let presID = idString.charAt(1);
        presentationID = parseInt(presID, 10);
        loadPresentationInfo(identifier, presID);
        loadQuestions(identifier);

        let select1 = <HTMLSelectElement>document.querySelector("#other-presentations-select");
        let select2 = <HTMLSelectElement>document.querySelector("#other-presenters-select");
        select1.selectedIndex = 0;
        select2.selectedIndex = 0;
        showComboBoxes();
    }
}

/**
 * Event listener for the Save and Close button on the survey form
 * @param evt 
 */
let clickSubmitResponses = (evt: MouseEvent): void => {
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
}

/**
 * Event listener for the radio buttons on the survey form
 * @param evt Click event
 */
let clickRadioButton = (evt: MouseEvent): void => {
    let element = <HTMLInputElement>evt.target;
    let choiceName = element.name;

    // choiceName would be in the form multChoice0, get the 0 from the end and increment it to get the question number
    let questionNumber = parseQuestionNumber(choiceName);
  
    manageResponse(identifier, presentationID, "M/C", questionNumber, element.value);
}

/**
 * Event listener for a change of the other-presenters-select combo box
 * @param evt Change event
 */
let changeOtherPresentersSelect = (evt: Event): void => {
    let select = <HTMLSelectElement>document.querySelector("#other-presenters-select");
    let deselect = <HTMLSelectElement>document.querySelector("#other-presentations-select");
    deselect.selectedIndex = 0;

    presentationID = parseInt(select.value, 10);
    loadPresentationInfo(identifier, select.value);
    loadQuestions(identifier);
}

/**
 * Event listener for a change of the other-presentations-select combo box
 * @param evt Change event
 */
let changeOtherPresentationsSelect = (evt: Event): void => {
    let select = <HTMLSelectElement>document.querySelector("#other-presentations-select");
    let deselect = <HTMLSelectElement>document.querySelector("#other-presenters-select");
    deselect.selectedIndex = 0;

    presentationID = parseInt(select.value, 10);
    loadPresentationInfo(identifier, select.value);
    loadQuestions(identifier);
}