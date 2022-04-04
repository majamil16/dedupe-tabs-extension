console.log("This is my extension!!");
let TABS;
let SORTEDTABS;

const LOGGING = true; // change to true / false 

const logger = (str) => {
  if (LOGGING) {
    console.log("My logger===")
    console.log(str);
  }
}


// async function getCurrentTab() {
//   let queryOptions = { active: true, currentWindow: true };
//   let [tab] = await chrome.tabs.query(queryOptions);
//   logger(tab)
//   return tab;
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

// update the tabs in localstorage to add or remove this tab 
// action is removed or created or 'updated'
const updateStorage = async (args = { tab: null, tabId: null, action: '' }) => {
  console.log("Update storage")
  const { tab, tabId, action } = args
  let stored_tabs = await chrome.storage.local.get('sorted_tabs')
  // console.log(stored_tabs)
  console.log('awaited.')
  switch (action) {
    case 'removed': // when tab closed
      logger('tab removed')
      // if removed, we only get the tabId
      console.log('removing tab: ' + tabId)


      break
    case 'created': // when new tab opened
      logger('tab created')
      console.log(tab)
      // add the tab  to localstorage

      //await chrome.storage.local.set({ 'sorted_tabs': {...stored_tabs, [tabId]:tab} })
      logger('tab added to storage.')

      break
    case 'updated' : // when the URL of a tabid updated (you go to a new page, in the same tab.)
      logger('tab updated => ')
      let { id, url } = tab
      let filtered = stored_tabs['sorted_tabs'][id]

      console.log(filtered)
      console.log('old url : ' + filtered.url)
      console.log('new url : ' +  url)
      // update the localstorage at [id] 
      stored_tabs['sorted_tabs'][id].url = url
  
      await chrome.storage.local.set({ 'sorted_tabs': stored_tabs['sorted_tabs'] }) // ['sorted_tabs'] key otherwise get infinite nesting of the object :(
      
      
      console.log('updated ' + filtered.url + " to " + url) // TODO - filtered.url is giving the wrong (NEW! instead of old) value
      
      break
  }
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
  // hmm?
  // https://stackoverflow.com/questions/62852551/javascript-event-handler-working-with-an-async-data-store-api-causing-race-condi
  chrome.tabs.onRemoved.addListener(async (tab) => {
    logger('chrome.tabs.onRemoved.addListener')
    console.log('tab closed;')
    logger(tab)
    await updateStorage({ tabId: tab, action: 'removed' });
  });

  chrome.tabs.onCreated.addListener(async (tab) => {
    logger('chrome.tabs.onCreated.addListener')
    await updateStorage({ tab: tab, action: 'created' });
  });

  chrome.tabs.onUpdated.addListener(
    async (tabId, changeInfo, tab) => {
      if (changeInfo.url) { 
        logger('url changed')
        console.log(tab)
        await updateStorage({ tab: tab, action: 'updated' });
      }
    }
  )


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
  SORTEDTABS = mytabs.sortedTabs; // TODO - sorting doesn't take into account www vs non-www (so if google.com and www.google.com are both open, they would not be deduped)

  // map to id:tab format
  let SORTEDTABS2 = {}
  mytabs.sortedTabs.forEach(tb => SORTEDTABS2[tb.id] = tb)

  logger("SORTED TABS 2")
  // logger(SORTEDTABS2)

  chrome.storage.local.set({ 'sorted_tabs': SORTEDTABS2 }, () => {
    logger('Set sorted tabs')
  })

  logger(SORTEDTABS)
}

// Listen for the sent message from popup.js
// Do this => https://stackoverflow.com/questions/54126343/how-to-fix-unchecked-runtime-lasterror-the-message-port-closed-before-a-respon
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
      await updateStorage({ tabId: tabId, action: 'removed' })
      sendResponse('tab closed!')
    })(request);
  }
  return true;// ? I need to make this a promise anyway
});