function insert_dislike_button(node){
	for (i = 0; i < node.length; i++){
	    var my_node = '<span><a class="UFIDislikeLink" href="#" role="button" aria-live="polite" title="Dislike this post"><span>Dislike</span></a></span>';
	    if (node[i].innerHTML.includes('UFILikeLink') && !node[i].innerHTML.includes('UFIDislikeLink') && !node[i].innerHTML.includes('UFIDislikeCommentLink')){
	    	node[i].innerHTML += my_node;
	    }
	}
}

function insert_dislike_button_comment(nodeCom){
	for (j = 0; j < nodeCom.length; j++){
	    var my_nodeCom = '<span> · </span><a class="UFIDislikeCommentLink" href="#" role="button" title="Dislike this comment" >Dislike</a>';
	    if (nodeCom[j].innerHTML.includes('UFILikeLink') && !nodeCom[j].innerHTML.includes('UFIDislikeLink') && !nodeCom[j].innerHTML.includes('UFIDislikeCommentLink')){
	    	nodeCom[j].innerHTML += my_nodeCom;
	    }
	}
}

function get_user_name(userURL){
	userURL = ''+userURL;
	userURL = userURL.replace('https://www.facebook.com/', '');
	userURL = userURL.replace('https://facebook.com/', '');
	var slash_index = userURL.indexOf('/');
    var question_index = userURL.indexOf('?');
    var userID = userURL;
    if (slash_index != -1){
        userID = userURL.substring(0, slash_index);
    } else if (question_index != -1) {
    	var tempID = userURL.substring(question_index, userURL.length);
        var userID = userURL.substring(0, question_index);
        if (tempID.includes('id=')){
        	var ampersan_index = tempID.indexOf('&');
        	var equal_index = tempID.indexOf('=');
        	if (ampersan_index != -1){
        		userID = tempID.substring(equal_index + 1, ampersan_index);
        	} else {
        		userID = tempID.substring(equal_index + 1, tempID.length);
        	}
        	return userID;
        }
    }
    return userID;
}

function asArray(x) {
	return [].slice.call(x);
}

function withId(x) {
	return function(o) { return o.id == x; };
}

function addOrModify(o) {
	if (allFriends[o.id] == undefined) {
		allFriends[o.id] = o;
	} else {
		var rel = o.relation[0]; // the relation specified in the argument
		if (allFriends[o.id].relation.findIndex(function (x) { return rel.of == x.of && rel.type == x.type; }) > -1) {
			return;
		}
		allFriends[o.id].relation.push(rel);
	}
}

var stats = {famReq:0, friendReq:0};

function get_all_friends(friendID, userID) {
	var outstanding = 0;
	var get_friends = function(friendID){
		if (allFriends[friendID] != undefined) return;
		outstanding++;
		stats.friendReq++;
		$.get(friendID+'?and='+userID+'&sk=friends', function(page){
			outstanding--;
			var mutualFriends = $(page).filter('code').map(function() {
			  	var mutualFriendsLnks = $(this.innerHTML.substring(4,this.innerHTML.length-3)).find('div.fsl');
			  	if (mutualFriendsLnks == undefined || mutualFriendsLnks.length == 0) {
				  	return null;
			  	}
			  	mutualFriendsLnks.map(function(){
			  		var o = { id : get_user_name($(this).children().first().attr('href')) , name : $(this).children().first().text(), relation: [{ type:"Friend", of:userID }] };
		  			get_friends(o.id);
			  		addOrModify(o);
			  	});
			})[0];
  			get_family_info(friendID);
			if (outstanding == 0) {
				allFriendsDone = true;
			}
		});
	}
	get_friends(friendID, userID);
}

function get_family_info(userID){
	stats.famReq++;
	$.get(userID+'/about?section=relationship&pnref=about', function(page){
		var idx = 0;
		var familyMembers = $(page).filter('code').map(function() {
			var familyMembersSection = $(this.innerHTML.substring(4,this.innerHTML.length-3)).find('._50f5');
			if (familyMembersSection.length == 0) { // I'm not in the right <code> section.
				return undefined;
			}
			// if I'm here, it's a family members section. Either populated or unpopulated, I don't know yet;
			var familyMembersLnks = familyMembersSection.find('a');
			var ret = familyMembersLnks.map(function(){
				var familyId = get_user_name($(this).attr('href'));
				if (idx == 0) { // relationship section
					var o = { id : familyId, name : $(this).text(), relation : [{ type:$(this).parent().next().text(), of:userID }] };
					addOrModify(o);
				} else { // family section
					var o = { id : familyId, name : $(this).text(), relation : [{ type:$(this).parent().parent().next().text(), of:userID }] };
					addOrModify(o);
				}
			});
			idx++;
		});
		allFamilyDone = true;
	});
}

function get_friend_family(user){
	get_family_info(user.id);
}

function create_view(){
	var node = document.createElement("div");    
    node.className = "moaf_result_container";
    node.style.position = "fixed";
    node.style.background = "rgba(201, 213, 236, 0.9)";
    node.style.top = "200px";
    node.style.width = "70%";
    node.style.left = "10%";
    node.style.zIndex = "9999";
    node.style.padding = "30px";
    node.style.overflow = "scroll";
    node.style.maxHeight = "60%";
    var loading = document.createElement("div");
    loading.id = "loading";
    loading.innerHTML += '<center><img src="https://upload.wikimedia.org/wikipedia/commons/d/de/Ajax-loader.gif" alt="Loading..."></center>';
    node.appendChild(loading);
	document.getElementsByTagName("body")[0].appendChild(node);
}

