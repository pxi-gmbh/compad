var videoconf = {
  room:null,
  id:null,
  username:null,
  timer:[],
  timeout:null,
  actbutton:null,
};

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
*/
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
    //closeb.innerText="𐄂"; //old style, but now easier to edit with template:
    let closehtmltemplate = `
    <span class="screenreader-only">
      <span lang="de">meldung schließen</span>
      <span lang="en">close button</span>
    </span>
    <span class="buttonspan">𐄂</span>
    `;
    closeb.innerHTML = closehtmltemplate;
    closeb.name=closeTarget;
    closeb.onclick = onCloseButton;
    result.appendChild(closeb);
  }
  return result;
  console.log(tag);
}

/*helper function to create and style a simple Plenum Button*/
videoconf.createSimpleButton = function(options){
  wraping = options.wrapper || "li";
  let wrapper = document.createElement(wraping);
  if(options.className)li.className=options.className;
  let html = `<button id="${options.id}" class="display-button" onclick="${options.onclick}">
  <img src="${options.src}">
</button>
<span class="tooltip">
  <span lang="de">${options.de}</span>
   <span lang="en">${options.en}</span>
</span>`;
  wrapper.innerHTML=html;
  return wrapper;
}

videoconf.init = function(){
  this.renderArea = document.getElementById("renderArea");

  let timerminutes = document.getElementById("timerminutes");
  let timerseconds = document.getElementById("timerseconds");

  if(location.search!=""){
    this.room = location.search.substring(1);
    let ivlink = document.getElementById("showInviteLinks");
    if(ivlink)ivlink.parentElement.removeChild(ivlink);
    let startlink = document.getElementById("start-session");
    if(startlink)startlink.parentElement.removeChild(startlink);
    document.body.classList.add("guest");

  setTimeout("videoconf.startConf();",500);
  }
  window.addEventListener("keyup",function(e){
    if(e.key==="Escape"){
      let closebutton = document.getElementsByClassName("closebutton");
      if(closebutton.length>0)closebutton[closebutton.length-1].click();
    }
  });
  let acthash = location.hash;
  document.location.hash="historyhack";
  //setTimeout('document.location.hash="";',10);
  window.addEventListener("hashchange",function(e){
    console.log(e,location);
    if(document.location.hash==="#historyhack"){
      //emulate escape:
      let closebutton = document.getElementsByClassName("closebutton");
      if(closebutton.length>0)closebutton[closebutton.length-1].click();
      document.location.hash="";
    }
    if(document.location.hash==="#plenum"){
      videoconf.initPlenum();
    }
  });
  if(acthash==="#plenum" || location.href.indexOf("plenum")>-1)this.initPlenum();
}

videoconf.initPlenum = function(){
  document.body.classList.add("mode--plenum");
  videoconf.addPlenumUserList();
  let buttonlist = document.getElementById("buttonlist");
  buttonlist.innerHTML="";
  this.initButtons(plenumbuttons,"videoconf.showPlenumButton(this)");
  /*
  let plenumbuttons = [
    {id:"agree", src:"iconset/status-love-it.svg", de:"zustimmen",en:"i agree"},
    {id:"repeat", src:"iconset/mod-repeat.svg", de:"du wiederholst dich",en:"you made that clear allready"},
    {id:"louder", src:"iconset/mod-speak-up.svg",de:"ich kann dich nicht hören, bitte lauter",en:"speak up please"},
    {id:"pleaserepeat",src:"iconset/call-no-sound.svg",de:"ich habe das letzte nicht hören können, bitte wiederholen", en:"please repeat"},
    {id:"question",src:"iconset/need-clarification.svg",de:"zwischenfrage/verständnisfrage",en:"need clarification"},
    {id:"afk",src:"iconset/status-away.svg",de:"nicht da",en:"afk"},
  ];
  for(var x=0;x<plenumbuttons.length;x++){
    let act = plenumbuttons[x];
    let options = {
    id: act.id, src:act.src,de:act.de,en:act.en,
    wrapper:"li",
    onclick:"videoconf.showPlenumButton(this)",
    };
    buttonlist.appendChild(this.createSimpleButton(options));
  }
  let addmeb = this.createSimpleButton({
    id:"plenum-need-word",src:"iconset/need-word.svg",
    wrapper:"li",en:"need word",de:"melden",
    onclick:"videoconf.showPlenumButton(this);videoconf.speakersListAddMe();"
  });
  buttonlist.appendChild(addmeb);
  */
  let ivlinks = document.getElementById("showInviteLinks")
  if(ivlinks)ivlinks.onclick = function(){
    videoconf.createSession();
    this.onclick = function(){videoconf.showInviteLinks();};
    this.innerHTML = '<span lang="de">einladen</span><span lang="en">invite</span>'
  }
  let localuseredit = document.getElementById("localusernameEditable");
  localuseredit.onkeypress = function(e){
    if(e.key==="Enter"){
      videoconf.setUserName(this.innerText);
      this.parentElement.classList.toggle('editable');
      e.preventDefault();

    }
  }

}

videoconf.enterRoom = function(){
  this.room = document.getElementById("roomname").value;
  document.getElementById("roomnamewrapper").style.display="none";
  this.startConf();
}

videoconf.startConf = function(){
  let target = document.getElementById("expandbutton--controls");
  if(target===null)target = document.getElementById("showInviteLinks");
  if(target)this.showMenu(target,"response-message",true);
  ws.init();
}

videoconf.showInitMessage = function(msg){

  document.getElementById("response-message").innerText=msg;

  //this.showMenu(document.getElementById("expandbutton--controls"),"response-message",true);
  if(!ws.isCreator)setTimeout(function(){
    let respmsg = document.getElementById("response-message");
    if(respmsg.parentElement!=document.body)respmsg.parentElement.querySelector(".closebutton").click();
  },3000);

}

/*moveElementAnimation is a function to animate the opening and closing
of buttons and menus, although it can be used more widespreadly
expects
element: a DOM-node which should be moved
source: an existing and visible DOM-node which is the startpoint for the animation
target: an existing and visible DOM-node which serves as the endpoint for the animation
afterwards: callback-function which is called when animation is over
*/

