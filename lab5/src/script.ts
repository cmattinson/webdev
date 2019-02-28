/* CMPT 315 (Winter 2019)
   Lab #05: HTML, TypeScript, and doT.js

   Author: Nicholas M. Boers
*/

/* ---------------------------------------------------------------------------
   Part 6+: Add behaviour and render a table
   Uncomment the code below when working on Parts 6+.
   ------------------------------------------------------------------------ */

// The emoji data below was retrieved from https://api.github.com/emojis.
// It has been reformatted and abbreviated.
let emojiData = [
    { name: "+1",
      url: "https://github.githubassets.com/images/icons/emoji/unicode/1f44d.png?v8" },
    { name: "-1",
      url: "https://github.githubassets.com/images/icons/emoji/unicode/1f44e.png?v8" },
    { name: "100",
      url: "https://github.githubassets.com/images/icons/emoji/unicode/1f4af.png?v8" },
    { name: "1234",
      url: "https://github.githubassets.com/images/icons/emoji/unicode/1f522.png?v8" },
    { name: "1st_place_medal",
      url: "https://github.githubassets.com/images/icons/emoji/unicode/1f947.png?v8" },
    { name: "2nd_place_medal",
      url: "https://github.githubassets.com/images/icons/emoji/unicode/1f948.png?v8" },
    { name: "3rd_place_medal",
      url: "https://github.githubassets.com/images/icons/emoji/unicode/1f949.png?v8" },
    { name: "8ball",
      url: "https://github.githubassets.com/images/icons/emoji/unicode/1f3b1.png?v8" }
];

let attachNavListeners = (): void => {
    // attach event listeners to the list items in the navigation bar,
    // and in the corresponding function, add and remove active
    // classes (as appropriate) to show the appropriate section
    let navWelcome = <HTMLElement>document.querySelector("#nav-welcome");
    navWelcome.onclick = clickWelcome;

    let navEmojis = <HTMLElement>document.querySelector("#nav-emojis");
    navEmojis.onclick = clickEmojis;
}

let clickWelcome = (evt: MouseEvent): void => {
  let sectionWelcome = <HTMLElement>document.querySelector("#welcome");
  let sectionEmojis = <HTMLElement>document.querySelector("#emojis");

  sectionWelcome.className = "active";
  sectionEmojis.className = "";  
}

let clickEmojis = (evt: MouseEvent): void => {
  let sectionWelcome = <HTMLElement>document.querySelector("#welcome");
  let sectionEmojis = <HTMLElement>document.querySelector("#emojis");

  sectionWelcome.className = "";
  sectionEmojis.className = "active";  
}

let renderEmojiTab = (): void => {
  let template = <HTMLElement>document.querySelector("#emoji-template");
  let target = <HTMLElement>document.querySelector("#emojis-table");

  if (!template.textContent) {
    return;
  }

  let renderFunc = doT.template(template.textContent);
  target.innerHTML = renderFunc(template.textContent)

}


window.onload = (): void => {
    attachNavListeners();
    renderEmojiTab();
}

