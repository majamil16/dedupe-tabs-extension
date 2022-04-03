// let allTabs = [];
let sortedTabs = [];
let sortedTabsDict = {};

// const LEVELS = Object.freeze({0:'DEBUG', 1:'WARNING', 2:'ERROR'}); // from least to most restrictive
const LEVELS = Object.freeze({'DEBUG':0, 'WARNING':1, 'ERROR':2}); // from least to most restrictive
const LOGGING_LEVEL = 'DEBUG'; 
const LOGGING = true; // change to true / false 

console.log('popup.js > LOGGING_LEVEL=' + LOGGING_LEVEL + ' LOGGING ENABLED?' + LOGGING )

const logger = (str,level='DEBUG') => {
  let lvl = LEVELS.level
  console.log(LEVELS.level)
  // let log_lvl = LEVELS.LOGGING_LEVEL
  if (LOGGING && (lvl >= LEVELS.LOGGING_LEVEL)) { // if the level of what we are logging is >= LOGGING_LEVEL -> print to console (when LOGGING_LEVEL = log everything. when it's ERROR, only log errors)
    console.log('-' + level + '-')
    console.log(str);
  }
}


// chrome.storage.local.get(['sorted_tabs'], (result) => {
//   sortedTabs = result['sorted_tabs'];
//   logger(sortedTabs, 'DEBUG')

//   // getTabsPerWebsite(sortedTabs);
//   displayTabsInPopup();
// });

/* Split the url to organize the sorted tabs by website 
  ex. www.abc.com/login, www.abc.com/tab1, www.abc.com/tab2, www.abc.com/tab2, 
*/
const getTabsPerWebsite = (tabs) => {
  // let basenames = tabs.map(t => {console.log( "basename : " + t.url.toString().split('/')[2] + 'url : ' + t.url);return t.url.toString().split('/')[2]});
  
  let URLS = tabs.map(t => {return {tabId: t.id, tabUrl: new URL(t.url)}});

  // console.log(basenames);
  // let uniqueUrlsKeys = Object.keys(URLS)
  let uniqueUrls = {}

  URLS.forEach (u => {
    logger("Origin@" + u.tabUrl.origin, 'DEBUG');
    // uniqueUrls[u.hostname].push(u)
    
    // check if hostname is already in uniqueURLS => append it else initialize it
    if (uniqueUrls[u.tabUrl.origin] == null ){ 
      // console.log('initialize')
      uniqueUrls[u.tabUrl.origin] = []; 
    }
    logger('KEY', 'DEBUG')
    logger(uniqueUrls[u.tabUrl.origin], 'DEBUG')

    logger('VAL', 'DEBUG')
    logger(u.tabUrl.origin, 'DEBUG')
    // uniqueUrls[u.tabUrl.origin].push(u); // TODO - figure out - store the whole thing here or just tab ID? because url can be retrieved from Id (in stored_tabs). 
    // also potentially - flatten response of sortedTabs to get {id:tabInfo} as k:v instead of list [tabInfo, tabInfo, ...] to retrieve tabInfo by id
    uniqueUrls[u.tabUrl.origin].push(u.tabId); // ^^ like this instead

  }) 
  
  // console.log('unique urls : ')
  // console.log(uniqueUrls)

}


// Define function to create tabs shown in the popup
const createTabElement = (tab) => {
  const li = document.createElement('li');
  li.textContent = tab.title + ': ID=' + tab.id + ', WINDOW=' + tab.windowId;

  // create the switch tab icon
  const ic = document.createElement('i');
  ic.className = 'gg-arrow-top-right-r'
  // open the tab when icon clicked
  ic.onclick = () => {
    logger('Clicked!', 'DEBUG')
    logger(tab.id, 'DEBUG')
    logger(tab.windowId, 'DEBUG')
    chrome.runtime.sendMessage({ type: "changeTab", tabId: tab.id, windowId: tab.windowId }, (response) => {
      logger('sent changeTab message', 'DEBUG')
      logger(response, 'DEBUG')
    });
  };

  li.appendChild(ic)

  // create the close tab icon
  const xic = document.createElement('i');
  xic.className = 'gg-close-r'
  // open the tab when icon clicked
  xic.onclick = () => {
    logger('Clicked close!', 'DEBUG')
    logger(tab.id, 'DEBUG')
    logger(tab.windowId, 'DEBUG')
    chrome.runtime.sendMessage({ type: "closeTab", tabId: tab.id, windowId: tab.windowId }, (response) => {
      logger('sent closeTab message', 'DEBUG')
    });
  };

  li.appendChild(xic)

  return li;
}

// Define function to display the sorted tabs in the popup
const displayTabsInPopup = () => {
  let tabsList = document.getElementById("tabs-list")
  tabsList.append(...sortedTabs.map(createTabElement)); // use append to append multiple children at once
}

const onDedupe = () => {
  console.log('Dedupe!')
}
const onSaved = () => {
  console.log('onSaved!')
}

// add listeners for button clicks
document.getElementById("dedupe-btn").addEventListener("click", onDedupe);
document.getElementById("saved-btn").addEventListener("click", onSaved);

// Send message to background.js
// document.getElementsByClassName("gg-arrow-top-right-r").addEventListener("click",function(){
//   console.log("Event listener")
//   chrome.runtime.sendMessage({type: "changeTab",  },function(response) {
//     console.log('inner')
//   });

// });

// add event listener for 

chrome.storage.onChanged.addListener((changes, namespace) => {
  console.log('changes')
  console.log(changes)

  console.log('namespace')
  console.log(namespace)
})