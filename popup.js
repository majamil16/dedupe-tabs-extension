let allTabs = [];
let sortedTabs = [];

// TODO - instead of this - query it from chrome storage which is initialized on chrome startup / extension startup
chrome.tabs.query({}, tabs => {
  allTabs = tabs;

  // sort URLS into alphabetical order
  sortedTabs = allTabs.sort(function (a, b) {
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
  
  getTabsPerWebsite(sortedTabs)
  displayTabsInPopup();
});

/* Split the url to organize by website 
  ex. www.abc.com/login, www.abc.com/tab1, www.abc.com/tab2, www.abc.com/tab2, 
*/
const getTabsPerWebsite = (tabs) => {
  // let basenames = sortedTabs.
  let basenames = tabs.forEach(t => {return t.url.toString().split('/')[2]});
  // WHY ISNT THIS WORKING?!

  // basenames.forEach (b => {
  //   console.log("Basename" + b);
  // }) 
  // basenames.map(b => {
  //   console.log("Basename" + b);
  // })

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
  document.body.appendChild(document.createElement('ul'))
    .append(...sortedTabs.map(createTabElement));
}


// Send message to background.js
// document.getElementsByClassName("gg-arrow-top-right-r").addEventListener("click",function(){
//   console.log("Event listener")
//   chrome.runtime.sendMessage({type: "changeTab",  },function(response) {
//     console.log('inner')
//   });

// });

// add event listener for 