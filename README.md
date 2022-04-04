# README

[Tabs](https://developer.chrome.com/docs/extensions/reference/tabs/)

* onCreated
* onDetached
=> update chrome.storage => update text in Popup
=> If that url is already present => warn the user (future feature?)


Window

[Action](https://developer.chrome.com/docs/extensions/reference/action/)


* IMPORTANT https://stackoverflow.com/questions/51411142/connect-from-popup-html-to-background-js-script-in-chrome-extension

* Icons : https://css.gg/

To check localStorage in chrome dev tools:

    chrome.storage.local.get(function(result){console.log(result)})

Find all TODO in git commit [stackoverflow](https://stackoverflow.com/questions/25039242/how-to-list-all-my-current-todo-messages-in-a-git-repository/25042219#25042219)

    git grep -I -l TODO | xargs -n1 git blame -f -n -w | grep TODO | sed "s/.\{9\}//" | sed "s/(.*)[[:space:]]*//"
