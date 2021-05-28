/**
 * https://www.cdnpkg.com/x2js?id=78499  - xml parser
 *
 * 1) chackVastUrl  - Checks if the link to vast was passed
 *
 * 2) parseVastXml  - Go here if there is a link.Download the xml and parse it
 *
 * 3) dataPreparation - Check wrapper or InLine
 *
 * 4) inLineNode - Retrieves creatives
 *
 * 5) parseCreatives - Checks the ad type and runs the appropriate method
 *
 * 6) linearCreative - get video content data and getting the media files
 *
 * 7) searchSuitableMediaFile - Search for the appropriate media file. There may be several of them. By default, we take the first one, if it does not work,
 *                              we will run everything until it ends
 *
 * 8) launchingAds - launching ads
 */

const contentVideoPlayer = document.querySelector(".content");
const videoPlayer = document.querySelector("#video-player");
const videoSource = document.querySelector("#source-video-tag");
const btnWrapper = document.querySelector(".wrapper-button");

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

  const srcVideoContent = videoSource.getAttribute("src");
  videoPlayer.src = `${mediaFile.__cdata}`;
  btnWrapper.style.display = "none";

  console.log(videoPlayer.getAttribute("src"));

  videoPlayer.addEventListener(
    "ended",
    () => {
      videoPlayer.src = `${srcVideoContent}`;
      btnWrapper.style.display = "flex";
      play();
    },
    false
  );
}

function stop() {
  videoPlayer.pause();
  videoPlayer.currentTime = 0;
}

function play() {
  videoPlayer.play();
}
