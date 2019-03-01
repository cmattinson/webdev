let attachListeners = (): void => {
    let submit = <HTMLElement>document.querySelector("#submit-button");
    submit.onclick = clickSubmit;

    let navPresenters = <HTMLElement>document.querySelector("#nav-presenters")
    navPresenters.onclick = clickPresenters;

    let navResponses = <HTMLElement>document.querySelector("#nav-responses")
    navResponses.onclick = clickResponses;
}

let clickSubmit = (evt: MouseEvent): boolean => {
    let input = <HTMLInputElement>document.querySelector("#id-box");

    if (input == null) {
        return false;
    }

    let request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            let body = <HTMLElement>document.querySelector("#presenters-list");
            body.innerHTML = request.responseText;
        }
    }
    request.open("GET", "http://localhost:8080/api/v1/presenters");
    request.setRequestHeader("Authorization", "Bearer " + input.value);
    request.send();



    let sectionAuth = <HTMLElement>document.querySelector("#auth-section");
    let sectionPresenters = <HTMLElement>document.querySelector("#presenters-section");
    let sectionNav = <HTMLElement>document.querySelector("#navigation")
    sectionAuth.className = "";
    sectionNav.className = "active";
    sectionPresenters.className = "active";

    console.log("Clicked submit");
    return false;
}

let clickPresenters = (evt: MouseEvent): void => {
    let sectionPresenters = <HTMLElement>document.querySelector("#presenters-section");
    let sectionAuth = <HTMLElement>document.querySelector("#auth-section");
    let sectionResponses = <HTMLElement>document.querySelector("#responses-section");
    
    sectionPresenters.className = "active";
    sectionResponses.className = "";

    console.log("Clicked presenters");
}

let clickResponses = (evt: MouseEvent): void => {
    let sectionResponses = <HTMLElement>document.querySelector("#responses-section");
    let sectionPresenters = <HTMLElement>document.querySelector("#presenters-section");

    sectionResponses.className = "active";
    sectionPresenters.className = "";

    console.log("Clicked responses");
}

window.onload = (): void => {
    attachListeners();
}

