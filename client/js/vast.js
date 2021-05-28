//https://www.cdnpkg.com/x2js?id=78499

const contentVideoPlayer = document.querySelector(".content");
const videoPlayer = document.querySelector("#video-player");
const videoSource = document.querySelector("#source-video-tag");

chackVastUrl();

function chackVastUrl() {
  let vastUrl = videoPlayer.getAttribute("vastTag");
  console.log(vastUrl);
  if (vastUrl) {
    stop();
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
  const mediaFiles = creative.MediaFiles.MediaFile;

  contentVideoData = {
    type: videoSource.getAttribute("type"),
    width: videoPlayer.getAttribute("width"),
    height: videoPlayer.getAttribute("height"),
  };

  searchSuitableMediaFile(mediaFiles, contentVideoData);
}

// There can be several media files.First, run the first media file, if it causes an error,
// then pass numberAttempts++ and call the next media file in the array
function searchSuitableMediaFile(mediaFiles, videoData, numberAttempts = 0) {
  const suitableMediaFile = [];

  mediaFiles.forEach((mediaFile) => {
    if (
      mediaFile._type == videoData.type &&
      mediaFile._width == videoData.width
    ) {
      suitableMediaFile.push(mediaFile);
    }
  });

  if (numberAttempts > suitableMediaFile.length) return;
  launchingAds(suitableMediaFile[numberAttempts]);
}

function launchingAds(mediaFile) {
  console.log(mediaFile);

  const videoAds = mediaFile.__cdata;
  console.log(videoAds);
}

function stop() {
  videoPlayer.pause();
  videoPlayer.currentTime = 0;
}

function play() {
  videoPlayer.play();
}
