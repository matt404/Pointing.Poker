
var PointingPoker = function(){
	
	var _socket, _clientKey, _roomKey, _memberId;
	
	var init = function (){
		window.onload = load;
		window.onunload = this.exitRoom;
	};
	
	var load = function(){
		var savedRoomKey = localStorage.getItem('pointingpoker:roomkey');
		var username = localStorage.getItem('pointingpoker:username');
		var qsRoomKey = getQSValue("room");
		console.log(qsRoomKey)
		if(typeof(savedRoomKey) === "string" && savedRoomKey !== ""){
			if(typeof(qsRoomKey) === "string" && qsRoomKey !== ""){
				savedRoomKey = qsRoomKey;
			}
			document.getElementById("inputRoomKey").value = savedRoomKey;
			document.getElementById("inputName").focus();
			if(typeof(username) === "string" && username !== ""){
				document.getElementById("inputName").value = username;
				document.getElementById("inputName").select();		
			}
		}else{
			document.getElementById("inputRoomKey").focus();			
		}
	};

	var getWebSocketPath = function (){
		var loc = window.location, newUri;
		if (loc.protocol === "https:") {
			newUri = "wss:";
		} else {
			newUri = "ws:";
		}
		newUri += "//" + loc.host;
		newUri += loc.pathname + "member/actions";
		return newUri;
	};
	
	var getQSValue = function(key){
		var val = "";
		var hrefArray = window.location.href.split("?");
		if(hrefArray.length > 1){
			var qsArray = hrefArray[1].split("&");
			var iCount = qsArray.length;
			for(var i=0; i < iCount; i++){
				var propArray = qsArray[i].split("=");
				if(propArray.length === 2 && propArray[0].toLowerCase() === key.toLowerCase()){
					val = window.unescape(propArray[1]);
				}
			}
		}
		return val;
	};

	var onMessage = function (event) {
		console.log(event);
		var member = JSON.parse(event.data);
		if (member.action === "add") {
			printMemberElement(member);
			if(sessionStorage.getItem('pointingpoker:clientkey')*1 === member.clientKey){
				sessionStorage.setItem('pointingpoker:serverid', member.id);
				PointingPoker.hideForm(member.observer);
			}
		}
		if (member.action === "remove") {
			if(parseInt(sessionStorage.getItem('pointingpoker:serverid'),10) === parseInt(member.id,10)){
				sessionStorage.removeItem('pointingpoker:clientkey');
				sessionStorage.removeItem('pointingpoker:serverid');
				document.location.reload();
			}else{
				document.getElementById("memberSpan"+member.id).remove();
				document.getElementById("memberCardDiv"+member.id).remove();
			}
		}
		if (member.action === "vote") {
			var memberCardDiv = document.getElementById("memberCardDiv"+member.id);
			memberCardDiv.setAttribute('votevalue',member.vote);
			var memberSpan = document.getElementById("memberSpan"+member.id);
			memberSpan.setAttribute("class", "member-tag label label-primary ticked");
		}
		if (member.action === "showcards") {
			var resultsContainer = document.getElementById('resultsContainer');
			var memberContainer = document.getElementById('memberContainer');
			var pointPickerContainer = document.getElementById('pointPickerContainer');
			var iCount = resultsContainer.childNodes.length;
			for(var i=0; i < iCount; i++){
				var result = resultsContainer.childNodes[i];
				result.innerHTML = result.getAttribute("votevalue");
				result.setAttribute("class", "card-result showValue");
			}		
		}
		if (member.action === "newgame") {
			var resultsContainer = document.getElementById('resultsContainer');
			var memberContainer = document.getElementById('memberContainer');
			var pointPickerContainer = document.getElementById('pointPickerContainer');
			var iCount = resultsContainer.childNodes.length;
			for(var i=0; i < iCount; i++){
				resultsContainer.childNodes[i].innerHTML = "?";
				resultsContainer.childNodes[i].setAttribute("class", "card-result hideValue");
			}
			iCount = pointPickerContainer.childNodes.length;
			for(var i=0; i < iCount; i++){
				pointPickerContainer.childNodes[i].className = "card";
			}
			iCount = memberContainer.childNodes.length;
			for(var i=0; i < iCount; i++){
				if(memberContainer.childNodes[i].getAttribute("isobserver") !== "true"){
					memberContainer.childNodes[i].setAttribute("class", "member-tag label label-primary");
				}
			}
		}
	};

	var printMemberElement = function (member) {
		var memberContainer = document.getElementById("memberContainer");
		var memberSpan = document.createElement("span");
		memberSpan.id = "memberSpan"+member.id;
		if(member.observer === true){
			memberSpan.setAttribute("class", "member-tag label label-default");
		}else{
			memberSpan.setAttribute("class", "member-tag label label-primary");

			var resultsContainer = document.getElementById("resultsContainer");
			var memberCardDiv = document.createElement("div");
			memberCardDiv.id = "memberCardDiv"+member.id;
			memberCardDiv.setAttribute("class", "card-result hideValue");
			memberCardDiv.innerHTML = "?";
			if(member.vote !== ""){
				memberCardDiv.setAttribute("votevalue", member.vote);
			}
			resultsContainer.appendChild(memberCardDiv);

		}
		memberSpan.setAttribute("isobserver", member.observer);
		memberSpan.id = "memberSpan"+member.id;
		memberSpan.innerHTML = member.name;
		memberContainer.appendChild(memberSpan);
	};

	var addMember = function (name, observer) {
		var MemberAction = {
			action: "add",
			name: name,
			observer: observer,
			vote: "",
			clientKey: _clientKey,
			roomKey: _roomKey
		};
		_socket.send(JSON.stringify(MemberAction));
	};

	var removeMember = function (element) {
		var id = element;
		var MemberAction = {
			action: "remove",
			id: id,
			clientKey: _clientKey,
			roomKey: _roomKey
		};
		_socket.send(JSON.stringify(MemberAction));
	};
	
	init();
	
	return {

		exitRoom : function (){
			var serverId = sessionStorage.getItem('pointingpoker:serverid')*1;
			if(serverId >= 0){
				removeMember(serverId);
			}
		},
		
		selectVote : function (element, vote) {

			var pointPickerContainer = document.getElementById('pointPickerContainer');
			var iCount = pointPickerContainer.childNodes.length;
			for(var i=0; i < iCount; i++){
				pointPickerContainer.childNodes[i].className = "card";
			}
			element.className = "card selected";
			var serverId = sessionStorage.getItem('pointingpoker:serverid')*1;
			var MemberAction = {
				action: "vote",
				vote: vote,
				id: serverId,
				clientKey: _clientKey,
				roomKey: _roomKey
			};
			_socket.send(JSON.stringify(MemberAction));
		},

		newGame : function () {
			var MemberAction = {
				action: "newgame",
				clientKey: _clientKey,
				roomKey: _roomKey
			};
			_socket.send(JSON.stringify(MemberAction));
		},

		showForm : function () {
			document.getElementById("newGameContainer").style.display = "none";
			document.getElementById("linkExit").style.display = "none";
			document.getElementById("pointPickerContainer").style.display = "none";
			document.getElementById("resultsContainer").style.display = "none";
			document.getElementById("memberContainer").style.display = "none";
			document.getElementById("roomEntryContainer").style.display = 'block';
		},

		hideForm : function (observer) {
			if(!observer){
				document.getElementById("newGameContainer").style.display = "block";
				document.getElementById("pointPickerContainer").style.display = "block";
			}
			document.getElementById("linkExit").style.display = "block";
			document.getElementById("resultsContainer").style.display = "block";
			document.getElementById("memberContainer").style.display = "block";
			document.getElementById("roomEntryContainer").style.display = "none";
		},

		formSubmit : function () {
			var name = document.getElementById("inputName").value;
			_roomKey = document.getElementById("inputRoomKey").value;
			var observer = eval(document.getElementById("selectObserver").value);
			if(name !== "" && _roomKey !== ""){
				_clientKey = parseInt(Math.random()*1000000,10);
				var wsPath = getWebSocketPath();
				_socket = new WebSocket(wsPath+"/"+_clientKey+"/"+window.escape(_roomKey));
				_socket.onmessage = onMessage;
				_socket.onopen = function(){
					localStorage.setItem('pointingpoker:roomkey', _roomKey);
					sessionStorage.setItem('pointingpoker:clientkey', _clientKey);
					localStorage.setItem('pointingpoker:username', name);
					addMember(name, observer);
				};
			}
		}
	};
}();
