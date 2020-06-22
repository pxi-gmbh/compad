/*helper function to create and style a simple Plenum Button
returns DOM-element with button inside
expects options:
wrapper: string: type of dom-element used as wrapper - defaults to li
className: string: classes to add to the wrapper-element - f.e. state--before-session
innerHTML: string: html-code to put inside the button - not set in simple buttons
onclick: string: javascript to execute on buttonclick (i.e. onclick="${string}")
src: string: if set image with src is used as innerhtml of button
de: string: text to display in tooltip and screenreader in german
en: string: text to display in tooltip and screenreader in english
*/
videoconf.createSimpleButton = function(options){
  wraping = options.wrapper || "li"; //if we want to use it for other then li
  let wrapper = document.createElement(wraping); //create the wrapper
  if(options.className)li.className=options.className; //add defined classes to wrapper
  let innerhtml = options.innerHTML; //if there is innerHTML for specialbuttons we use this
  if(options.src)innerhtml= '<img src="'+options.src+'">'; //if there is src we generate a img-tag with src instead
  //the template:
  let htmltemplate = `
  <button id="${options.id}" class="display-button" onclick="${options.onclick}">
    ${innerhtml}
    <span class="screenreader-only">
    <span lang="de">${options.de}</span>
    <span lang="en">${options.en}</span>
    <span class="msg-active">
      <span lang="de"> ist aktiv</span>
      <span lang="en"> is active</span>
    </span>
    </span>
  </button>
  <span class="tooltip">
    <span lang="de">${options.de}</span>
    <span lang="en">${options.en}</span>
  </span>`;
  //template is now filled
  wrapper.innerHTML=htmltemplate; //add template to wrapper
  return wrapper;
}


/* createButtonHeader creates the titles for all fullscreenbuttons.
it expects an option-object with the corresponding values
tag: the tag used for the title, default is h3
moveButton: boolean, if true a moveButton will be added to the title
expandButton: boolean, if true a expandButton will be added to the title
closeButton: boolean, if true a closeButton will be added to the title
closeTarget: DOM-node: the target to which the button should animate when closed
onCloseButton: function: a function which should be called on closing the Button
titleDe: text for title in german
titleEn: text for title in english
--> moved back to videoconf.js, edit here for plenum
videoconf.createButtonHeader = function(buttonOptions){
  let options = buttonOptions || {};
  let tag = options.tag || "h3";
  let moveButton = options.moveButton;
  let expandButton = options.expandButton;
  let closeButton = options.closeButton;
  let closeTarget = options.closeTarget;
  let onCloseButton = options.onCloseButton;
  let titleDe = options.titleDe || "";
  let titleEn = options.titleEn || "";

  let result = document.createElement(tag);
  result.classList.add("button-title");
  if(expandButton){
    let expb = document.createElement("button");
    expb.innerText = "⇅";
    expb.classList.add("expandbutton");
    expb.onclick = function(){
      this.parentElement.parentElement.classList.toggle("minimized");
      this.parentElement.parentElement.style.position=null;
    }
    result.appendChild(expb);
  }
  if(moveButton){
    let moveb = document.createElement("button");
    moveb.innerText="✣";
    moveb.classList.add("movebutton");
    moveb.onmousedown = function(e){
      var target = this.parentElement.parentElement;
      target.style.position="absolute";
      var onmousemove = function(e){
        target.style.top = e.pageY+"px";
        target.style.left = e.pageX+"px";
      }
      document.addEventListener('mousemove',onmousemove);
      document.addEventListener('mouseup',function(e){
        document.removeEventListener('mousemove',onmousemove);
        document.removeEventListener('mouseup',this);
      });
    }
    result.appendChild(moveb);
  }
  //set title-text german:
  let despan = document.createElement("span");
  despan.lang="de";
  despan.innerText = titleDe;
  result.appendChild(despan);
  //set title-text english:
  let enspan = document.createElement("span");
  enspan.lang="en";
  enspan.innerText=titleEn;
  result.appendChild(enspan);

  if(closeButton){
    //define closebutton:
    let closeb = document.createElement("button");
    closeb.classList.add("closebutton");
    closeb.innerText="𐄂";
    closeb.name=closeTarget;
    closeb.onclick = onCloseButton;
    result.appendChild(closeb);
  }
  return result;
  console.log(tag);
}
*/


/*
initButtons iterates through a given buttonlist-array and
adds buttons to buttonlist
expects:
buttonlist: array with objects with id,src,en,de
targetarea: where it should go to - optional - defaults to #buttonlist
wrapper: type of element to use as wrapper - optional - defaults to "li"
*/