videoconf.moveElementAnimation = function(element, source, target, afterwards){
  //helper-function absolutePosition(element, top or left)
  //returns absolute position of element inside window
  //as offsetTop and offsetHeight are only valid inside their
  //container and dont respect scrollTop
  function absolutePosition(element, topleft){
    var rect = element.getBoundingClientRect();
    if(topleft==="top")return rect.top;
    if(topleft==="left")return rect.left;
  }
  if(target===this.renderArea){
    this.renderArea.appendChild(element);//put element into renderArea
    this.renderArea.style.display="grid"; //make renderArea visible
  }

  //temporary disable state to let all dom-elements appear for calculation:
  document.body.classList.remove("js--state--fullscreenbutton-displayed");
  element.classList.add("js--in-transition"); //add transition-class for css-enhancment
  element.style.left = absolutePosition(source,"left")+"px"; //set start-left of transition
  element.style.top = absolutePosition(source,"top")+"px"; //set start-top of transition
  element.style.width = source.offsetWidth+"px"; //set start-width of transition
  element.style.height = source.offsetHeight+"px"; //set start-height of transition
  element.style.overflow = "hidden"; //as we change the width&height we dont want the inner text overflow
  this.renderArea.style.zIndex=1000; //allways on top

  if(source===this.renderArea){
    //we come from renderArea, so we close the button
    //put aditional logik here
    element.style.opacity=1; //we come from renderArea so we blend out
  }else{
    //otherwise a button will be rendered into the area
    //put aditional logik here
    element.style.opacity = 0; //we go to renderArea so we blend in
  }
  element.style.position = "absolute";
  element.ontransitionend = function(){
    //on transition-end we remove all stylesettings set by javascript
    //and let css control again:
    this.style.position = null;
    this.style.left=null;
    this.style.top=null;
    this.style.width=null;
    this.style.height=null;
    this.style.opacity=null;
    this.style.transition=null;
    this.style.overflow=null;
    this.classList.remove("js--in-transition");
    videoconf.renderArea.style.zIndex=null;

    //dangerous but would be good to get tabs out of the way:
    //document.getElementById("buttonlist").style.display="none";

    //the following was or is still used to check if videoconf.renderArea is empty.
    //if so it hides the renderArea, otherwise it shows it
    //not really shure if we use it anymore, it was used by old style and plenum
    if(document.body.classList.contains("mode--plenum")===false &&
      (videoconf.renderArea.children.length===0 ||
      (videoconf.renderArea.children.length===1 && videoconf.renderArea.children[0]===this)) &&
      source===videoconf.renderArea){
        videoconf.renderArea.style.display=null;
        document.body.classList.remove("js--state--fullscreenbutton-displayed");
        console.log("renderArea set to none");
      } else {
        document.body.classList.add("js--state--fullscreenbutton-displayed");
        //videoconf.renderArea.style.display="grid";
      }
    if(afterwards)afterwards(); // callback to follow up with other things
    this.ontransitionend = null; //remove this function itself
  }
  //after we have defined start-positions and such we start the
  //animation after a short delay to let browser cach up and do
  //the transition for us:
  setTimeout(function(){

    element.style.transition = "all 0.2s ease-out"; //activate transition

    element.style.left = absolutePosition(target,"left")+"px"; //set left to animate to
    element.style.top = absolutePosition(target,"top")+"px"; //set top to animate to
    element.style.width = target.offsetWidth+"px"; //set width to animate to
    element.style.height = target.offsetHeight+"px";//set height to animate to
    if(target===videoconf.renderArea)element.style.opacity = 1; //set opacity to animate to
    else element.style.opacity=0;
  },10); //delay of 10ms to let browser cach up
}

/*showButton is called to render a simple Button into the renderArea,
for example after user has clicked.
takes a button and clones it into renderArea
expects:
button: an existing DOM-node, which innerHTML will be cloned,
this button needs a valid ID (unique)
dontsend: boolean. if true it does not send again that this button
was pressed - e.g. if true other user has clicked and send us via
WebSocket
*/

videoconf.showButton = function(button, dontsend){
  this.actbutton = button.id;
  let newb = document.createElement("div");
  newb.classList.add("fullscreenbutton");
  newb.id = "render"+button.id;
  let username = ws.username || "";
  let newtitle = videoconf.createButtonHeader({
    titleDe: username,
    titleEn: username,
    closeButton:true,
    onCloseButton:function(){
      videoconf.hideButton(this.parentElement.parentElement);
    }

  });

  newb.onclick=function(){videoconf.hideButton(this)};
  //newb.innerHTML = button.innerHTML;
  newb.appendChild(newtitle);
  let newwrapper = document.createElement("div");
  newwrapper.classList.add("content");
  newwrapper.innerHTML = button.innerHTML;
  newb.appendChild(newwrapper);
  this.moveElementAnimation(newb,button,this.renderArea,null);
  newtitle.querySelector(".closebutton").focus();
  if(document.body.classList.contains("mode--plenum"))document.body.classList.add("buttonarea--minimized");
  let allfullscreenbuttons = this.renderArea.getElementsByClassName("fullscreenbutton");
  for(var x=allfullscreenbuttons.length-2;x>=0;x--){
    //remove all but last fullscreenbutton
    allfullscreenbuttons[x].parentElement.removeChild(allfullscreenbuttons[x]);
  }
  let data = {
    type:"showButton",
    buttonid:button.id,
    username:this.username
  };
  if(!dontsend || dontsend===undefined)ws.sendMessage(data,"sync");
}
videoconf.hideButton = function(button,dontsend){
  let origid = button.id.substring("render".length);
  let target = document.getElementById(origid);
  this.moveElementAnimation(button,this.renderArea,target,function(){
    videoconf.renderArea.removeChild(button);
    videoconf.renderArea.style.display=null;
  });
  target.focus();
  if(this.actbutton===origid)this.actbutton=null;
  if(this.actbutton===null && this.timer.length===0){
    document.body.classList.remove("buttonarea--minimized");
  }
  if(!dontsend || dontsend===undefined)ws.sendMessage({
    type:"hideButton",id:button.id},"sync");
}

/*showMenu renders a section into renderArea as a dialog
expects:
button: the button which was pressed to start the dialog or to
which the animation should blend-out to if none
menuId: the id of the section which should be displayed
closebutton: if closebutton should be displayed, default is yes
*/

videoconf.showMenu = function(targetbutton, menuId, closebutton){
  let button = targetbutton;
  if(button===null)button=document.getElementById("expandbutton--about");
  let oldmenu = document.getElementById("js--controlWrapper-Menu");
  if(oldmenu){
    oldmenu.id="js-controlWrapper-Menu-Old";
    let oldsection = oldmenu.children[1];
    let oldtarget = document.getElementById(oldmenu.name.substring(0,oldmenu.name.indexOf(" ")));
    videoconf.moveElementAnimation(oldmenu,videoconf.renderArea,oldtarget,function(){
      document.body.appendChild(oldsection);
      oldmenu.parentElement.removeChild(oldmenu);
      oldtarget.disabled=false;
    });
  }
  let source=button;
  let cb = (closebutton != false);
  let title = videoconf.createButtonHeader({
    closeButton:cb,
    onCloseButton:function(){
      let el = document.getElementById("js--controlWrapper-Menu");
      let target = document.getElementById(el.name.substring(0,el.name.indexOf(" ")));
      videoconf.moveElementAnimation(el,videoconf.renderArea,target,function(){
        document.body.appendChild(el.children[1]);
        el.parentElement.removeChild(el);
        target.disabled=false;
      });
    }
  });
  let content = document.getElementById(menuId);
  let wrapper = document.createElement("div");
  wrapper.classList.add("menu");
  wrapper.id="js--controlWrapper-Menu";
  wrapper.name = button.id+" "+menuId;
  wrapper.appendChild(title);
  wrapper.appendChild(content);
  button.disabled=true;
  videoconf.moveElementAnimation(wrapper,source,videoconf.renderArea);
}

