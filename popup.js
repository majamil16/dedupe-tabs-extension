// let allTabs = [];
let sortedTabs = [];

chrome.storage.local.get(['sorted_tabs'], (result) => {
  sortedTabs = result['sorted_tabs'];

  getTabsPerWebsite(sortedTabs);
  displayTabsInPopup();
});

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
    console.log("Origin@" + u.tabUrl.origin);
    // uniqueUrls[u.hostname].push(u)
    
    // check if hostname is already in uniqueURLS => append it else initialize it
    if (uniqueUrls[u.tabUrl.origin] == null ){ 
      console.log('initialize')
      uniqueUrls[u.tabUrl.origin] = []; 
    }
    console.log('KEY')
    console.log(uniqueUrls[u.tabUrl.origin])

    console.log('VAL')
    console.log(u.tabUrl.origin)
    // uniqueUrls[u.tabUrl.origin].push(u); // TODO - figure out - store the whole thing here or just tab ID? because url can be retrieved from Id (in stored_tabs). 
    // also potentially - flatten response of sortedTabs to get {id:tabInfo} as k:v instead of list [tabInfo, tabInfo, ...] to retrieve tabInfo by id
    uniqueUrls[u.tabUrl.origin].push(u.tabId); // ^^ like this instead

  }) 
  
  console.log('unique urls : ')
  console.log(uniqueUrls)
  // for 

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
    console.log('Clicked!')
    console.log(tab.id)
    console.log(tab.windowId)
    chrome.runtime.sendMessage({ type: "changeTab", tabId: tab.id, windowId: tab.windowId }, (response) => {
      console.log('sent changeTab message')
      console.log(response)
    });
  };

  li.appendChild(ic)

  // create the close tab icon
  const xic = document.createElement('i');
  xic.className = 'gg-close-r'
  // open the tab when icon clicked
  xic.onclick = () => {
    console.log('Clicked close!')
    console.log(tab.id)
    console.log(tab.windowId)
    chrome.runtime.sendMessage({ type: "closeTab", tabId: tab.id, windowId: tab.windowId }, (response) => {
      console.log('sent closeTab message')
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


// Send message to background.js
// document.getElementsByClassName("gg-arrow-top-right-r").addEventListener("click",function(){
//   console.log("Event listener")
//   chrome.runtime.sendMessage({type: "changeTab",  },function(response) {
//     console.log('inner')
//   });

// });

// add event listener for 