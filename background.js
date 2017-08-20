/*
    Firefox addon "Undo Close Tab"
    Copyright (C) 2017  Manuel Reimer <manuel.reimer@gmx.de>
    Copyright (C) 2017  YFdyh000 <yfdyh000@gmail.com>

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

// Function to do all this "Promise" stuff required by the WebExtensions API.
// Will finally call the supplied callback with a list of closed tabs.

function isShowMoreMenuItems() {
  browser.storage.local.get("moreMenuItems").then(options => {
    return !!options.moreMenuItems;
  }, error => {
    console.error(error)
  });
}


async function GetLastClosedTabs() {
  try {
    const currentWindow = await browser.windows.getCurrent();
    const sessions = await browser.sessions.getRecentlyClosed();
    let tabs = sessions.filter((s) => (s.tab && s.tab.windowId === currentWindow.id));
    return tabs;
  } catch (error) {
    // Simple error handler. Just logs the error to console.
    console.log(error);
  }
}

// Fired if the toolbar button is clicked.
// Restores the last closed tab in list.
async function ToolbarButtonClicked() {
  const tabs = await GetLastClosedTabs();
  if (tabs.length > 0)
    await browser.sessions.restore(tabs[0].sessionId);
}

// Fired if the list of closed tabs has changed.
// Updates the context menu entries with the list of last closed tabs.
async function ClosedTabListChanged() {
  await browser.contextMenus.removeAll();
  const tabs = await GetLastClosedTabs();
  tabs.forEach((closedTab) => {
    let tab = closedTab.tab; // stripping "lastModified"
    browser.contextMenus.create({
      id: tab.sessionId,
      title: tab.title,
      contexts: ["browser_action"]
    // TODO:
    // TODO: Restores the specified number of tabs。prom 弹出询问数量。
    /*
    browser_action
    Applies when the user context-clicks your browser action. You can only add 6 items to the top-level context menu, but can add submenus. */
    // https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/contextMenus/ACTION_MENU_TOP_LEVEL_LIMIT
    // https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/contextMenus/create - parentId
    });
  })
}

// Fired if one of our context menu entries is clicked.
// Restores the tab, referenced by this context menu entry.
function ContextMenuClicked(aInfo) {
  browser.sessions.restore(aInfo.menuItemId);
}

// Register event listeners
browser.browserAction.onClicked.addListener(ToolbarButtonClicked);

browser.sessions.onChanged.addListener(ClosedTabListChanged);
browser.windows.onFocusChanged.addListener(ClosedTabListChanged);
ClosedTabListChanged();

browser.contextMenus.onClicked.addListener(ContextMenuClicked);

browser.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") { // Initialize preferences
    browser.storage.local.set({
      moreMenuItems: false
    }).then(() => {
    }, error => {
      console.error(error);
    })
  }
})