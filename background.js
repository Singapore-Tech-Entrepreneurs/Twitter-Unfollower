var actionsByMsgs = {
	
	like_all: {
		url: '',
		code: 'like_all();',
	},
	retweet_all: {
		url: '',
		code: 'retweet_all();',
	},
	unfollow_unfollowers: {
		url: 'https://twitter.com/following/',
		code: 'withdraw();',
	},
};

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
	if (sender.id !== chrome.runtime.id)
		return;

	var action = actionsByMsgs[request.msg];
	if (!action)
		return console.log('Unexpected request message: "' + request.msg + '"');
	
	if( action.code === 'like_all();') {
		chrome.tabs.executeScript(null, {file: 'follow.js'}, (executedScriptResults)=>{
			// Get limit and call witdraw(limit)
			chrome.storage.sync.get(['wait', 'limit'], function(result){
				var wait = result.wait;
				if(typeof wait === 'undefined'){
					wait = '800';
				}
				var limit = result.limit;
				if(typeof limit === 'undefined'){
					limit = '1000';
				}
				var call_function = `like_all(${wait}, ${limit})`
				chrome.tabs.executeScript(null, {code: call_function });
			});
		})
		return
	}			

	if( action.code === 'retweet_all();')	{
		chrome.tabs.executeScript(null, {file: 'follow.js'}, (executedScriptResults)=>{
			// Get limit and call witdraw(limit)
			chrome.storage.sync.get(['wait', 'limit'], function(result){
				var wait = result.wait;
				if(typeof wait === 'undefined'){
					wait = '800';
				}
				var limit = result.limit;
				if(typeof limit === 'undefined'){
					limit = '1000';
				}
				var call_function = `retweet_all(${wait}, ${limit})`
				chrome.tabs.executeScript(null, {code: call_function });
			});
		})
		return
	}
	
	if( action.code === 'withdraw();')	{
		chrome.tabs.query({
			active: true,
			currentWindow: true
		}, function(tabs) {
			chrome.tabs.update(tabs[0].id, {url: action.url}, function(updatedTab) {
				function injectScript() {
					chrome.tabs.executeScript(
						updatedTab.id, 
						{file: 'unfollow.js'}, 
						function(executedScriptResults) {
							// Get limit and call witdraw(limit)
							chrome.storage.sync.get(['wait'], function(result){
								var wait = result.wait;
								if(typeof wait === 'undefined'){
									wait = '800';
								}
								var call_function = `withdraw(${wait})`
								chrome.tabs.executeScript(updatedTab.id, {code: call_function });
							});
							
						}
					);
				}
				if (updatedTab.status === 'complete')
					injectScript();
				else
					chrome.tabs.onUpdated.addListener(function listener(updatedTabId, changeInfo, tab) {
						if (updatedTabId === updatedTab.id && changeInfo.status === 'complete') {
							chrome.tabs.onUpdated.removeListener(listener);
							injectScript();
						}
					});
			});
		});
	}
	
});