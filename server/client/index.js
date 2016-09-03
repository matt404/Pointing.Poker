
var PointingPoker = function () {

    var _socket, _clientKey, _memberId, _roomKey;

    var socket = io();

    var init = function () {
        window.onload = load;
        window.onunload = unload;
    };

    var load = function () {
        setLoginFormDefaults();
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

    var closeWebSocket = function () {
        if (_socket.readyState === 1) {
            _socket.close();
        }
    };

    var disposeGame = function () {
        document.getElementById("memberContainer").innerHTML = "";
        document.getElementById("resultsContainer").innerHTML = "";
        resetGameState();
    };

    var getWebSocketPath = function () {
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

    var onMessage = function (event) {
//		console.log(event);
        var member = JSON.parse(event.data);

        switch (member.action) {
            case 'vote':
                setMemberVote(member);
                break;

            case 'add':
                printMemberElement(member);

                if (_clientKey === parseInt(member.clientKey, 10)) {
                    _memberId = parseInt(member.id, 10);
                    PointingPoker.hideForm(member.observer);
                }
                break;

            case 'remove':
                removeMember(member);
                break;

            case 'showcards':
                showCards();
                break;

            case 'newgame':
                resetGameState();
                break;
        }

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
            var MemberAction = {
                action: "vote",
                vote: vote,
                id: _memberId,
                clientKey: _clientKey,
                roomKey: _roomKey
            };
            _socket.send(JSON.stringify(MemberAction));
        },
        newGame: function () {
            var MemberAction = {
                action: "newgame",
                clientKey: _clientKey,
                roomKey: _roomKey
            };
            _socket.send(JSON.stringify(MemberAction));
        },
        showForm: function () {
            document.getElementById("newGameContainer").style.display = "none";
            document.getElementById("linkExit").style.display = "none";
            document.getElementById("linkStoryPointing").style.display = "none";
            document.getElementById("linkVelocityPointing").style.display = "none";
            //document.getElementById("pointPickerContainer").style.display = "none";
            //document.getElementById("resultsContainer").style.display = "none";
            document.getElementById("memberContainer").style.display = "none";
            //document.getElementById("roomEntryContainer").style.display = 'block';
            document.getElementById("gameContainer-task").style.display = "block";
        },
        hideForm: function (observer) {
            if (!observer) {
                document.getElementById("newGameContainer").style.display = "block";
                //document.getElementById("pointPickerContainer").style.display = "block";
            }
            document.getElementById("linkExit").style.display = "";
            document.getElementById("linkStoryPointing").style.display = "";
            document.getElementById("linkVelocityPointing").style.display = "";
            document.getElementById("resultsContainer").style.display = "block";
            document.getElementById("memberContainer").style.display = "block";
            document.getElementById("roomEntryContainer").style.display = "none";
            document.getElementById("gameContainer-task").style.display = "block";
        },
        formSubmit: function () {
            socket.emit('add', {"fart":"ballz"});
            var name = document.getElementById("inputName").value;
            _roomKey = document.getElementById("inputRoomKey").value;
            var observer = JSON.parse(document.getElementById("selectObserver").value);
            if (name !== "" && _roomKey !== "") {
                _clientKey = parseInt(Math.random() * 1000000, 10);
                var wsPath = getWebSocketPath();
                _socket = new WebSocket(wsPath + "/" + _clientKey + "/" + window.escape(_roomKey));
                _socket.onmessage = onMessage;
                _socket.onopen = function () {
                    localStorage.setItem('pointingpoker:roomkey', _roomKey);
                    localStorage.setItem('pointingpoker:username', name);
                    addMember(name, observer);
                };
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
