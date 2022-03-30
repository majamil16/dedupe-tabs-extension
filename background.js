console.log("This is my extension!!");
let TABS;
let SORTEDTABS;

const LOGGING = true; // change to true / false 

const logger = (str) => {
  if (LOGGING) {
    console.log("My lgger===")
    console.log(str);
  }
}


// chrome.tabs.onActivated.addListener(newTab => getCurrentTab);


// async function getCurrentTab() {
//   let queryOptions = { active: true, currentWindow: true };
//   let [tab] = await chrome.tabs.query(queryOptions);
//   logger(tab)
//   return tab;
// }



// async function getAllWindows() {
//   let queryOptions = { populate: true };
//   let windows = await chrome.windows.getAll(queryOptions)
//   // logger(windows)
//   return windows
// }

// /**
//  * 
//  * 
//  */
const getAllTabs = async (params = { sorted: true }) => {
  // let queryOptions = { active: true };
  let queryOptions = {} // don't pass any options - to get all tabs
  let tabs = await chrome.tabs.query(queryOptions);

  // only care about these fields
  const keys_to_keep = ['id',
    'title',
    'url',
    'windowId'];
  let filteredTabs = tabs.map(o => keys_to_keep.reduce((acc, curr) => {
    // logger(o.id)
    acc[curr] = o[curr];
    // acc[o.id] = o[curr];
    return acc;
  }, {}))
  if (params.sorted) {
    // let sortedTabs = tabs.sort(function (a, b) {
      let sortedTabs = filteredTabs.sort(function (a, b) {
      var urlA = a.url.toUpperCase(); // ignore upper and lowercase
      var urlB = b.url.toUpperCase(); // ignore upper and lowercase
      if (urlA < urlB) {
        return -1; //urlA comes first
      }
      if (urlA > urlB) {
        return 1; // urlB comes first
      }
      return 0;  // names must be equal
    });

    return { filteredTabs, sortedTabs }
  }
  return { filteredTabs }

}

// update the tabs in localstorage to remove this tab
const updateStorage = async () => {
  console.log("Update storage")
}

// Update tabs when tab removed or updated
// async function updateTabs() {
//   
// }



// Switch to the selected tab / selected window
const switchTab = async (windowId, tabId) => {
  logger('In switchtab');
  logger(windowId);
  logger(tabId);
  // switch & activate the window
  logger('In switch & activate the window');
  chrome.windows.update(windowId, { 'focused': true })
  logger('In switch & activate the tab');
  chrome.tabs.update(tabId, { active: true, highlighted: true });

}

// Close the selected tab
const closeTab = async (tabId) => {
  logger('In closeTab');
  logger(tabId);
  chrome.tabs.remove(tabId);
}

// Get the tabs that are duplicated, passing in allTabs
// which is 
const getDupes = async (allTabs) => {

}

// Uncomment this later - this is to listen for changes in tabs and, if so, update the windows
(function () {

  chrome.tabs.onRemoved.addListener(async (tab) => {
    logger('chrome.tabs.onRemoved.addListener')
    await updateStorage(tab);
  });

  chrome.tabs.onCreated.addListener((tab) => {
    logger('chrome.tabs.onCreated.addListener')
    // getAllWindows();
  });


}());

// Our background page isn't persistent, so subscribe to events.
chrome.runtime.onStartup.addListener(() => {
  logger("startup!");
  (async () => {
    init();
  })();
});
// onInstalled fires when user uses chrome://extensions page to reload
chrome.runtime.onInstalled.addListener(() => {
  logger("onInstalled!");
  (async () => {
    init();
  })();
});

const init = async () => {
  // initialize the tabs in LocalStorage
  logger("init!")

  let mytabs = await getAllTabs({ sorted: true })
  TABS = mytabs.tabs;
  SORTEDTABS = mytabs.sortedTabs;

  chrome.storage.local.set({ 'sorted_tabs': SORTEDTABS }, () => {
    logger('Set sorted tabs')
  })

  logger(SORTEDTABS)



}

// Listen for the sent message from popup.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  logger("REQUEST:");
  logger(request)
  if (request.type == "changeTab") {
    logger('changeTab onMessage received!');

    (async (req) => {
      await switchTab(req.windowId, req.tabId)
      sendResponse('tab changed!')
    })(request);

    return true;
  } if (request.type == "closeTab") {
    logger('closeTab onMessage received!');

    (async (req) => {
      await closeTab(req.tabId)
      sendResponse('tab closed!')
    })(request);

  }

});