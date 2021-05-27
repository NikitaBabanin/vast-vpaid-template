chackVastUrl();

function chackVastUrl() {
  let checkVastUrlData = document.querySelector("#video-player");
  let vastUrl = checkVastUrlData.getAttribute("vastTag");
  console.log(vastUrl);
  if (vastUrl) {
    parseVastXml();
  }
}

function parseVastXml() {
  try {
    const vastUrl = {
      vastXml:
        "https://kme-vast-sample.s3.us-east-2.amazonaws.com/vast-v4.0-inline-interactive.xml",
    };

    axios
      .post("https://warm-fortress-44560.herokuapp.com/api/parse/", vastUrl)
      .then((res) => console.log("fetch ", res));
  } catch (err) {
    console.log("error", err.message);
  }
}
