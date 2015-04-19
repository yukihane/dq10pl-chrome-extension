
function getId(xml) {
      var tmpId = xml.getElementById("myCharacterStatusList").getElementsByTagName("dl")[0].getElementsByTagName("dd")[0].textContent;
      var re = /([A-Z][A-Z]\d\d\d-\d\d\d)/;
      return re.exec(tmpId)[1];
}

function getName(xml) {
  var tmpName = xml.getElementById("myCharacterName").textContent;
  var re = /\[(.*)\]/;
  return re.exec(tmpName)[1];
}

function getWebpcno(xml) {
  var url = xml.getElementById("myCharacterImg").getElementsByTagName("a")[0].getElementsByTagName("img")[0].getAttribute("src");
  var re = /character\/(\d+)\/img/;
  return re.exec(url)[1];
}

document.addEventListener('DOMContentLoaded', function() {

  var sendButton = document.getElementById("send-button");
  sendButton.disabled = true;

  console.log("output");
  var xhr = new XMLHttpRequest();

  xhr.onreadystatechange = function(){
    console.log("readyState: " + xhr.readyState);
    if(xhr.readyState == 4){
      console.log("status: " + xhr.status);
      var xml = xhr.responseXML;
//      console.log(xml);

      var id = getId(xml);
      var name = getName(xml);
      var webpcno = getWebpcno(xml);

      console.log("ID: " + id);
      console.log("name: " + name);
      console.log("webpcno: " + webpcno);

      var info = name + " (ID: "+id+", webpcno: " + webpcno + ")";
      document.getElementById("character-info").textContent = info;

      sendButton.addEventListener("click", function(){
        console.log("button clicked");
      }, false);
      sendButton.disabled = false;

    }
  };

  xhr.open("GET", "http://hiroba.dqx.jp/sc/home/", true);
  xhr.responseType="document";
  xhr.send();
});