videoconf.initButtons = function(buttonlist,standardclick,targetarea,wrapper){
  let bl = buttonlist || standardbuttons; //use defined buttonlist or standard
  let defaultonclick = standardclick || "videoconf.showButton(this);"; //use defined as default for onclick if predefined if not showButton
  let target = targetarea || document.getElementById("buttonlist"); //use defined target or default buttonlist
  if(target===null)return; //if we dont have a target there is nothing to do
  for(var x=0;x<bl.length;x++){
    //iterating through buttonlist-array
    //options to use for creating a button:
    let options = {
      id:bl[x].id,
      src:bl[x].src, //if there is none its okay to pass it like this
      innerHTML:bl[x].innerHTML, //if there is none its okay to pass it like this
      en:bl[x].en || "", //in case you forgot english text in buttonlist put blank string here
      de:bl[x].de || "", //in case you forgot german text in buttonlist put blank string here
      wrapper: wrapper || "li", //normaly its a li
      onclick:bl[x].onclick || defaultonclick, //if buttonlist-object has onclick use this if not use default
    };
    let buttonelement = this.createSimpleButton(options); //create the button from template
    target.appendChild(buttonelement); //add button to target
  }
}

/*
plenumbuttons: buttonlist-array used to create buttons for plenum-mode
*/

const plenumbuttons = [
  {id:"agree", src:"iconset/status-love-it.svg", de:"zustimmen",en:"i agree"},
  {id:"repeat", src:"iconset/mod-repeat.svg", de:"du wiederholst dich",en:"you made that clear allready"},
  {id:"louder", src:"iconset/mod-speak-up.svg",de:"ich kann dich nicht hören, bitte lauter",en:"speak up please"},
  {id:"pleaserepeat",src:"iconset/call-no-sound.svg",de:"ich habe das letzte nicht hören können, bitte wiederholen", en:"please repeat"},
  {id:"question",src:"iconset/need-clarification.svg",de:"zwischenfrage/verständnisfrage",en:"need clarification"},
  {id:"afk",src:"iconset/status-away.svg",de:"nicht da",en:"afk"},
  {id:"plenum-need-word",src:"iconset/need-word.svg", en:"need word",de:"melden",
    onclick:"videoconf.showPlenumButton(this);videoconf.speakersListAddMe();"
  },
];

/*
standardbuttons: buttonlist-array used to create default mode:
*/
const standardbuttons = [
  {id:"buttonA", src:"iconset/need-word.svg", en:"I'd like to say something", de:"Ich möchte etwas sagen" },
  {id:"buttonB", src:"iconset/need-clarification.svg", en:"I'd like clarification", de:"Ich habe eine Frage"},
  {id:"buttonC", src:"iconset/need-break.svg", en:"I'd like a break", de:"Ich möchte eine Pause"},
  {id:"buttonD", src:"iconset/need-time.svg", en:"I'd like more time", de:"Ich brauche mehr Zeit"},
  {id:"buttonE", src:"iconset/status-got-it.svg", en:"I got this", de:"Ich check das!"},
  {id:"buttonF", src:"iconset/status-love-it.svg", en:"I love this", de:"Ich liebe es!"},
  {id:"buttonG", src:"iconset/status-away.svg", en:"I'm away", de:"Ich bin kurz weg"},
  {id:"buttonO", src:"iconset/status-sorry-preoccupied.svg", en:"sorry, got to take care of something", de:"Entschuldigung, muss mich um etwas kümmern"},
  {id:"buttonP", src:"iconset/call-no-sound.svg", en:"call has no sound", de:"Es kommt kein Ton an"},
  {id:"buttonQ", src:"iconset/call-frozen.svg", en:"video is frozen", de:"Du bist eingefroren"},
  {id:"buttonR", src:"iconset/call-breaking-up.svg", en:"signal is breaking up", de:"Du brichst ab" },
  {id:"buttonS", src:"iconset/call-noise.svg", en:"call has background noise", de:"Es gibt Störgeräusche" },
  {id:"buttonT", src:"iconset/mod-speak-up.svg", en:"please speak up", de:"Du bist mir zu leise" },
//non-standard-buttons:
  {id:"button-Textfield", en:"i want to say something", de:"Ich möchte etwas sagen", onclick:'videoconf.createTextbutton()', innerHTML:'<span lang="en">text</span><span lang="de">Text</span>', },
  {id:"button-simple-timer",
    en:'',de:'', //we dont use screenreader text in timer
    onclick:'videoconf.simpleTimer.showButton(this)',
    innerHTML:`
      <div class="simple-timer">
        <span lang="en">timer</span>
        <span lang="de">Timer</span>
        <div class="simple-timer-clock">
          <span class="simple-timer-clock-middle"></span>
          <span class="simple-timer-clock-top"></span>
          <span class="screenreader-only simple-timer-digital-time"></span>
        </div>
        <div class="simple-timer-small-selection"></div>
        <ul class="simple-timer-big-selection">
          <!-- here are buttons spawned in when in big-mode -->
        </ul>
      </div>
      `
    },
];
videoconf.init();
