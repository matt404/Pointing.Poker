
var PointingPoker = function () {

    var _clientKey, _memberId, _roomKey;

    var socket = io();

    var init = function () {
        window.onload = load;
        window.onunload = unload;
    };

    var load = function () {
        setLoginFormDefaults();
        socket.on('vote', setMemberVote);
        socket.on('add', addMember);
        socket.on('remove', removeMember);
        socket.on('showcards', showCards);
        socket.on('newgame', resetGameState);
    };

    var addMemberEmit = function (name, observer) {

      //console.log("addMemberEmit", name, observer);

        var member = {
            name: name,
            observer: observer,
            vote: "",
            clientKey: _clientKey,
            roomKey: _roomKey
        };

        socket.emit('add', member);

    };

    var addMember = function (member) {

      //console.log("addMember", member);

      printMemberElement(member);

      if (_clientKey === parseInt(member.clientKey, 10)) {
          _memberId = member.id;
          PointingPoker.hideForm(member.observer);
      }

    };

    var closeWebSocket = function () {
        //if (socket.readyState === 1) {
        //    socket.close();
        //}
    };

    var disposeGame = function () {
        document.getElementById("memberContainer").innerHTML = "";
        document.getElementById("resultsContainer").innerHTML = "";
        resetGameState();
    };

    var getNum = function(elName, defaulVal){
      var elValue = document.getElementById(elName).value;
      if(elValue*0 === 0){
        elValue = elValue*1;
      }else{
        elValue = defaulVal;
      }
      return elValue;
    };

    var getQSValue = function (key) {
        var val = "";
        var hrefArray = window.location.href.split("?");
        if (hrefArray.length > 1) {
            var qsArray = hrefArray[1].split("&");
            var iCount = qsArray.length;
            for (var i = 0; i < iCount; i++) {
                var propArray = qsArray[i].split("=");
                if (propArray.length === 2 && propArray[0].toLowerCase() === key.toLowerCase()) {
                    val = window.unescape(propArray[1]);
                }
            }
        }
        return val;
    };

    var printMemberElement = function (member) {
        var memberContainer = document.getElementById("memberContainer");
        var memberSpan = document.createElement("span");
        memberSpan.id = "memberSpan" + member.id;
        if (member.observer === true) {
            memberSpan.setAttribute("class", "member-tag label label-default");
        } else {
            memberSpan.setAttribute("class", "member-tag label label-primary");

            var resultsContainer = document.getElementById("resultsContainer");
            var memberCardDiv = document.createElement("div");
            memberCardDiv.id = "memberCardDiv" + member.id;
            memberCardDiv.setAttribute("class", "card-result hideValue");
            memberCardDiv.innerHTML = "?";
            resultsContainer.appendChild(memberCardDiv);
        }
        memberSpan.setAttribute("isobserver", member.observer);
        memberSpan.id = "memberSpan" + member.id;
        memberSpan.innerHTML = member.name;
        memberContainer.appendChild(memberSpan);
        if (member.vote !== "") {
            setMemberVote(member);
        }

    };

    var removeMember = function (member) {
        if (_memberId === parseInt(member.id, 10)) {
            PointingPoker.exitRoom();
        } else {
            var memberSpan = document.getElementById("memberSpan" + member.id);
            var memberCardDiv = document.getElementById("memberCardDiv" + member.id);
            if (memberSpan) {
                memberSpan.remove();
            }
            if (memberCardDiv) {
                memberCardDiv.remove();
            }
        }
    };

    var resetGameState = function () {
        var resultsContainer = document.getElementById('resultsContainer');
        var memberContainer = document.getElementById('memberContainer');
        var pointPickerContainer = document.getElementById('pointPickerContainer');
        var iCount = resultsContainer.childNodes.length;
        for (var i = 0; i < iCount; i++) {
            resultsContainer.childNodes[i].innerHTML = "?";
            resultsContainer.childNodes[i].setAttribute("class", "card-result hideValue");
        }
        iCount = pointPickerContainer.childNodes.length;
        for (var i = 0; i < iCount; i++) {
            pointPickerContainer.childNodes[i].className = "card";
        }
        iCount = memberContainer.childNodes.length;
        for (var i = 0; i < iCount; i++) {
            if (memberContainer.childNodes[i].getAttribute("isobserver") !== "true") {
                memberContainer.childNodes[i].setAttribute("class", "member-tag label label-primary");
            }
        }
    };

    var setMemberVote = function (member) {
        var memberCardDiv = document.getElementById("memberCardDiv" + member.id);
        memberCardDiv.setAttribute('votevalue', member.vote);
        var memberSpan = document.getElementById("memberSpan" + member.id);
        memberSpan.setAttribute("class", "member-tag label label-primary ticked");
    };

    var setLoginFormDefaults = function () {
        var savedRoomKey = localStorage.getItem('pointingpoker:roomkey');
        var username = localStorage.getItem('pointingpoker:username');
        var isObserver = localStorage.getItem('pointingpoker:observer');
        if(typeof(isObserver) === "string" && isObserver !== ""){
          document.getElementById("selectObserver").value = isObserver;
        }
        var qsRoomKey = getQSValue("room");
        if (typeof (savedRoomKey) === "string" && savedRoomKey !== "") {
            if (typeof (qsRoomKey) === "string" && qsRoomKey !== "") {
                savedRoomKey = qsRoomKey;
            }
            document.getElementById("inputRoomKey").value = savedRoomKey;
            document.getElementById("inputName").focus();
            if (typeof (username) === "string" && username !== "") {
                document.getElementById("inputName").value = username;
                document.getElementById("inputName").select();
            }
        } else {
            document.getElementById("inputRoomKey").focus();
        }
    };

    var showCards = function () {
        var resultsContainer = document.getElementById('resultsContainer');
        var iCount = resultsContainer.childNodes.length;
        for (var i = 0; i < iCount; i++) {
            var result = resultsContainer.childNodes[i];
            var voteDisplayHtml = document.getElementById('pokerCard-' + result.getAttribute("votevalue")).innerHTML;
            result.innerHTML = voteDisplayHtml;
            result.setAttribute("class", "card-result showValue");
        }
    };

    var unload = function () {
        closeWebSocket();
    };

    init();

    return {
      calculateVelocity: function () {
        var inputPctCapS3 = getNum('inputPercentCapacity-S-3',100);
        var inputPctCapS2 = getNum('inputPercentCapacity-S-2',100);
        var inputPctCapS1 = getNum('inputPercentCapacity-S-1',100);
        var inputPctCapSN = getNum('inputPercentCapacity-SN',100);
        var inputCompletedS3 = getNum('inputPointsCompleted-S-3',0);
        var inputCompletedS2 = getNum('inputPointsCompleted-S-2',0);
        var inputCompletedS1 = getNum('inputPointsCompleted-S-1',0);
        var spanSprintNextEstimate = document.getElementById('spanSprintNextEstimate');

        var estimateValue = Math.ceil(((inputCompletedS3/(inputPctCapS3/100)) +
                            (inputCompletedS2/(inputPctCapS2/100)) +
                            (inputCompletedS1/(inputPctCapS1/100))) / 3) *
                            (inputPctCapSN/100);

        document.getElementById('inputPercentCapacity-S-3').value = inputPctCapS3;
        document.getElementById('inputPercentCapacity-S-2').value = inputPctCapS2;
        document.getElementById('inputPercentCapacity-S-1').value = inputPctCapS1;
        document.getElementById('inputPercentCapacity-SN').value = inputPctCapSN;
        document.getElementById('inputPointsCompleted-S-3').value = inputCompletedS3;
        document.getElementById('inputPointsCompleted-S-2').value = inputCompletedS2;
        document.getElementById('inputPointsCompleted-S-1').value = inputCompletedS1;

        spanSprintNextEstimate.innerHTML = estimateValue;
      },
      exitRoom: function () {
          disposeGame();
          closeWebSocket();
          this.showForm();
      },
        selectVote: function (element, vote) {

            var pointPickerContainer = document.getElementById('pointPickerContainer');
            var iCount = pointPickerContainer.childNodes.length;
            for (var i = 0; i < iCount; i++) {
                pointPickerContainer.childNodes[i].className = "card";
            }
            element.className = "card selected";
            var member = {
                action: "vote",
                vote: vote,
                id: _memberId,
                clientKey: _clientKey,
                roomKey: _roomKey
            };
            socket.emit('vote', member);
        },
        newGame: function () {
            var member = {
                action: "newgame",
                clientKey: _clientKey,
                roomKey: _roomKey
            };
            socket.emit('newgame', member);
        },
        showForm: function () {
            document.getElementById("newGameContainer").style.display = "none";
            document.getElementById("linkExit").style.display = "none";
            document.getElementById("linkMenu").style.display = "none";
            document.getElementById("linkStoryPointing").style.display = "none";
            document.getElementById("linkVelocityPointing").style.display = "none";
            //document.getElementById("pointPickerContainer").style.display = "none";
            //document.getElementById("resultsContainer").style.display = "none";
            document.getElementById("memberContainer").style.display = "none";
            //document.getElementById("roomEntryContainer").style.display = 'block';
            document.getElementById("gameContainer-task").style.display = "block";
        },
        hideForm: function (observer) {
            document.getElementById("newGameContainer").style.display = observer ? "none" : "block";
            document.getElementById("pointPickerContainer").style.display = observer ? "none" : "block";
            document.getElementById("linkExit").style.display = "";
            document.getElementById("linkMenu").style.display = "";
            //document.getElementById("linkStoryPointing").style.display = "";
            //document.getElementById("linkVelocityPointing").style.display = "";
            document.getElementById("resultsContainer").style.display = "block";
            document.getElementById("memberContainer").style.display = "block";
            document.getElementById("roomEntryContainer").style.display = "none";
            document.getElementById("gameContainer-task").style.display = "block";
        },
        formSubmit: function () {

            var name = document.getElementById("inputName").value;
            _roomKey = document.getElementById("inputRoomKey").value;
            var isObserver = document.getElementById("selectObserver").value;
            if(typeof(isObserver) === "string" && isObserver !== ""){
              isObserver = JSON.parse(isObserver);
            }else{
              isObserver = false;
            }
            if (name !== "" && _roomKey !== "") {
                _clientKey = parseInt(Math.random() * 10000000, 10);
                localStorage.setItem('pointingpoker:roomkey', _roomKey);
                localStorage.setItem('pointingpoker:username', name);
                localStorage.setItem('pointingpoker:observer', isObserver);
                addMemberEmit(name, isObserver);
            }
        },

        setGameType: function (gameType) {
            switch(gameType){
                case "task":
                    document.getElementById("linkStoryPointing").className = "active";
                    document.getElementById("linkVelocityPointing").className = "";
                    document.getElementById("gameContainer-task").style.display = "block";
                    document.getElementById("gameContainer-velocity").style.display = "none";
                    break;
                case "velocity":
                    document.getElementById("linkStoryPointing").className = "";
                    document.getElementById("linkVelocityPointing").className = "active";
                    document.getElementById("gameContainer-task").style.display = "none";
                    document.getElementById("gameContainer-velocity").style.display = "block";
                    break;
            }
        },

        submitVelocityVote: function(vote){

        }
    };
}();
