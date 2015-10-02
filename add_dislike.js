function insert_dislike_button(node){
	for (i = 0; i < node.length; i++){
	    var my_node = '<span><a class="UFIDislikeLink" href="#" role="button" aria-live="polite" title="Dislike this"><span>Dislike</span></a></span>';
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

function get_all_friends(friendID, userID) {
	var outstanding = 0;
	var get_friends = function(friendID, userID, get_more_friends){
		outstanding++;
		$.get(friendID+'?and='+userID+'&sk=friends', function(page){
			outstanding--;
			var mutualFriends = $(page).filter('code').map(function() {
			  	var mutualFriendsLnks = $(this.innerHTML.substring(4,this.innerHTML.length-3)).find('div.fsl');
			  	if (mutualFriendsLnks == undefined || mutualFriendsLnks.length == 0) {
				  	return null;
			  	}
			  	return mutualFriendsLnks.map(function(){
			  		return { id : get_user_name($(this).children().first().attr('href')), name : $(this).children().first().text() };
			  	});
			})[0];
			mutualFriends = asArray(mutualFriends);
			get_more_friends(mutualFriends);
			if (outstanding == 0) {
				allFriendsDone = true;
			}
		});
	}
	var get_more_friends = function(mutualFriends){
		var push_into_list = function(friendObj){
			var friendID = friendObj.id;
			if (allFriends.findIndex(withId(friendID)) == -1){
				allFriends.push(friendObj);
				get_friends(friendID, userID, get_more_friends);
			}
		}
		mutualFriends.forEach(push_into_list);
	}
	get_friends(friendID, userID, get_more_friends);
}

function get_family_info(userID){
	$.get(userID+'/about?section=relationship&pnref=about', function(page){

		var idx = 0;
		var familyMembers = $(page).filter('code').map(function() {
			var familyMembersSection = $(this.innerHTML.substring(4,this.innerHTML.length-3)).find('._50f5');
			if (familyMembersSection.length == 0) { // I'm not in the right <code> section.
				return null;
			}
			// if I'm here, it's a family members section. Either populated or unpopulated, I don't know yet;
			var familyMembersLnks = familyMembersSection.find('a');
			var ret = familyMembersLnks.map(function(){
				if (idx == 0) { // relationship section
					var innerRet = { id : get_user_name($(this).attr('href')), name : $(this).text(), relationship : $(this).parent().next().text() };
					return innerRet;
				} else { // family section
					var innerRet = { id : get_user_name($(this).attr('href')), name : $(this).text(), relationship : $(this).parent().parent().next().text() };
					return innerRet;					
				}
			});
			idx++;
			return ret;
		});
		allFamily = asArray(familyMembers).reduce(function(state, curr) {
			return state.concat(asArray(curr));
		}, []);
		allFamilyDone = true;
	});
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

function write_all(userID){
	var closeButton = '<button class="fb_close_button" style="position:absolute;top:20px;right:20px">Close</button>';

	var relationshipString = "";
	if (relationship != undefined){
		relationshipString = "<h2>"+userID+" is in a relationship with " + '<a href="https://www.facebook.com/'+relationship.id+'">'+relationship.name+'</a></h2>';
	}

	var familyString = "";
	if (allFamily != undefined && allFamily.length != 0){
		familyString = "<h2>Total of "+allFamily.length+" family members were found for "+userID+"</h2><p>";
	    allFamily.forEach(function(familyObj){
	        familyString += '<a href="https://www.facebook.com/'+familyObj.id+'">'+familyObj.name+'</a> ';
	    });
	    familyString += '</p>';
	}

    var friendsString = "<h2>Total of "+allFriends.length+" regular friends were found for "+userID+"</h2><p>";
    allFriends.forEach(function(friendObj){
        friendsString += '<a href="https://www.facebook.com/'+friendObj.id+'">'+friendObj.name+'</a> ';
    });
    friendsString += '</p>';
  
    var node = document.getElementsByClassName("moaf_result_container")[0];
    var loading = document.getElementById("loading");
    node.removeChild(loading);
	node.innerHTML = closeButton + relationshipString + familyString + friendsString;
    closeButtonNode = document.getElementsByClassName("fb_close_button")[0];
    closeButtonNode.onclick = function(){
        var node = document.getElementsByClassName("moaf_result_container")[0];
        var body = document.getElementsByTagName("body")[0].removeChild(node);
    };
}

function heuristics(userID){
	if (allFriendsDone){
	}
	if (allFamilyDone){
	}
	if (allFriendsDone && allFamilyDone && !done){
		write_all(userID);
		done = true;
	}
	setTimeout(heuristics, 50, userID);
}

var allFriends;
var allFriendsDone;
var allFamily;
var allFamilyDone;
var relationship;
var done;

function initialise(){
	allFriends = new Array();
	allFriendsDone = false;
	allFamily = new Array();
	allFamilyDone = false;
	relationship = undefined;
	done = false;
}

$('body').on('click', '.UFIDislikeLink', function(){
	initialise();
	var proof = $(this).parents('.userContentWrapper').first().text();
	var posterURL = $(this).parents('.userContentWrapper').first().find('._5pb8').first().attr('href');
	var posterID = get_user_name(posterURL);
	create_view();
	get_all_friends('me', posterID);
	get_family_info(posterID);
	heuristics(posterID);
});

$('body').on('click', '.UFIDislikeCommentLink', function(){
	initialise();
	var proof = $(this).parents('.userContentWrapper').first().text();
	var posterURL = $(this).parents('.userContentWrapper').first().find('._5pb8').first().attr('href');
	var commenterURL = $(this).parents('.UFIRow').first().find('.UFICommentActorName').attr('href');
	var posterID = get_user_name(posterURL);
	var commenterID = get_user_name(commenterURL);
	create_view();
	if (posterID == commenterID) {
		get_all_friends('me', commenterID);
	} else {
		get_all_friends(posterID, commenterID);
	}
	get_family_info(commenterID);
	heuristics(commenterID);
});

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