videoconf.copylink = function(button){
  let baseurl = location.origin;
  var text = baseurl + "?" + ws.room + location.hash;
  var input = document.createElement('input');
  input.setAttribute('value', text);
  document.body.appendChild(input);
  input.select();
  var result = document.execCommand('copy');
  document.body.removeChild(input)
  console.log("copied "+text+" to clipboard:"+result);
  var oldlinkcopied = document.getElementById("linkcopyalert");
  if(oldlinkcopied)oldlinkcopied.parentElement.removeChild(oldlinkcopied);
  var linkcopied = document.createElement("div");
  var linktext = document.createElement("span");
  linktext.innerHTML = '<span lang="en">link copied ✓</span><span lang="de">Link kopiert ✔️</span>';
  linkcopied.appendChild(linktext);
  linkcopied.id = "linkcopyalert";
  button.appendChild(linkcopied);
  setTimeout(function(){
    var oldlinkcopied = document.getElementById("linkcopyalert");
    if(oldlinkcopied)oldlinkcopied.parentElement.removeChild(oldlinkcopied);
  }, 6000);
}

/*
timer: only used in plenum. a timer which can go backwards and forwards
user can deploy as much timers as wished
expects: (all optional)
preminutes: minutes to use for timer - if unset gets it from DOM
preseconds: seconds to use for timer - if unset gets it from DOM
pretitle: title to use for timer - if unset gets it from DOM
dontsend: boolean if true dont send it via WebSocket
*/

videoconf.addTimer = function(preminutes, preseconds, pretitle, dontsend){
  let minutes = preminutes;
  if(minutes===null || minutes===undefined)minutes=document.getElementById("timerminutes").value;
  let seconds = preseconds;
  if(seconds===null || seconds===undefined)seconds=document.getElementById("timerseconds").value;
  let title = pretitle;
  if(title===null || title===undefined)title=document.getElementById("timertitle").value;
  this.timer.push({minutes:minutes,seconds:seconds,title:title});
  this.writeAllTimers();
  document.body.classList.add("buttonarea--minimized");
  if(dontsend===undefined || !dontsend){
    let senddata = {
        type:"addTimer",
        minutes:minutes,
        seconds:seconds,
        title:title
    };
    ws.sendMessage(senddata,"sync");
  }
}

// the write-function "writes" the html for all timers
videoconf.writeAllTimers = function(){
  let oldtimers = document.getElementsByClassName("timer");
  for(var x=oldtimers.length-1;x>=0;x--){
    oldtimers[x].parentElement.removeChild(oldtimers[x]);
  }
  for(var x=0;x<this.timer.length;x++){
    let actt = this.timer[x];
    let newtimer = document.createElement("div");
    newtimer.classList.add("timer");
    if(this.timer[x].timeover)newtimer.classList.add("timeover");
    let newtitle = videoconf.createButtonHeader({
      titleDe:actt.title,
      titleEn:actt.title,
      moveButton:true,
      expandButton:true,
      closeButton:true,
      closeTarget:x,
      onCloseButton:function(){
        videoconf.stopTimer(this.name);
      }
    });
    let playb = document.createElement("button");
    playb.innerText="⏹>";
    playb.name=x;
    playb.classList.add("startStopTimer");
    playb.onclick = function(){
      if(videoconf.timer[this.name].stop===true)
      videoconf.timer[this.name].stop = false;
      else
      videoconf.timer[this.name].stop = true;
      let update = {
        type:"startStopTimer",
        timer:this.name,
        value:videoconf.timer[this.name].stop,
        minutes:videoconf.timer[this.name].minutes,
        seconds:videoconf.timer[this.name].seconds
      };
      ws.sendMessage(update,"sync");
    }
    newtitle.appendChild(playb);
    newtimer.appendChild(newtitle);
    let mins = document.createElement("span");
    mins.classList.add("min");
    if(actt.minutes>=0)mins.innerText=actt.minutes;
    else mins.innerText=(actt.minutes*-1);
    newtimer.appendChild(mins);
    let divider = document.createElement("span");
    divider.innerText = ":";
    newtimer.appendChild(divider);
    let secs = document.createElement("span");
    secs.classList.add("sec");
    if(actt.seconds>=0)secs.innerText=actt.seconds;
    else secs.innerText=(actt.seconds*-1);
    if(actt.seconds<10 && actt.seconds>-10)secs.innerText="0"+secs.innerText;
    newtimer.appendChild(secs);
    videoconf.renderArea.appendChild(newtimer);
  }
  if(this.timeout!=null)clearTimeout(this.timeout);
  this.timeout = setTimeout("videoconf.updateAllTimer()",1000);
}

videoconf.updateAllTimer = function(){
    let timerdivs = document.getElementsByClassName("timer");
    if(timerdivs.length!=this.timer.length){
      this.writeAllTimers(); return;
    }
    for(var x=0;x<this.timer.length;x++){
      if(this.timer[x].stop)continue;
        let mind = timerdivs[x].getElementsByClassName("min")[0];
        let secd = timerdivs[x].getElementsByClassName("sec")[0];
        let min = this.timer[x].minutes;
        let sec = this.timer[x].seconds;
        if(min>0 && sec==0){
          min--;
          sec=60;
          this.timer[x].minutes = min;
        }
        sec--; this.timer[x].seconds = sec;
        if(sec<0 && (sec%60==0)){
          min--; this.timer[x].minutes=min;
          sec=0; this.timer[x].seconds=sec;
        }
        if(min==0 && sec==0 && !timerdivs[x].classList.contains("timeover")){
          timerdivs[x].classList.add("timeover");
          this.timer[x].timeover = true;
          //timer is over, maybe add an alarm or something
          //we could also count "over-time"
        }
        if(sec<0)sec=sec*-1;
        if(sec<10)sec="0"+sec;
        if(min<0)min=min*-1;
        mind.innerText = min;
        secd.innerText = sec;
    }
    if(this.timeout!=null)clearTimeout(this.timeout);
    this.timeout = setTimeout("videoconf.updateAllTimer()",1000);
}
videoconf.stopTimer = function(id,dontsend){
  this.timer.splice(id,1);
  this.timeout=null;
  this.writeAllTimers();
  if(this.timer.length===0 && this.actbutton===null){
    document.body.classList.remove("buttonarea--minimized");
    //document.getElementById("expandbuttonarea").classList.remove("minimized");
  }
  if(dontsend===undefined||!dontsend){
    let data = {
      type:"stopTimer",
      id:id
    }
    ws.sendMessage(data,"sync");
  }
}

