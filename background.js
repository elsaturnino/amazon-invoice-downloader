browser.runtime.onMessage.addListener(downloadLink)

function onStartedDownload(id) {
  console.log(`Started downloading: ${id}`);
}

function onFailedDownload(error) {
  console.log(`Download failed: ${error}`);
}

function downloadLink(message) {
	var components = message.url.split('/');
	var s = components[components.length-1];
	var order_id_regex = /orderID=([0-9-]+)/g;
	var match = order_id_regex.exec(s);
	
	var download_name = s;
	if (match != null) {
		download_name = "amazon-order-" + match[1] + ".html";
	}
	console.log(`Downloading invoice as ${download_name}`)

	browser.downloads.download({
		url : message.url,
		filename : download_name
	}).then(onStartedDownload, onFailedDownload);
}

/*
Called when the item has been created, or when creation failed due to an error.
We'll just log success/failure here.
*/
function onCreated() {
  if (browser.runtime.lastError) {
    console.log(`Error: ${browser.runtime.lastError}`);
  } else {
    console.log("Item created successfully");
  }
}

/*
Create all the context menu items.
*/
browser.menus.create({
  id: "download-invoices",
  title: browser.i18n.getMessage("menuItemAmazonInvoices"),
	documentUrlPatterns: ["*://*.amazon.com/gp/*/order-history*"],
  contexts: ["all"]
}, onCreated);

/*
The click event listener, where we perform the appropriate action given the
ID of the menu item that was clicked.
*/
browser.menus.onClicked.addListener((info, tab) => {
  switch (info.menuItemId) {
    case "download-invoices":
		  browser.tabs.executeScript({
			  file: "content_scripts/invoice-downloader.js"
		  }).then((results) => {
			  browser.tabs.executeScript({
				  code: "findAndDownloadInvoices()"
			  });
		  });
	  break;
  }
});
