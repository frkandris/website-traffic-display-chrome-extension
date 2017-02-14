// Based on the CLD plugin by Chromium Authors.

var selectedId = -1;
function getTrafficAndSetBadge() {

  chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {

      // parse the root domain from the url
      var domain = psl.parse(tabs[0].url.split("/")[2]).domain;

      // if there is no domain, do nothing
      if (domain == null) {
        return true;
      }

      // if we don't have it in the local cache storage...
      if (!localStorage.getCacheItem(domain)) {       

        // query it from rank2traffic.com
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'http://www.rank2traffic.com/'+domain, true);

        xhr.onload = function(e) {
          var webpageSource = this.responseText;
          var regExp = /infobox-data-number..(.*)\</g;

          // we need the 2nd occurence
          match = regExp.exec(webpageSource);
          match = regExp.exec(webpageSource);
          var count = match[1];

          // make it shorter
          count = count.replace(" Thousand", "k");
          count = count.replace(" Million", "M");
          count = count.replace(" Billion", "B");
          count = count.replace(" ", "");

          // set the badge and tooltip text
          chrome.browserAction.setBadgeText({"text": count, tabId: selectedId});
          chrome.browserAction.setTitle({"title": count, tabId: selectedId});

          // save it to the local storage
          localStorage.setCacheItem(domain, count, { days: 7 });
        }
        xhr.send();
      } else {

        // if we have it in the local storage, load it
        var count = localStorage.getCacheItem(domain);

        // set the badge and tooltip text
        chrome.browserAction.setBadgeText({"text": count, tabId: selectedId});
        chrome.browserAction.setTitle({"title": count, tabId: selectedId});        
      }
  });
}

// initiate listeners

chrome.tabs.onUpdated.addListener(function(tabId, props) {
  if (props.status == "complete" && tabId == selectedId)
    getTrafficAndSetBadge();
});

chrome.tabs.onSelectionChanged.addListener(function(tabId, props) {
  selectedId = tabId;
  getTrafficAndSetBadge();
});

chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  selectedId = tabs[0].id;
  getTrafficAndSetBadge();
});