/*simpleTimer is a timer with an analog-clock used as a nearly
simple Button
*/
videoconf.simpleTimer={
  minutes:0, //standard-minutes for simpleTimer
  actTime:0, //stores actual running time
  possibleMinutes:[1,5,10] //here we can set minutes to choose from
};
// show the Timer in a dialog:
videoconf.simpleTimer.showButton = function(button){
  let newb = document.createElement("div");
  newb.classList.add("fullscreenbutton");
  newb.id = "render"+button.id;
  //create a title:
  let newtitle = videoconf.createButtonHeader({
    closeButton:true,
    onCloseButton:function(){
      videoconf.hideButton(this.parentElement.parentElement);
    }

  });
  newb.appendChild(newtitle);
  //create wrapper:
  let newwrapper = document.createElement("div");
  newwrapper.classList.add("content");
  newwrapper.innerHTML = button.innerHTML; //copy button
  let ul = newwrapper.querySelector("ul"); //get selection list
  //add time-selection-option to selection-list:
  let posibleTimes = this.possibleMinutes;
  for(var pt=0;pt<posibleTimes.length;pt++){
    let li = document.createElement("li");
    li.classList.add("timer-select--nr");
    li.minutes = posibleTimes[pt];
    if(posibleTimes[pt]===this.minutes){
        li.classList.add("selected");
    }
    let lib = document.createElement("button");
    lib.time = posibleTimes[pt];
    lib.onclick=function(){videoconf.simpleTimer.addTime(this.time)};
    lib.innerText="+"+posibleTimes[pt];
    li.appendChild(lib);
    ul.appendChild(li);
  } //end of for-to
  //list contains now all minutes-options
  //add start-timer to list:
  /*
  let startli = document.createElement("li");
  startli.classList.add("timer-start-li");
  let startb = document.createElement("button");
  startb.innerHTML= '<span lang="en">start</span><span lang="de">start</span>';
  startb.onclick = function(){videoconf.simpleTimer.start()};
  startli.appendChild(startb);
  ul.appendChild(startli);
  */
  //add end-timer to list:
  let endli = document.createElement("li");
  endli.classList.add("timer-end-li");
  let endb = document.createElement("button");
  endb.innerHTML= '<span lang="en">stop</span><span lang="de">stop</span>';
  endb.onclick = function(){videoconf.simpleTimer.stop()};
  endli.appendChild(endb);
  ul.appendChild(endli);
  //add wrapper to fullscreenbutton
  newb.appendChild(newwrapper);
  //start animation of fullscreenbutton:
  videoconf.moveElementAnimation(newb,button,videoconf.renderArea,null);
}

//adds time to the clock instead of setting the time directly
videoconf.simpleTimer.addTime = function(minutes){
  if(this.timeover){
    this.cleanAfterStop();
    this.minutes=0;
  }
  let acttime = this.actTime;
  let wasrunning = this.running;
  if(this.minutes+minutes>60)this.minutes=60-minutes; //maximum 60 min
  this.setTime(this.minutes+minutes);
  this.start();
  if(wasrunning){
    this.actTime = acttime + minutes*60;
    this.setAnalogClock();
  }
}

//ends timer
videoconf.simpleTimer.stop = function(dontsend){
  this.minutes=0;
  this.cleanAfterStop();
  this.actTime=0;
  this.setAnalogClock();
  if(dontsend)return;
  let syncdata = {type:"simpleTimerStop"};
  ws.sendMessage(syncdata,"sync");
}

//sets time of clock
videoconf.simpleTimer.setTime = function(minutes){
  this.minutes = minutes;
  this.cleanAfterStop();
  this.actTime = minutes*60;
  //as we are using the +minutes method, the following does not make sense anymore:
  //let alltimernrs = document.getElementsByClassName("timer-select--nr");
  //for(var x=0;x<alltimernrs.length;x++){
  //  alltimernrs[x].classList.toggle("selected",(alltimernrs[x].minutes===this.minutes));
  //}
  //as we dont display selection anymore we dont do this anymore:
  //document.querySelector("#button-simple-timer .simple-timer-small-selection").innerText = "+"+minutes;
  this.setAnalogClock();
}
//start the simpleTimer: (dontsend if came via WebSocket)
videoconf.simpleTimer.start = function(dontsend){
  this.timeover = false;
  let simpleTimerButtons = document.getElementsByClassName("simple-timer");
  for(var x=0;x<simpleTimerButtons.length;x++){
    simpleTimerButtons[x].classList.remove("timeover");
    simpleTimerButtons[x].classList.add("running");
  }
  if(this.currentTimeout!=undefined)clearTimeout(this.currentTimeout);
  this.actTime = this.minutes*60 + 1;
  this.running = true;
  this.cycleTimer();
  if(dontsend===true)return;
  let syncdata = {type:"simpleTimerStart",minutes:this.minutes};
  ws.sendMessage(syncdata,"sync");
}
//clean things up after stopping timer:
videoconf.simpleTimer.cleanAfterStop = function(){
  if(this.currentTimeout!=undefined)clearTimeout(this.currentTimeout);
  this.currentTimeout = undefined;
  let simpleTimerButtons = document.getElementsByClassName("simple-timer");
  for(var x=0;x<simpleTimerButtons.length;x++){
    simpleTimerButtons[x].classList.remove("timeover");
    simpleTimerButtons[x].classList.remove("running");
  }
  this.running=false;
}
//render analog clock of timer:
videoconf.simpleTimer.setAnalogClock = function(){
  let timerclockMs = document.getElementsByClassName("simple-timer-clock-middle");
  let timerclockTs = document.getElementsByClassName("simple-timer-clock-top");
  let timerclockdig = document.getElementsByClassName("simple-timer-digital-time");
  let rotationDegre =this.actTime/10;
  let biggerThan = ((rotationDegre>180 && rotationDegre<361)||rotationDegre>540);
  let secondhour = (rotationDegre>360);
  let min = Math.floor(this.actTime/60);
  let sec = this.actTime - (min*60);
  if(sec<10)sec="0"+sec;

  for(var tx=0;tx<timerclockMs.length;tx++){
    timerclockMs[tx].style.transform = "rotate("+rotationDegre+"deg)";
    timerclockTs[tx].classList.toggle("js--bigger-than-180deg",biggerThan);
    timerclockTs[tx].classList.toggle("js--smaller-than-180deg",!biggerThan);
    timerclockTs[tx].classList.toggle("js--second-hour",secondhour);
    timerclockMs[tx].classList.toggle("js--second-hour",secondhour);
    timerclockdig[tx].innerText = min+":"+sec;
  }
}
//cycle through timer - once a second:
videoconf.simpleTimer.cycleTimer = function(){
  this.actTime--;
  this.setAnalogClock();
  if(this.actTime<=0){
    this.timeover = true;
    let simpleTimerButtons = document.getElementsByClassName("simple-timer");
    for(var x=0;x<simpleTimerButtons.length;x++){
      simpleTimerButtons[x].classList.add("timeover");
      simpleTimerButtons[x].classList.remove("running");
    }
  }else{
    this.currentTimeout = setTimeout("videoconf.simpleTimer.cycleTimer()",1000);
  }
}


