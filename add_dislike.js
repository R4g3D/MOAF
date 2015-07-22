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

$('body').on('click', '.UFIDislikeLink', function(){
	alert($(this).parents('.userContentWrapper').first().text());
	var uname = $(this).parents('.userContentWrapper').first().find('._5pb8').first().attr('href');
	uname = getUserName(uname);
	alert(uname);
});

$('body').on('click', '.UFIDislikeCommentLink', function(){
	alert($(this).parents('.userContentWrapper').first().text());
	var uname = $(this).parents('.UFIRow').first().find('.UFICommentActorName').attr('href');
	uname = getUserName(uname);
	alert(uname);
});

function getUserName(uname){
	uname = uname.replace('https://www.facebook.com/', '');
	uname = uname.replace('https://facebook.com/', '');
	var slash_index = uname.indexOf('/');
    var question_index = uname.indexOf('?');
    var uid = '';
    if (slash_index != -1){
        uname = uname.substring(0, slash_index);
    } else if (question_index != -1) {
    	uid = uname.substring(question_index, uname.length);
        uname = uname.substring(0, question_index);
        if (uid.includes('id=')){
        	var ampersan_index = uid.indexOf('&');
        	if (ampersan_index != -1){
        		uid = uid.substring(0, uid.indexOf('&'));
        	} else {
        		uid = uid.substring(0, uid.length);
        	}
        	return uid;
        }
    }
    return uname;
}

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