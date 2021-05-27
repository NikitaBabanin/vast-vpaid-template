//https://www.cdnpkg.com/x2js?id=78499

chackVastUrl();

function chackVastUrl() {
  let checkVastUrlData = document.querySelector("#video-player");
  let vastUrl = checkVastUrlData.getAttribute("vastTag");
  console.log(vastUrl);
  if (vastUrl) {
    parseVastXml(vastUrl);
  }
}

function parseVastXml(vastUrl) {
  try {
    axios.get(vastUrl).then(({ data }) => {
      var x2js = new X2JS();
      var jsonObj = x2js.xml_str2json(data);
      dataPreparation(jsonObj);
      console.log(jsonObj);
    });
  } catch (err) {
    console.log("error", err.message);
  }
}

// Search for the root node (Wrapper or InLine)
function dataPreparation(data) {
  let adType = data.VAST.Ad;

  for (element in adType) {
    if (element === "InLine") {
      inLineNode(adType[element]);
    } else if (element === "Wrapper") {
      wrapperNode(adType[element]);
    } else {
      return;
    }
  }
}

function inLineNode(inlineElements) {
  // console.log("inline ", inlineElements);

  parseCreatives(inlineElements.Creatives);
}

function wrapperNode() {
  console.log("wrapper");
}

function parseCreatives(creatives) {
  // console.log("creatives ", creatives);

  const allCreatives = creatives.Creative;
  for (creative in allCreatives) {
    if (creative === "Linear") {
      linearCreative(allCreatives[creative]);
    }
  }
}

function linearCreative(creative) {
  console.log("creative-linear ", creative);

  const videoSelector = getDomElement("#video-player");

  const mediaFiles = creative.MediaFiles.MediaFile;
  console.log(videoSelector);
  console.log(mediaFiles);
}

function getDomElement(selector) {
  return document.querySelector(selector);
}