//updateRoom: not really used right now but will be soon,
//at least by plenum. function is called if a new user enters room
// or user has left
videoconf.updateRoom = function(roomlist){
  console.log("updating Room",roomlist);
  if(roomlist===undefined)return;
  this.roomlist = roomlist;
  if(document.body.classList.contains("mode--plenum"))this.writeUserList(roomlist);
}
/*writeUserList: writes the userlist*/
videoconf.writeUserList = function(roomlist){
  let rooml = document.getElementById("userlist");
  if(rooml===null)return;
  rooml.innerHTML=""; //destroy old roomlist
  for(var x=0;x<roomlist.length;x++){
    //if(roomlist[x].id===ws.id)continue; //dont print yourself
    let li = document.createElement("li");
    li.id = "uid"+roomlist[x].id;
    let username = document.createElement("div");
    username.classList.add("username")
    if(roomlist[x].username===undefined)username.innerText=roomlist[x].id;
    else username.innerText=roomlist[x].username;
    let usersymbol = document.createElement("div");
    usersymbol.classList.add("usersymbol");
    li.appendChild(username);
    li.appendChild(usersymbol);
    rooml.appendChild(li);
  }
  if(this.plenumButtonList && this.plenumButtonList.length>0){
    for(var x=0;x<this.plenumButtonList.length;x++)this.recievePlenumSimpleButton(this.plenumButtonList[x]);
  }
}

videoconf.showPlenumButton = function(button){
    let active = button.classList.contains("active");
    //check for old buttons:
    let oldb = document.querySelectorAll(".display-button.active");
    for(var x=oldb.length-1;x>=0;x--)oldb[x].classList.remove("active");
    button.classList.toggle("active",!active);
    this.activeSimplePlenumButton = button.id;
    if(active)this.activeSimplePlenumButton = false;
    let dataToSend = {
            type:"plenumSimpleButton",
            buttonId:button.id,user:ws.id,activate:!active};
    this.actualizePlenumButtonList(dataToSend);
    ws.sendMessage(dataToSend,"sync");
    console.log("send plenumbutton",dataToSend);
    this.recievePlenumSimpleButton(dataToSend);
}

videoconf.recievePlenumSimpleButton = function(data){
  console.log("recieve plenumbutton",data);
    let userentry = document.getElementById("uid"+data.user);
    let symbol = document.getElementById(data.buttonId);
    if(userentry===null || symbol===null)return;
    let entryPoint = userentry.querySelector(".usersymbol");
    if(data.activate){
        entryPoint.innerHTML = symbol.innerHTML;
    }else{
        entryPoint.innerHTML = "";
    }
    this.actualizePlenumButtonList(data);
}

videoconf.actualizePlenumButtonList = function(data){
    if(this.plenumButtonList===undefined)this.plenumButtonList=new Array();
    let entryPoint = null;
    for(var x=0;x<this.plenumButtonList.length;x++){
      if(this.plenumButtonList[x].user===data.user){
        entryPoint=x;
        this.plenumButtonList[x]=data;
        break;
      }
    }
    if(entryPoint===null)this.plenumButtonList.push(data);
}

videoconf.addPlenumUserList = function(dontsend){
    //destroy old one if any:
    let olduserlist = document.getElementById("userlist");
    if(olduserlist!=null)olduserlist.parentElement.removeChild(olduserlist);
    let ul = document.createElement("ul");
    ul.id="userlist";
    this.renderArea.appendChild(ul);
    this.updateRoom(this.roomlist);
    this.hasRoomList = true;
    if(dontsend === true)return;
    ws.sendMessage({type:"addPlenumUserList"});
}

//let there be a chat:
videoconf.chat = function(){
  let text = document.getElementById("chat").value;
  let time = new Date();
  let timestring = time.getHours()+":";
  if(time.getMinutes()<10)timestring+=0;
  timestring+=time.getMinutes();
  let id = ws.username + time.getHours()+time.getMinutes()+time.getSeconds()+time.getMilliseconds();

  let data = {
    type:"newChat",
    text:text,
    username:ws.username,
    time: timestring,
    id:id
  };
  ws.sendMessage(data,"chat");
  this.writeChat(data);
  document.getElementById("chat").value="";
}
//recieving chat-message via WebSocket
videoconf.recieveChat = function(data){
    if(data.type==="newChat"){
      this.writeChat(data);
    }
    if(data.type==="removeChat"){
      this.removeChat(data.id, true);
    }
}

//remove chat-message from renderArea:
videoconf.removeChat = function(chatmsg, dontsend){
  let chatentry = chatmsg;
  if(typeof chatmsg ==="string")chatentry = document.getElementById(chatmsg);
  if(chatentry ===null)return;
  chatentry.parentElement.removeChild(chatentry);
  if(dontsend===true)return;
  let data = {type:"removeChat",id:chatentry.id};
  ws.sendMessage(data,"chat");
}
//write html of chat-message to renderArea
videoconf.writeChat = function(msg){
  let newM = document.createElement("button");
  newM.id=msg.id;
  newM.classList.add("chat");
  let title = document.createElement("h3");
  title.innerText = msg.username + " ("+msg.time+")";
  newM.appendChild(title);
  let body = document.createElement("div");
  body.innerText = msg.text;
  newM.appendChild(body);
  newM.onclick = function(){
    videoconf.removeChat(this);
  }
  if(msg.username===ws.username)newM.classList.add("own");
  this.renderArea.appendChild(newM);
}

/*
createTextfield: creates a simple Textbutton which user can edit live
*/
videoconf.createTextfield = function(pretext,dontsend){
  let oldbutton = document.getElementById("textfield");
  if(oldbutton)oldbutton.parentElement.removeChild(oldbutton);
  let textfield = document.createElement("div");
  textfield.id="textfield";
  let title= videoconf.createButtonHeader({
    titleDe:ws.username||"",
    titleEn:ws.username||"",
    closeButton:true,
    onCloseButton:function(){
      videoconf.removeTextfield();
    }
  });
  textfield.appendChild(title);
  let writeArea = document.createElement("div");
  writeArea.id="textfieldWriteArea";
  textfield.appendChild(writeArea);
  //this.renderArea.appendChild(textfield);
  this.moveElementAnimation(textfield,document.getElementById("buttonTextfield"),this.renderArea);

  if(document.body.classList.contains("mode--plenum"))document.body.classList.add("buttonarea--minimized");
  if(dontsend===true)return;
  writeArea.contentEditable=true;
  writeArea.onkeyup = function(e){
    ws.sendMessage({type:"textfieldUpdate",text:this.innerText},"sync");
  }
  writeArea.focus();

  ws.sendMessage({type:"newTextfield",text:this.innerText},"sync");
}

videoconf.removeTextfield = function(dontsend){
  document.body.classList.remove("buttonarea--minimized");
  let tf = document.getElementById("textfield");
  let target = document.getElementById("buttonTextfield");
  videoconf.moveElementAnimation(tf,videoconf.renderArea,target,function(){
    tf.parentElement.removeChild(tf);
    videoconf.renderArea.style.display=null;
  });
  target.focus();
  if(dontsend)return;
  ws.sendMessage({type:"removeTextfield"},"sync");
}