function isIntimate(rel) {
	return false; // FIX
}

function write_all(userID){
	var closeButton = '<button class="fb_close_button" style="position:absolute;top:20px;right:20px">Close</button>';
/*
	var relationshipString = "";
	if (isIntimate(allFriends[userID].relation)){
		relationshipString = "<h2>"+userID+" is in a relationship with " + '<a href="https://www.facebook.com/'+relationship.id+'">'+relationship.name+'</a></h2>';
	}

	var familyString = "";
	if (allFriends[userID].relations.length != 0){
		familyString = "<h2>Total of "+allFriends[0].relations.length+" family members were found for "+userID+"</h2><p>";
	    allFriends[0].relations.forEach(function(familyObj){
	        familyString += '<a href="https://www.facebook.com/'+familyObj.id+'">'+familyObj.name+'</a> ';
	    });
	    familyString += '</p>';
	}

    var friendsString = "<h2>Total of "+allFriends.length+" regular friends were found for "+userID+"</h2><p>";
    allFriends.forEach(function(friendObj){
        friendsString += '<a href="https://www.facebook.com/'+friendObj.id+'">'+friendObj.name+'</a> ';
    });
    friendsString += '</p>';
*/
	var out = $('<ul>');
	Object.keys(allFriends).forEach(function (key) { // FIX
		var elem = allFriends[key];
		var li = $('<li>');
		li.append($('<span>').text(elem.name));
		elem.relation.forEach(function(rel) {
			li.append($('<span>').text(' (' + rel.type + ' of ' + rel.of + ')'));
		});
		out.append(li);
	});

    var node = document.getElementsByClassName("moaf_result_container")[0];
    var loading = document.getElementById("loading");
    node.removeChild(loading);

	//node.innerHTML = closeButton + relationshipString + familyString + friendsString;
	$(node).append($(closeButton)).append(out);
	console.log(Object.keys(allFriends).length);
	console.log(stats);


    closeButtonNode = document.getElementsByClassName("fb_close_button")[0];
    closeButtonNode.onclick = function(){
        var node = document.getElementsByClassName("moaf_result_container")[0];
        var body = document.getElementsByTagName("body")[0].removeChild(node);
    };
}
/*
function sameFamilyName() {
	var getLast = function(userIdx) {
		var idx = allFriends[userIdx].name.lastIndexOf(' ');
		if (idx == -1) return null;
		return allFriends[userIdx].name.substring(idx+1);
	};
	var desired = getLast(0);
	if (desired == null) return null;
	var results = [];
	var familyLoop = function(userIdx) {
		for (var i = 0; i < allFriends[userIdx].relations.length; i++) {
			var last = getLast(allFriends[userIdx].relations[i]);
			if (last == desired) results.push(allFriends[userIdx].relations[i].id);
		}
	};
	familyLoop(0);
	for (var i = 1; i < allFriends.length; i++) {
		var last = getLast(i);
		if (last == desired) results.push(allFriends[i].id);
		familyLoop(i);
	}
	return results;
}
*/
function heuristics(userID){
	if (allFriendsDone){
	}
	if (allFamilyDone){
	}
	if (allFriendsDone && allFamilyDone && !done){
		//var blah = sameFamilyName();
		write_all(userID);
		done = true;
	}
	setTimeout(heuristics, 50, userID);
}

var allFriends;
var allFriendsDone;
var allFamilyDone;
var done;

function initialise(){
	allFriends = new Array();
	allFriendsDone = false;
	allFamilyDone = false;
	done = false;
}

$('body').on('click', '.UFIDislikeLink', function(){
	initialise();
	var proof = $(this).parents('.userContentWrapper').first().text();
	var posterID = get_user_name($(this).parents('.userContentWrapper').first().find('._5pb8').first().attr('href'));
	var posterName = $(this).parents('.userContentWrapper').find('a.profileLink').first().text();
	var userID = get_user_name($('body ._2dpe').attr('href'));
	create_view();
	allFriends[posterID] = { id: posterID, name: posterName, relation: [{type:"Identity", of:posterID}] };
	get_all_friends(userID, posterID);
	get_family_info(posterID);
	heuristics(posterID);
});
/*
$('body').on('click', '.UFIDislikeCommentLink', function(){
	initialise();
	var proof = $(this).parents('.userContentWrapper').first().text();
	var posterID = get_user_name($(this).parents('.userContentWrapper').first().find('._5pb8').first().attr('href'));
	var commenterID = get_user_name($(this).parents('.UFIRow').first().find('.UFICommentActorName').attr('href'));
	create_view();
	if (posterID == commenterID) {
		get_all_friends('me', commenterID);
	} else {
		get_all_friends(posterID, commenterID);
	}
	get_family_info(commenterID);
	heuristics(commenterID);
});
*/
window.onload = function(){
    var node = document.getElementsByClassName('_4l5');
    var nodeCom = document.getElementsByClassName('fsm fwn fcg UFICommentActions');
    if (node.length > 0){
        insert_dislike_button(node);
    }
    if (nodeCom.length > 0){
    	insert_dislike_button_comment(node);
    }
};

window.setInterval(function(){
    var node = document.getElementsByClassName('_4l5');
    var nodeCom = document.getElementsByClassName('fsm fwn fcg UFICommentActions');
    if ((node.length > 0)){
        insert_dislike_button(node);
    }
    if ((nodeCom.length > 0)){
        insert_dislike_button_comment(nodeCom);
    }
}, 2000);