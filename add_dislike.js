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
	userURL = userURL.replace('https://www.facebook.com/', '');
	userURL = userURL.replace('https://facebook.com/', '');
	var slash_index = userURL.indexOf('/');
    var question_index = userURL.indexOf('?');
    var userID = '';
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

function get_friends(friendID, userID, callback){
	$.get(friendID+'?and='+userID+'&sk=friends', function(page){
		var mutualFriends = $(page).filter('code').map(function() {
		  	var mutualFriendsImgs = $(this.innerHTML.substring(4,this.innerHTML.length-3)).find('a._8o');
		  	if (mutualFriendsImgs == undefined || mutualFriendsImgs.length == 0) {
			  	return null;
		  	}
		  	return mutualFriendsImgs.map(function(){ return $(this).attr('href'); });
		})[0];
		mutualFriends = asArray(mutualFriends);
		callback(mutualFriends);
	});
}

function asArray(x) {
	return [].slice.call(x);
}

// function removeDuplicated(names)
// {
//     return names.reduce(function(a,b){ if(a.indexOf(b)<0) a.push(b); return a; },[]);
// }

// Array.prototype.diff = function(a){
//     return this.filter(function(i){ return a.indexOf(i) < 0; });
// };

var allFriends = new Array();

$('body').on('click', '.UFIDislikeLink', function(){
	var proof = $(this).parents('.userContentWrapper').first().text();
	var posterURL = $(this).parents('.userContentWrapper').first().find('._5pb8').first().attr('href');
	var posterID = get_user_name(posterURL);
	get_friends('me', posterID, function get_more_friends(mutualFriends){
		mutualFriends.forEach(function(friendURL){
			var friendID = get_user_name(friendURL);
			if (allFriends.indexOf(friendID) == -1){
				allFriends.push(friendID);
				console.log(friendID);
				get_friends(friendID, posterID, get_more_friends);
			}
		});
	});
});

$('body').on('click', '.UFIDislikeCommentLink', function(){
	var proof = $(this).parents('.userContentWrapper').first().text();
	var posterURL = $(this).parents('.userContentWrapper').first().find('._5pb8').first().attr('href');
	var commenterURL = $(this).parents('.UFIRow').first().find('.UFICommentActorName').attr('href');
	var posterID = get_user_name(posterURL);
	var commenterID = get_user_name(commenterURL);
	get_friends(posterID, commenterID, function get_more_friends(mutualFriends){
		mutualFriends.forEach(function(friendURL){
			var friendID = get_user_name(friendURL);
			if (allFriends.indexOf(friendID) == -1){
				allFriends.push(friendID);
				console.log(friendID);
				get_friends(friendID, commenterID, get_more_friends);
			}
		});
	});
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