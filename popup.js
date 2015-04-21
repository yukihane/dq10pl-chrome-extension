
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

function getPurchaseItems(xml) {
  var lines = xml.getElementById("contentArea")
    .getElementsByTagName("div")[0]
    .getElementsByTagName("div")[1]
    .getElementsByTagName("table")[0]
    .getElementsByTagName("tbody")[0]
    .getElementsByTagName("tr");

  var reNum = /(\d+)こ/;
  var reAmount = /([\d,]+)G/;
  var reDate = /(\d\d\d\d\/\d\d\/\d\d)/;
  var reSellerWebpcno = /character\/(\d+)/;

  var items = [];
  // 0要素目はヘッダなので1から
  for(var i = 1; i < lines.length; i++){
    var line = lines[i];
    var name = line.getElementsByTagName("td")[0]
      .getElementsByTagName("div")[0]
      .getElementsByTagName("p")[0]
      .getElementsByTagName("a")[0].textContent;
    var num = parseInt(reNum.exec(line.getElementsByTagName("td")[1].textContent)[1]);
    // 金額はカンマ区切りになっている可能性があるのでそれを考慮して数値化
    var amount = parseInt(reAmount.exec(line.getElementsByTagName("td")[2].textContent)[1].split(",").join(""));
    var date = reDate.exec(line.getElementsByTagName("td")[3].getElementsByTagName("p")[0].textContent)[1];

    var sellerName;
    var sellerWebpcno;

    var sellerElm = line.getElementsByTagName("td")[3].getElementsByTagName("p")[1].getElementsByTagName("a")[0];
    if(sellerElm != null){
      sellerName = sellerElm.textContent;
      var tmpSellerNo = sellerElm.getAttribute("href");
      sellerWebpcno = reSellerWebpcno.exec(tmpSellerNo)[1];
    } else {
      sellerName = "削除キャラ";
      sellerWebpcno = null;
    }

    var item = {name: name, num: num, amount: amount, date: date, sellerName: sellerName, sellerWebpcno: sellerWebpcno};
//    console.log(item);

    items.push(item);
  }

  console.log("items length: " + items.length);
  return items;
}

function getBazzarHistory(webpcno, page, allItems, callback) {
  if(page > 9){
    callback(allItems);
    return;
  }

  var buyUrl =  "http://hiroba.dqx.jp/sc/character/" + webpcno + "/bazaar/purchasehistory/page/" + page;
  console.log("url: " + buyUrl);
//  var entryUrl = "http://hiroba.dqx.jp/sc/character/" + webpcno + "/bazaar/entryhistory/";
  
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function(){
    console.log("readyState: " + xhr.readyState);
    if(xhr.readyState == 4){
      console.log("status: " + xhr.status);
      var xml = xhr.responseXML;
//      console.log(xml);

      var items = getPurchaseItems(xml);
      Array.prototype.push.apply(allItems, items);
      console.log("items: " + items.length + ", all items length: " + allItems.length);

      getBazzarHistory(webpcno, page+1, allItems, callback);
    }
  };

  console.log(buyUrl);
  xhr.open("GET", buyUrl, true);
  xhr.responseType="document";
  xhr.send();
}

function sendHistory(allItems) {
  console.log("send history " + allItems.length);
  var json = JSON.stringify(allItems);
  console.log(json);
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
        getBazzarHistory(webpcno, 0, [], sendHistory);
      }, false);
      sendButton.disabled = false;

    }
  };

  xhr.open("GET", "http://hiroba.dqx.jp/sc/home/", true);
  xhr.responseType="document";
  xhr.send();
});
