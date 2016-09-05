
function Member(_req){

  var _member = {
    id: 0,
    name: "",
    observer: "",
    vote: "",
    clientKey: 0,
    roomKey: ""
  };

  _member.id = parseInt(Math.random()*10000000,10);

  for(var _val in _member){
    if(typeof(_req[_val]) === "undefined"){
      _req[_val] = _member[_val];
    }
  }

  return _req;

}

module.exports = Member;