/*
timeline:
*/
videoconf.createTimeline = function(){
  let timeline = {};
  timeline.chapters = new Array();
  let askAnother = true;
  while(askAnother){
    let chapter = {};
    chapter.title = prompt("enter name for chapter "+(timeline.chapters.length+1));
    chapter.minutes = prompt("how many minutes for chapter "+chapter.title);
    timeline.chapters.push(chapter);
    askAnother=confirm("chapter "+chapter.title+" added.\n"+"add another chapter?");
  }
  let bla = "timeline ready:\n";
  for(var x=0;x<timeline.chapters.length;x++)bla+=timeline.chapters[x].title+" : "+timeline.chapters[x].minutes+"min\n";
  bla+="deploy timeline?";
  timeline.creator=ws.id;
  if(confirm(bla))this.addTimeline(timeline);
}

videoconf.addTimeline = function(timeline, dontsend){
  this.timeline = timeline;
  this.writeTimeline();
  if(dontsend===true)return;
  let data = {type:"addTimeline",timeline:timeline};
  ws.sendMessage(data,"sync");
}

videoconf.writeTimeline = function(){
  let oldtimeline = document.getElementById("timelinewrapper");
  if(oldtimeline)oldtimeline.parentElement.removeChild(oldtimeline);
  let tldiv = document.createElement("div");
  tldiv.classList.add("timeline");
  tldiv.id="timeline";
  let timescale = document.createElement("div");
  timescale.id="timescale";
  let chapter = this.timeline.chapters;
  let gridColumns = "";
  for(var x=0;x<chapter.length;x++){
    for(var min=1;min<=chapter[x].minutes;min++){
      let mindiv = document.createElement("div");
      mindiv.classList.add("minutes-div");
      mindiv.classList.add("chapter-"+x);
      if(min%5===0)mindiv.classList.add("minutes-5");
      timescale.appendChild(mindiv);
    }

    let chpbutton = document.createElement("button");
    let chpdiv = document.createElement("div");
    chpbutton.classList.add("timelineChapter");
    chpbutton.classList.add("tlc"+x);
    chpbutton.id="tlc"+x;
    gridColumns+=chapter[x].minutes+"fr ";
    let timemarker = document.createElement("div");
    timemarker.id="timemarker"+x;
    timemarker.classList.add("timelineMarker");
    chpdiv.appendChild(timemarker);
    if(chapter[x].title.length>0){
      let chptitle = document.createElement("div");
      chptitle.classList.add("timelineChapterTitle");
      chptitle.innerText=chapter[x].title;
      chpdiv.appendChild(chptitle);
    }
    let minspan = document.createElement("span");
    minspan.classList.add("timelineChapterMinutes");
    minspan.innerText=chapter[x].minutes+"min";
    chpdiv.appendChild(minspan);
    chpbutton.name=x;
    chpbutton.onclick=function(){
      if(ws.id===videoconf.timeline.creator){
        videoconf.startTimeline(this.name);
      }else{
        //tell how many minutes left?
        if(videoconf.timeline.activeChapter ===this.name){
          let minleft = Math.floor((videoconf.timeline.chapters[videoconf.timeline.activeChapter].minutes*60-videoconf.timeline.actualTime)/60);
          alert("aproximately "+minleft+" minutes left");
        }
      }
    }
    chpbutton.appendChild(chpdiv);
    tldiv.appendChild(chpbutton);
    //tldiv.style.gridTemplateColumns = gridColumns; TODO: have to distinguish between mobile
    tldiv.style.gridTemplateRows = gridColumns;

  }//end-of-for-chapter
  //this.renderArea.appendChild(tldiv);
  //this.timeline.timescale = timescale;
  let wrapper = document.createElement("div");
  wrapper.id="timelinewrapper";
  wrapper.appendChild(tldiv);
  wrapper.appendChild(timescale);
  let togglebutton = document.createElement("button");
  togglebutton.innerText="list";
  togglebutton.onclick=function(){this.parentElement.classList.toggle("open")};
  togglebutton.classList.add("toggle-button");
  wrapper.appendChild(togglebutton);
  document.body.appendChild(wrapper);
  document.body.classList.add("buttonarea--minimized");
}

videoconf.startTimeline = function(chapternr, dontsend){
  let chapb = document.getElementById("tlc"+chapternr);
  let chapter = this.timeline.chapters[chapternr];
  let timemarker = document.getElementById("timemarker"+chapternr);
  //do nothing on:
  if(chapter===undefined || timemarker===null ||
    chapb===null || chapb.classList.contains("active")
  )return;

  for(var x=0;x<this.timeline.chapters.length;x++){
    let chpb = document.getElementById("tlc"+x);
    chpb.classList.remove("active");
    document.getElementById("timemarker"+x).style.width=null;
    chpb.classList.remove("timeover");
    if(x<chapternr)chpb.classList.add("over");
  }
  chapb.classList.add("active");
  this.timeline.activeChapter=chapternr;
  this.timeline.actualTime=0;
  if(this.timeline.actualTimeout!=undefined)clearTimeout(this.timeline.actualTimeout);
  this.timeline.actualTimeout = setTimeout("videoconf.cycleTimeline()",1000);
  if(dontsend===true)return;
  let data = {
    type:"startTimeline",
    chapternr:chapternr
  };
  ws.sendMessage(data,"sync");
}

videoconf.cycleTimeline = function(){
  this.timeline.actualTime++;
  let timemarker = document.getElementById("timemarker"+this.timeline.activeChapter);
  if(timemarker===null)return;
  let secondstotal=this.timeline.chapters[this.timeline.activeChapter].minutes*60;
  let secondsover=this.timeline.actualTime;
  let percentover=secondsover/(secondstotal/100);
  timemarker.style.width=percentover+"%";
  if(secondsover<secondstotal){
    this.timeline.actualTimeout=setTimeout("videoconf.cycleTimeline()",1000);
  }else{
    let chapb=document.getElementById("tlc"+this.timeline.activeChapter);
    chapb.classList.add("timeover");
  }
}

