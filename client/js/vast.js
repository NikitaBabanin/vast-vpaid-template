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

      console.log(jsonObj);
    });
  } catch (err) {
    console.log("error", err.message);
  }
}

// Search for the root node (Wrapper or InLine)
function dataPreparation(data) {
  let vastRoot = data.vastJson.elements[0].elements;

  //get Ad tag
  let adTag = vastRoot.filter((item) => item.name === "Ad")[0];

  //get wrapper or InLine.
  //It is assumed that there will be only one nested element
  let typeOfAd = adTag.elements[0];

  //check wrapper or InLine
  if (typeOfAd.name === "InLine") {
    inLineNode(typeOfAd.elements);
  } else if (typeOfAd.name === "Wrapper") {
    wrapperNode();
  } else {
    return;
  }
}

function inLineNode(inlineElements) {
  console.log("inline ", inlineElements);

  inlineElements.forEach((element) => {
    if (element.name === "Creatives") {
      parseCreatives(element);
    }
  });
}

function wrapperNode() {
  console.log("wrapper");
}

function parseCreatives(creatives) {
  console.log("creatives ", creatives);
}