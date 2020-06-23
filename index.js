const WebSocket = require('ws');
//deactivate for local-test:
//const fs = require('fs');
//const https = require('https');
//const server = https.createServer({
//  cert: fs.readFileSync('/etc/letsencrypt/live/studio.pxi.gmbh/cert.pem'),
//  key: fs.readFileSync('/etc/letsencrypt/live/studio.pxi.gmbh/privkey.pem')
//});
//const wss = new WebSocket.Server({ server });
//activate for local-test:
const wss = new WebSocket.Server({port:3000});

var rooms = {};
var allids = [];
var owners = {};
var possibleRoomNames = [
  "black","blue","yellow","green","white","purple","orange","brown","dark","light",
  "sun","river","cloud","snow","star","moon","hill","sky","rain","lightning","thunder",
  "planet","orbit","mars","jupiter","venus","orion","pluto",
  "car","wheel","bike","boat","plane","rocket","piston","axle",
  "computer","laptop","keyboard","mouse","screen","camera","speaker",
  "bottle","ball","doll","castle","dragon","sand","toy","bell","image",
  "mother","child","baby","father","uncle","aunt","sister","brother","grandma",
  "daughter","son","parent","kin",
  "bird","dog","mouse","cat","bunny","horse","duck","frog","goose","sheep","wolf",
  "fox","hen","raven","crane","fish","whale","shark","dolphin","octopus","snake",
  "team","player","captain","sport",
  "foot","hand","nose","head","ear","arm","mouth","eye","finger","toe","hair",
  "jacket","shirt","pants","coat","hat","bag","veil","glove","scarf","shoe","tie","ribbon",
  "fire","water","earth","air",
  "coffee","sugar","milk","salt","pepper","tea","herb","chocolate",
  "salad","bread","soup","carrot","butter","cheese","pizza","noodle","jam",
  "spoon","knife","fork","plate","cup","glass","bowl","bottle",
  "house","bed","door","chair","table","floor","attic","roof",
  "key","stone","lock","anvil","sword","needle",
  "paris","tokyo","berlin","ankara","athens","bangkok","cairo","sydney","dakar",
];
function createRoomName(){
  let first = possibleRoomNames[Math.floor(Math.random()*possibleRoomNames.length)];
  let second = possibleRoomNames[Math.floor(Math.random()*possibleRoomNames.length)];
  let third = possibleRoomNames[Math.floor(Math.random()*possibleRoomNames.length)];
  let posroomname = first+second+third;
  if(rooms[posroomname]!=undefined)posroomname=createRoomName();
  return posroomname;
}

wss.on('connection', function connection(ws, req){
        //new connection:
    ws.id = Math.floor(Math.random()*10000);
    if(allids.indexOf(ws.id)>-1)ws.id = Math.floor(Math.random()*10000);
    if(allids.indexOf(ws.id)>-1)ws.id = Math.floor(Math.random()*10000);
    if(allids.indexOf(ws.id)>-1)ws.id = Math.floor(Math.random()*10000);

    ws.sendToRoom = function(message,excludeSelf){
        console.log("sending to room:",message);
            for(var x=0;x<rooms[this.room].length;x++){
                if(excludeSelf && rooms[this.room][x] === this)continue;
                msg = message;
                if(typeof msg!="string")msg = JSON.stringify(message);
                rooms[this.room][x].send(msg);
            }
    }
    ws.on('message', function incoming(message){
        console.log('received: %s',message);
        let data;
        try {
            data = JSON.parse(message);
        }catch(e){
           console.log(e);
            console.log("malformed message - no JSON");
            return;
        }
        if(data.action===undefined){
            console.error("action not defined");
            return; //close connection of ws directly in future
        }
        if(data.action==="heartBeat"){
          ws.send("pong");
          return;
        }
        if(data.action==="createRoom"){
          this.room=createRoomName();
          rooms[this.room]=new Array();
          owners[this.room]=ws.id;
          let creatorResponse = JSON.stringify({
            action:"initCreator",
            roomid:this.room
          });
          ws.send(creatorResponse);
        }
        if(data.action==="joinRoom"){
           this.room = data.msg;
           if(rooms[this.room]===undefined)rooms[this.room]=new Array();
           rooms[this.room].push(this);
           let askForCurrentState=JSON.stringify({
             action:"askCurrentState",
             newUser:ws.id
           });
           rooms[this.room][0].send(askForCurrentState);
        }
        if(data.action==="sync" ||
        data.action==="sendToAll" ||
        data.action==="chat"){
            if(rooms[data.room]===undefined)return; //should close connection alltogether
            this.sendToRoom(message,true);
            console.log("message send to room:",data);
        }
        if(data.action==="setUserName"){
            this.userName = data.msg;
        }
        if(data.action==="getUserNames" ||
        data.action==="joinRoom" ||
        data.action==="setUserName"){
            let data = new Array();
            for(var x=0;x<rooms[this.room].length;x++)data[x]={
                username: rooms[this.room][x].userName,
                id: rooms[this.room][x].id};
            ws.sendToRoom(JSON.stringify({data:data, action:"getUserNames"}));
            console.log("sending userlist",data);
        }
        if(data.action==="sendToId" || data.action==="webrtc"){
            for(var x=0;x<rooms[this.room].length;x++){
                if(rooms[this.room][x].id === data.options.targetId){
                    rooms[this.room][x].send(message);
                    break;
                }
            }
        }
        //console.log(req);
    });
    ws.on('close',function close(){
      //remove from room:
      for(var x=0;x<rooms[this.room].length;x++){
        if(rooms[this.room][x]===this){
          rooms[this.room].splice(x,1);
          console.log("user "+ws.id+" has left the room");
          if(rooms[this.room].length===0){
            rooms[this.room] = undefined;
            owners[this.room]=undefined;
            console.log("room empty -> destroy room");
          }else{
            let data = new Array();
            for(var x=0;x<rooms[this.room].length;x++)data[x]={
                username: rooms[this.room][x].userName,
                id: rooms[this.room][x].id};
            ws.sendToRoom(JSON.stringify({data:data, action:"getUserNames"}),true);
            ws.sendToRoom({data:this.id,action:"userHasLeft"});
            console.log("sending new userlist",data);
          }
          break;
        }
      }
    });
    //ws.send('you have logged in succesfully');
    let respond = {msg: "you have logged in successfully", id:ws.id, action:"init"};
    ws.send(JSON.stringify(respond));
    console.log('somebody connected');
    //console.log(req);
});

console.log('sever started');
//deactivate for localtest:
//server.listen(3000);