/*speakerslist
createSpeakersList: creates a new speakerslist
removeSpeakersList: removes the speakersList
addSpeakersListEntry: adds a user to bottom of speakersList
removeSpeakersListEntry: removes an entry from speakerslist
writeSpeakersListEntrys: rewrites all speakers list entrys
*/
videoconf.createSpeakersList = function(dontsend){
  this.speakersList = {};
  let oldSpeakersList = document.getElementById("speakersList");
  if(oldSpeakersList)oldSpeakersList.parentElement.removeChild(oldSpeakersList);
  this.speakersList.list = new Array();
  this.speakersList.div = document.createElement("div");
  this.speakersList.div.id = "speakersList";
  let title=videoconf.createButtonHeader({
    titleDe:"Redeliste",
    titleEn:"speakers list",
    closeButton:(ws.isCreator||dontsend!=true),
    onCloseButton: function(){videoconf.removeSpeakersList();},
  });
  this.speakersList.div.appendChild(title);
  let ul = document.createElement("ul");
  ul.id="speakersListUl";
  this.speakersList.div.appendChild(ul);
  /*if we want to have input via textfield we use this:*/
  /*only for creator:*/
  /* we dont want text-input :
  if(ws.isCreator || dontsend!=true){
    let textinputarea = document.createElement("div");
    textinputarea.classList.add("inputarea");
    let ip = document.createElement("input");
    ip.type="text";
    ip.id="speakersListInput";
    ip.placeholder = "add new entry here";
    if(document.getElementById("lang--de").checked)ip.placeholder="Zum Hinzufügen neuen Namen eingeben";
    ip.onkeyup = function(e){
      if(e.key==="Enter"){
        videoconf.addSpeakersListEntry(this.value);
        this.value="";
      }
    }
    textinputarea.appendChild(ip);
    this.speakersList.div.appendChild(textinputarea);
  }
  */
  /* if we keep textinput as input for entry we should provide
  something like the following:
  this.speakersList.lastUserNames = new Array();
  let lastUserNames = document.createElement("div");
  lastUserNames.id="lastUserNames";
  this.speakersList.div.appendChild(lastUserNames);
  */
  /*if we want to have a better user-experience we do this:*/
  /*we use the i wanna say something for it
  let addMeButton = document.createElement("button");
  addMeButton.id="speakersListAddMeButton";
  let enspan = document.createElement("span");
  enspan.innerText="add me to list please";
  enspan.lang="en";
  let despan = document.createElement("span");
  despan.innerText="Setze mich bitte auf die Redeliste";
  despan.lang="de";
  addMeButton.appendChild(enspan);
  addMeButton.appendChild(despan);
  addMeButton.onclick = function(){
    videoconf.speakersListAddMe();
  }
  this.speakersList.div.appendChild(addMeButton);
  */
  this.renderArea.appendChild(this.speakersList.div);
  if(dontsend===true)return;
  //dontsend means also we are creator:
  this.speakersList.creatorId=ws.id;
  ws.sendMessage({type:"createSpeakersList"},"sync");
}
videoconf.speakersListAddMe = function(){
  if(this.speakersList===undefined)return;
  if(ws.username === undefined || ws.username===null){
    let ptext="please choose a username to let others know who you are";
    if(document.getElementById("lang--de").checked)ptext="Bitte gib dir einen Namen damit andere wissen wer du bist";
    ws.username=prompt(ptext);
    if(ws.username === undefined || ws.username === null)return;
    ws.sendMessage(ws.username, "setUserName");
  }
  videoconf.addSpeakersListEntry(ws.username);
  setTimeout(function(){
    let addmeb = document.getElementById("plenum-need-word");
    if(addmeb && addmeb.classList.contains("active"))videoconf.showPlenumButton(addmeb);
  },500);
}
videoconf.removeSpeakersList = function(dontsend){
  let sl = document.getElementById("speakersList");
  sl.parentElement.removeChild(sl);
  this.speakersList = undefined;
  if(dontsend===true)return;
  ws.sendMessage({type:"removeSpeakersList"},"sync");
}
videoconf.addSpeakersListEntry = function(name, dontsend){
  this.speakersList.list.push({name:name});
  this.writeSpeakersListEntrys();
  if(dontsend===true)return;
  ws.sendMessage({type:"addSpeakersListEntry",name:name},"sync");
}

videoconf.writeSpeakersListEntrys = function(){
  let ul = document.getElementById("speakersListUl");
  ul.innerHTML = "";
  for(var x=0;x<this.speakersList.list.length;x++){
  let li = document.createElement("li");
  let remb = document.createElement("button");
  remb.classList.add("closebutton");
  remb.innerText = "✘";
  remb.name=x;
  remb.onclick = function(){
    videoconf.removeSpeakersListEntry(this.name);
  }
  if(ws.isCreator || this.speakersList.creatorId===ws.id){
    let moveupb = document.createElement("button");
    moveupb.classList.add("moveup");
    moveupb.innerText="⮹";
    moveupb.name=x;
    if(x===0)moveupb.classList.add("first");
    moveupb.onclick = function(){
      videoconf.moveSpeakersListEntry(this.name);
    }
    li.appendChild(moveupb);
  }
  let namespan = document.createElement("span");
  namespan.innerText=this.speakersList.list[x].name;
  li.appendChild(namespan);
  if(ws.isCreator || this.speakersList.creatorId===ws.id ||
    this.speakersList.list[x].name===ws.username)li.appendChild(remb);
  ul.appendChild(li);
  }
}
videoconf.removeSpeakersListEntry = function(nr, dontsend){
  let list = this.speakersList.list;
  list.splice(nr,1);
  this.writeSpeakersListEntrys();
  if(dontsend===true)return;
  ws.sendMessage({type:"removeSpeakersListEntry",nr:nr},"sync");
}
videoconf.moveSpeakersListEntry = function(nr, dontsend){
  let list = this.speakersList.list;
  if(nr-1>=list.length || nr<=0)return;
  let buffer = list[nr];
  list[nr]=list[nr-1];
  list[nr-1]=buffer;
  this.writeSpeakersListEntrys();
  if(dontsend===true)return;
  ws.sendMessage({type:"moveSpeakersListEntry",nr:nr},"sync");
}

/*getting sync-message via websocket -
here we distinguish which functions are to be called */
videoconf.recieveSync = function(msg){
  console.log("recieve Sync",msg);
  if(msg.type==="showButton"){
    let showb = document.getElementById(msg.buttonid);
    this.showButton(showb,true);
  }
  if(msg.type==="stopTimer"){
    this.stopTimer(msg.id,true);
  }
  if(msg.type==="addTimer"){
    this.addTimer(msg.minutes,msg.seconds,msg.title,true);
  }
  if(msg.type==="startStopTimer"){
    this.timer[msg.timer].stop=msg.value;
    this.timer[msg.timer].minutes=msg.minutes;
    this.timer[msg.timer].seconds=msg.seconds;
    this.writeAllTimers();
  }

  if(msg.type==="hideButton"){
    let hideb = document.getElementById(msg.id);
    if(hideb)this.hideButton(hideb,true);
  }
  if(msg.type==="addTimeline"){
    this.addTimeline(msg.timeline,true);
  }
  if(msg.type==="startTimeline"){
    this.startTimeline(msg.chapternr,true);
  }
  if(msg.type==="newTextfield"){
    this.createTextfield(msg.text,true);
  }
  if(msg.type==="textfieldUpdate"){
    let tf = document.getElementById("textfieldWriteArea");
    tf.innerText=msg.text;
  }
  if(msg.type==="removeTextfield"){
    this.removeTextfield(true);
  }
  if(msg.type==="createSpeakersList"){
    this.createSpeakersList(true);
  }
  if(msg.type==="removeSpeakersList"){
    this.removeSpeakersList(true);
  }
  if(msg.type==="addSpeakersListEntry"){
    this.addSpeakersListEntry(msg.name,true);
  }
  if(msg.type==="removeSpeakersListEntry"){
    this.removeSpeakersListEntry(msg.nr,true);
  }
  if(msg.type==="moveSpeakersListEntry"){
    this.moveSpeakersListEntry(msg.nr,true);
  }
  if(msg.type==="simpleTimerStart"){
    this.simpleTimer.setTime(msg.minutes);
    this.simpleTimer.start(true);
  }
  if(msg.type==="simpleTimerStop"){
    this.simpleTimer.stop(true);
  }
  if(msg.type==="plenumSimpleButton"){
    this.recievePlenumSimpleButton(msg);
  }
  if(msg.type==="addPlenumUserList"){
    this.addPlenumUserList(true);
  }
}

