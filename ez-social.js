
(function () {
	var Social = (function () {
		var Social = function (settings) {
			var ns = Social.Settings.Data;
			ns[settings.api] = Social.Utils.Merge(ns[settings.api], settings.data);
		};
		Social.Init = function (settings) {
			var ns = Social.Settings.Data;
			ns[settings.api] = Social.Utils.Merge(ns[settings.api], settings.data);
		};
		Social.Utils = {
			Merge: function (objOrg, objNew) {
				for (var i in objNew) {
					console.log(objOrg);
					try {
						// Property in destination object set; update its value.
						if ( objNew[i].constructor==Object ) {
							obj1[i] = Utils.Merge(objOrg[i], objNew[i]);
						} else {
							objOrg[i] = objNew[i];
						};
					} catch(e) {

						console.log(objOrg);
						// Property in destination object not set; create it and set its value.
						objOrg[i] = objNew[i];
					};
				};
				return objOrg;
			},
			ContainsDiv : function (id) {
				if(!document.getElementById(id)) {
					var scriptContainer = document.createElement("div");
						scriptContainer.setAttribute("id", id);
						document.getElementsByTagName("body")[0].appendChild(scriptContainer);
				}else{
					var scriptContainer = document.getElementById(id); 
				};
				return scriptContainer;
			},
			URLBuilder : function (obj) {
				var url = [];
				for(var i in obj)
					url.push(i.toLowerCase() + "=" + encodeURIComponent(obj[i]));
				return url.join("&");
			}
		};
		var Settings = (function () {
			var Settings = function (api, key, value) {
				if(value == undefined) {
					return Get(api, key);
				}else{
					return Set(api, key, value);
				};
			},
			Get = function (api, key) {
				var ns = "Settings.Data." + api + "."+key
				return eval(ns);
			},
			Set = function (api, key, value) {
				var ns = Settings.Data;
				ns[api][key] = value;
				if(ns[api][key] == value) {
					return true;
				};
			};
			Settings.Data = {
				Default : {
					AjaxPath:"http://resources.jacquespagels.com/SocialMedia/api.php?url="
				},
				Facebook : {
					AppKey : "270268832987702", 
					Url : {
			         	API:"http://connect.facebook.net/en_US/all.js",
				        Harverst:null
					},
		         	Loaded:false,
		         	oAuth:null,
		         	HarvestFields : "first_name, middle_name, last_name, birthday, gender, email, locale, location, languages"
				},
				Twitter : {
					Url : {
						Timeline: "http://api.twitter.com/1/statuses/user_timeline.json?screen_name="
					},
					TweetSettings:{
						Text : "This is a test",
						Url : "",
						Via:"magicTown",
						HashTags:""
					},
					TimelineCount:"3",
					AccountName : "magictown"
				}
			};
			Social.Settings = Settings;
		})(Social);
		return Social
	})(),

	Loader = (function () {
		var Loader = function (url) {
			return Request(url);
		},
		Request =  function (url) {
			try{
				// Find a div on the page that all the javaScript API files will be loaded into.
				var scriptContainer = S.Utils.ContainsDiv("social");	
				// Request the API files code.
				var code = Loader.MakeRequest(url);
				// add the returned content to a newly created script tag
				var script = document.createElement('script');
				script.type = "text/javascript";
				script.text = code;
				scriptContainer.appendChild(script);
				return true;	
			}catch(e) {
				return false;
			};
		};
		Loader.MakeRequest = function (url, method) {
			var i = S.Settings("Default", "AjaxPath");
			if(i) {url = i + url};
			if (window.XMLHttpRequest) {
				var xhrObj = new XMLHttpRequest();
			}
			else{
				var xhrObj = new ActiveXObject("Microsoft.XMLHTTP");
			};
			// Open and send a synchronous request to a simple service that simply returns the API code(X-Domain Policy work around)
			xhrObj.open("GET", url, false);
			xhrObj.send(null);
			return xhrObj.responseText;
		};
		// Return the Loader object.
		Social.Utils.GetData = Loader.MakeRequest;
		return Social.Loader = Loader;
	})(Social),

	Validate = (function () {
		var Validate = function (api, type, data) {
			var dataTypes = Validate.Data[api],
				ErrorMsg = "Please add the following: ",
				ErrorList = new Array;
			if(typeof data === "object") {
				for(i in dataTypes[type]) {
					if(data[dataTypes[type][i]] == undefined) {
						ErrorList.push(dataTypes[type][i]);
					};
				};
			}else{
				for(i in dataTypes[type]) {
					ErrorList.push(dataTypes[type][i]);
				};
			};
			if(ErrorList.length == 0) {
				return true;
			}else{
				alert(ErrorMsg + ErrorList);
				return false;
			};
		};
		Validate.Data = {
			Facebook : {
				"feed":["link", "name", "caption"],
				"share":["name", "link"],
				"invite":["title", "message", "caption"]
			},
			Twitter : {
				"Latest" : ["containerId"]
			}
		};
		Social.Validate = Validate;
	})(Social),
	
	Facebook = (function () {
		var Facebook = function (action, data) {
			if((S.Utils.ContainsDiv("fb-root")) && (LoadAPI())) {
				var test = FB.getLoginStatus(SetStatus);
				if((S.Settings("Facebook", "oAuth") == null) || (S.Settings("Facebook", "oAuth.status") !== "connected")) {
//					if(Login()){
						var a = eval(action.charAt(0).toUpperCase() + action.slice(1));
						return a(data);
//					};
				}else{
					var a = eval(action.charAt(0).toUpperCase() + action.slice(1));
					return a(data);
				};
			};
		},
		SetStatus = function (response) {
			if(response != undefined) {
				S.Settings("Facebook", "oAuth", response);
				return true;
			}else{
				return false;
			};
		},
		LoadAPI = function () {
			var isApiLoaded = S.Settings("Facebook", "isApiLoaded"),
				isInit = S.Settings("Facebook", "isInit");
			if(isApiLoaded && isInit) {
				return true;
			}else{
				if((isApiLoaded == undefined) || (isApiLoaded != true)) {
					S.Settings("Facebook", "isApiLoaded", S.Loader(S.Settings("Default", "AjaxPath") + S.Settings("Facebook", "Url.API")));
				};
				if((S.Settings("Facebook", "isApiLoaded")) && (!S.Settings("Facebook", "isInit"))) {
					// Standard call to initialize the Facebook API.
					FB.init({
						appId  	: 	S.Settings("Facebook", "AppKey"),
						status 	: 	true, // check login status
						xfbml  	: 	true, // parse XFBML
						cookie 	: 	true,
						oauth	: 	true
					});
					return S.Settings("Facebook", "isInit", true);
				}else{
					return false;
				};
			};
		},
		Harvest = function () {
			if(S.Settings("Facebook", "UserData") != undefined) {
				return true;
			}else{
				FB.api("/" + S.Settings("Facebook", "oAuth.authResponse.userID") + "?fields=" + S.Settings("Facebook", "HarvestFields"), function (userData) {
					S.Settings("Facebook", "UserData", userData);
				});
			};
			return true;
		},
		Login = (function () {
			var Login = function (data) {
				var test = FB.getLoginStatus(SetStatus);
				if((S.Settings("Facebook", "oAuth") != undefined) && (S.Settings("Facebook", "oAuth.status") === "connected")) {
					return true;
				}else{
					return DoLogin(data);
				};
			},
			DoLogin = function (data) {
				try{				
					if((data != undefined) && (data.permissions != undefined)) {
						FB.login(function (response) {
							if(response.authResponse) {
								S.Settings("Facebook", "oAuth", response);
								S.Settings("Facebook", "LoggedIn", true);
								return Harvest();
							}else{
								console.log("User cancelled Login!");
							};
						}, 
						{
							perms: data.permissions
						});
					}else{
						FB.login(
							function (response) {
								if(response.authResponse) {
									S.Settings("Facebook", "oAuth", response);
									S.Settings("Facebook", "LoggedIn", true);
									return Harvest();
								}else{
									console.log("User cancelled Login!");
								};	
							}
						);
					};
				}catch(e) {
					console.log("Login failed");
					return false;
				};
			};
			return Login;
		})(),
		Feed = (function () {
			var Feed = function (data) {
				var isValid = S.Validate("Facebook", "feed", data);
				if(isValid) {
					data.method = "feed";
					try{	
						FB.ui(data);
						return true;
					}catch(e) {
						return false;
					};
				}else{
					return isValid;
				};
			};
			return Feed;
		})(),
		Share = (function () {
			var Share = function (data) {
				var isValid = S.Validate("Facebook", "share", data);
				if(isValid) {
					data.method = "send";
					try{	
						FB.ui(data);
						return true;
					}catch(e) {
						return false;
					};
				}else{
					return isValid;
				};
			};
			return Share;
		})(),
		Invite = (function () {
			var Invite = function (data) {
				var isValid = Social.Facebook.Validate("Facebook", "invite", data);
				if(isValid == true) {
					data.method = "apprequests";
					try{	
						var usrs = 0;
						FB.ui(data, function (request_ids) {
							return true;
						});
						return true;
					}catch(e) {
						return false;
					};
				}else{
					return isValid
				};
			};
			return Invite;
		})();
		return Social.Facebook = Facebook;
	})(Social);

	Social.Twitter = (function () {
		var Twitter = function (action, data) {
			var a = eval(action.charAt(0).toUpperCase() + action.slice(1));
			return a(data);
		};
		Twitter.Data = {
			LatestTweets : null
		};
		var Latest = (function () {
			var Latest = function (data) {
				if(S.Validate("Twitter", "Latest", data)) {
					var itemCount = data.TweetCount || S.Settings("Twitter", "TimelineCount"),
						url = S.Settings("Twitter", "Url.Timeline") + S.Settings("Twitter", "AccountName") + "&count=" + itemCount;
					
					Twitter.Data.LatestTweets = eval(Social.Loader.MakeRequest(url));
					return DisplayTweets(data);
				};
			},
			DisplayTweets = function (data) {
				try{
					if(Twitter.Data.LatestTweets.length <= S.Settings("Twitter", "TimelineCount")) {
						var showItems = Twitter.Data.LatestTweets.length; 
					}else{
						var showItems = S.Settings("Twitter", "TimelineCount");
					};
					for (var i=0; i < showItems; i++) {
						var username = Twitter.Data.LatestTweets[i].user.screen_name;
						var status = Twitter.Data.LatestTweets[i].text.replace(/((https?|s?ftp|ssh)\:\/\/[^"\s\<\>]*[^.,;'">\:\s\<\>\)\]\!])/g,
							function (url) { return '<a href="'+url+'">'+url+'</a>';
						}).replace(/\B@([_a-z0-9]+)/ig, function (reply) {
							return  reply.charAt(0)+'<a href="http://twitter.com/'+reply.substring(1)+'">'+reply.substring(1)+'</a>';
						});
						$(S.Utils.ContainsDiv(data.containerId)).append("<p><span class='open'></span>" + status + "<span class='close'></span><br /><a href='http://twitter.com/" + username + "' class='date'>" + Relative_time(Twitter.Data.LatestTweets[i].created_at) + "</a></p>");
					};
					return true;
				}catch(e) {
					return false;
				};
			};
			Relative_time = function (time_value) {
				var values = time_value.split(" ");
					time_value = values[1] + " " + values[2] + " " + values[5] + " " + values[3];
				var parsed_date = new Date();
					parsed_date.setTime(Date.parse(time_value));
				var months = new Array('Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec');
				var m = parsed_date.getMonth();
				var postedAt = '';
					postedAt = months[m];
					postedAt += " "+ parsed_date.getDate();
					postedAt += ","
					postedAt += " "+ parsed_date.getFullYear();
				return postedAt;
			};
			return Latest;
		})(),
		Tweet = (function () {
			var Tweet = function (data) {
				Tweet.Url = S.Utils.Merge(S.Settings("Twitter", "TweetSettings"), Settings.WindowOptions);
				if(data) {
					Tweet.Url = S.Utils.Merge(Tweet.Url, data);
				};
				Tweet.Url = S.Utils.URLBuilder(Tweet.Url);
				return new SendTweet();
			},
			Settings = {
				intentURL : "https://twitter.com/intent/tweet?",
				windowOptions : {
					"scrollbars":"yes",
					"resizable":"no",
					"toolbar":"no",
					"location":"no"
				},
				width : 550,
				height : 254,
				winHeight : screen.height,
				winWidth : screen.width
			},
			SendTweet = function () {
				var left = Math.round((Settings.winWidth / 2) - (Settings.width / 2)),
					top = 0;
				if (Settings.winHeight > Settings.height) {
					top = Math.round((Settings.winHeight / 2) - (Settings.height / 2));
				};
				window.open(Settings.intentURL + Tweet.Url, 'intent', Settings.windowOptions + ',width=' + Settings.width + ',height=' + Settings.height + ',left=' + left + ',top=' + top);
				return true;
			};
			return Tweet;
		})();
		return Social.Twitter = Twitter;
	})(Social);
	window.S = Social;
})(window);