/*askCurrentState: a user enters the room and asked this
user for all possible information to sync all status:
*/
videoconf.askCurrentState = function(id){
  let answer = {
    type:"currentState",
    timer:this.timer,
    actbutton:this.actbutton,
    timeline:this.timeline,
    speakersList:this.speakersList,
    roomlist:this.roomlist,
    hasRoomList:this.hasRoomList,
    plenumButtonList:this.plenumButtonList
  };
  let tf = document.getElementById("textfieldWriteArea");
  if(tf)answer.textfield=tf.innerText;
  if(this.simpleTimer.running){
    answer.simpleTimer = this.simpleTimer;
  }
  ws.sendMessage(answer,"sendToId",{targetId:id});
}
/*recieveCurrentState: user has asked other user for
current state of application and gets the answer to
sync localy*/
videoconf.recieveCurrentState = function(data){
  if(data.timer.length>0){
    this.timer = data.timer;
    this.writeAllTimers();
  }
  let actbid = data.actbutton;
  let actb;
  if(actbid!=undefined && actbid!=null)actb=document.getElementById(actbid);
  if(actb!=null)this.showButton(actb,true);
  if(data.timeline!=undefined && data.timeline!=null){
    this.addTimeline(data.timeline,true);
    if(data.timeline.actualTime && data.timeline.actualTime>0 &&
      data.timeline.activeChapter>=0){
      this.startTimeline(data.timeline.activeChapter);
      this.timeline.actualTime=data.timeline.actualTime;
    }
  }
  if(data.speakersList!=undefined){
    this.createSpeakersList(true);
    this.speakersList = data.speakersList;
    this.writeSpeakersListEntrys();
  }
  if(data.simpleTimer){
    this.simpleTimer.minutes=data.simpleTimer.minutes;
    this.simpleTimer.running = data.simpleTimer.running;
    this.simpleTimer.actTime = data.simpleTimer.actTime;
    this.simpleTimer.cycleTimer();
  }
  if(data.roomlist && data.hasRoomList){
    this.roomlist = data.roomlist;
    this.addPlenumUserList();
  }
  if(data.plenumButtonList){
    this.plenumButtonList=undefined;
    for(var x=0;x<data.plenumButtonList.length;x++){
      this.recievePlenumSimpleButton(data.plenumButtonList[x]);
    }
  }
}
/*
showInviteLinks: shows a dialog with the current session-ID
*/
videoconf.showInviteLinks = function(){
  let link = location.origin+"?"+this.room;
  document.getElementById("session-ID").innerText=link;
  let respmenu = document.getElementById("response-message");
  let actmenu = document.getElementById("js--controlWrapper-Menu");
  let invmenu = document.getElementById("invite-link-menu");

  if(actmenu && actmenu.contains(respmenu)){
    document.body.appendChild(respmenu);
    actmenu.appendChild(invmenu);
  }else{
    let target = document.getElementById("expandbutton--controls");
    if(target===null)target = document.getElementById("showInviteLinks");
    if(target)this.showMenu(target,"invite-link-menu");
  }
  //alert(link);
  //alert("https://whatever.pxi.gmbh/?"+this.room);
}

/*
createSession: a user has actively started a new session, eg.
clicked on start session
*/
videoconf.createSession = function(){
  //we should not wait till session is started but
  let target = document.getElementById("expandbutton--controls");
  if(target===null)target = document.getElementById("showInviteLinks");
  if(target)this.showMenu(target,"response-message",true);
  ws.init();
}

//set username:
videoconf.setUserName = function(newname){
  if(ws.username === newname)return;
  ws.username=newname;
  ws.sendMessage(newname,"setUserName");
  document.getElementById("localusername").innerText=newname;

}

/*websocket-stuff:*/

var ws = {server:null};

ws.init = async function(){
  //change css-state directly:
  document.body.classList.remove("state--before-session");
    if(this.server===null){
        //deactivate for localtest
        //this.server = await new WebSocket("ws://compad.pxi.gmbh:3000");
        this.server = await new WebSocket("wss://compad.pxi.gmbh/ws/");
        //activate for localtest:
        //this.server = await new WebSocket("ws://localhost:3000");
     }
    this.server.onopen = function(){ws.init2();};
}

ws.init2 = async function(){
        //this.username = prompt("please insert your username to be recognized by others");
        if(videoconf.room===null){
          this.sendMessage("","createRoom");
        }else{
          this.room = videoconf.room;
          this.sendMessage(this.room,"joinRoom");
        }
        this.server.onmessage = function incoming(msg){
            let data;
            if(msg.data==="pong"){
              console.log("heartBeat websocket: pong", new Date());
              return;
            }
            try{
                data = JSON.parse(msg.data);
            }catch(e){
                console.log(e, msg);
                return;
            };
            console.log("recieved message:",data);
            if(data.action==="sync"){
                videoconf.recieveSync(data.msg);
            }
            if(data.action==="init"){
                ws.id = data.id;
                videoconf.showInitMessage(data.msg);
            }
            if(data.action==="initCreator"){
              ws.isCreator = true;
              document.body.classList.add("creator");
              ws.room = data.roomid;
              videoconf.room = data.roomid;
              localStorage.setItem("videoconftools",JSON.stringify({username:ws.username,room:ws.room,id:ws.id}));
              ws.sendMessage(ws.room,"joinRoom");
              videoconf.showInviteLinks();
              let ivbutton = document.getElementById("showInviteLinks");
              ivbutton.innerText = "invite people";
              ivbutton.classList.add("invite");
              ivbutton.onclick = function(){
                videoconf.showInviteLinks();
              }

            }
            if(data.action==="askCurrentState"){
              videoconf.askCurrentState(data.newUser);
            }
            if(data.action==="getUserNames"){
                videoconf.updateRoom(data.data);
            }
            if(data.action==="chat"){
              videoconf.recieveChat(data.msg);
            }
            if(data.action==="sendToId"){
              if(data.msg.type==="currentState"){
                videoconf.recieveCurrentState(data.msg);
              }
            }

        }; //end of onmessage
        if(this.username != undefined && this.username != null)this.sendMessage(this.username, "setUserName");
        this.heartBeat();
}

ws.sendMessage = function(msg, action, options){
        let data = {msg:msg, room:this.room, action:action, options:options, senderId:this.id};
        if(this.server===null){
          console.warn("cant send message - no websocket-server found");
        }else{
          this.server.send(JSON.stringify(data));
        }
}

ws.heartBeat = function(){
  this.sendMessage({type:"heartBeat"},"heartBeat");
  console.log("heartbeat:",new Date());
  this.heartBeatTimer = setTimeout("ws.heartBeat()",10000); //send heartBeat every 10sec to keep alive
}
