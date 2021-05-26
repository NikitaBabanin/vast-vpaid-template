var LinearAd = function () {
  this._slot = null;
  this._videoSlot = null;
  this._eventsCallbacks = {};
  this._parameters = {};
  this._quartileEvent = 0;
  this._quartiles = [
    "AdVideoFirstQuartile",
    "AdVideoMidPoint",
    "AdVideoThirdQuartile",
  ];
};

LinearAd.prototype.initAd = function (
  width,
  height,
  viewMode,
  desiredBitrate,
  creativeData,
  environmentVars
) {
  // slot and videoSlot are passed as part of the environmentVars
  this._slot = environmentVars.slot;
  this._videoSlot = environmentVars.videoSlot;

  this._parameters = JSON.parse(creativeData["AdParameters"]);

  this._attributes = this._parameters["attributes"];

  this._attributes["width"] = width;
  this._attributes["height"] = height;
  this._attributes["viewMode"] = viewMode;
  this._attributes["desiredBitrate"] = desiredBitrate;

  if (this._attributes["linear"]) {
    this._updateVideoSlot();
    this._videoSlot.addEventListener(
      "timeupdate",
      this._timeHandler.bind(this),
      false
    );

    /**
     * ended - вызывается , когда воспроизведение или потоковое остановилось , потому что достигнут конец массовой информации или потому , что нет дополнительных данных не имеется.
     */
    this._videoSlot.addEventListener("ended", this.stopAd.bind(this), false);
  }

  this._slot.innerHTML +=
    '<div id="vpaid-container" style="position:absolute;width:100%;height:100%;z-index:100;"></div>';
  var vpaidContainer = document.getElementById("vpaid-container");
  vpaidContainer.addEventListener(
    "click",
    this._adClickThrough.bind(this),
    false
  );

  this._callEvent("AdLoaded");
};

/**
 * при нажатии на блок и видео(рекламой) - этот метод вызывается и ставит рекламу на паузу
 */
LinearAd.prototype._adClickThrough = function () {
  alert("_adClickThrough");
  this._callEvent("AdClickThru");
  this._videoSlot.pause();
  this._callEvent("AdPaused");
};

/**
 * если videoSlot === null , то создаем его
 * videoSlot-это видеообъект, который креатив может использовать для рендеринга, и видеоэлемент,   который он может содержать
 */
LinearAd.prototype._updateVideoSlot = function () {
  if (this._videoSlot == null) {
    this._videoSlot = document.createElement("videoAd");
    this._slot.appendChild(this._videoSlot);
  }

  var foundSource = false;
  var videos = this._parameters.videos || [];
  for (var i = 0; i < videos.length; i++) {
    // Choose the first video with a supported mimetype.
    if (this._videoSlot.canPlayType(videos[i].mimetype) != "") {
      this._videoSlot.setAttribute("src", videos[i].url);
      foundSource = true;
      break;
    }
  }
  if (!foundSource) {
    // Unable to find a source video.
    this._callEvent("AdError");
  }
};

LinearAd.prototype._timeHandler = function () {
  // call quartile event
  var quartile = Math.floor(
    ((this._videoSlot.currentTime / this._videoSlot.duration) * 100) / 25
  );
  if (this._quartileEvent !== quartile) {
    this._quartileEvent = quartile;
    this._callEvent(this._quartiles[quartile - 1]);
  }
  // change remaining time
  this._attributes["remainingTime"] =
    this._videoSlot.duration - this._videoSlot.currentTime;

  //для версии 1.0
  this._callEvent("AdRemainingTimeChange");

  // для версии 2.0
  // this._callEvent("AdDurationChange");
};

/**
 * Метот handshakeVersion видео плеер вызывает первым,для проверки версии vpaid
 */
LinearAd.prototype.handshakeVersion = function (version) {
  return "2.0";
};

/**
 * startAd запускается вторым, сразу после handshakeVersion
 * Если рекламное объявление линейное, то вызываем метод play
 * Если у рекламы есть возможность пропуска, то создаем кнопку пропуска
 * и остальные кнопки
 */
LinearAd.prototype.startAd = function () {
  if (this._attributes["linear"]) {
    this._videoSlot.play();

    if (this.getAdSkippableState()) {
      setTimeout(() => {
        this._createAdButton("Skip", this.skipAd);
      }, 2000);
    }

    this._createAdButton("Resume", this.resumeAd);
    this._createAdButton("Pause", this.pauseAd);

    this._callEvent("AdStarted");
    this._callEvent("AdImpression");
  }
};

//Конструктор кнопок
LinearAd.prototype._createAdButton = function (text, eventType) {
  var adButton = document.createElement("button");
  adButton.style.cssText = "padding:10px 25px; fontSize:20px;";
  if (text === "Skip") {
    adButton.style.cssText =
      "position:absolute;right:20px;bottom:40px;background-color:rgba(0,0,0, .7);border:none;padding:15px 30px;color:white;font-weight:900";
  }
  var buttonText = document.createTextNode(text);
  adButton.appendChild(buttonText);
  adButton.addEventListener("click", eventType.bind(this), false);
  preventEventBubbling(adButton);
  var vpaidContainer = document.getElementById("vpaid-container");
  vpaidContainer.appendChild(adButton);
};

function preventEventBubbling(button) {
  button.onclick = function (e) {
    e.stopPropagation();
  };
}

/**
 * 
В AdStopped Рекламный блок отправляет событие, чтобы уведомить видеопроигрыватель о том, что реклама перестала
отображаться и все рекламные ресурсы очищены. Это событие предназначено только для ответа на stopAd () вызов
метода, сделанный видеоплеером. Его никогда не следует использовать для инициации завершения рекламного блока
или для информирования видеопроигрывателя о том, что он теперь может вызывать stopAd ().
 */
LinearAd.prototype.stopAd = function (e, p) {
  var callback = this._callEvent.bind(this);
  this._callEvent("AdVideoComplete");
  setTimeout(callback, 75, ["AdStopped"]);
};

//Изменить громкость
LinearAd.prototype.setAdVolume = function (val) {
  console.log("setAdVolume");
  this._attributes["volume"] = value;
  this._callEvent("AdVolumeChanged");
};

//Получить громокость
LinearAd.prototype.getAdVolume = function () {
  console.log("getAdVolume");
  return this._attributes["volume"];
};

/**
 * 
В resizeAd () Метод вызывается только тогда, когда видеопроигрыватель изменяет ширину и высоту контейнера
видеоконтента, что побуждает рекламный блок масштабировать или перемещать. Затем рекламный блок изменяет свои
размеры до ширины и высоты, которые равны или меньше ширины и высоты, предоставленных видеопроигрывателем.
После изменения размера рекламный блок записывает обновленные размеры в
adWidth а также adHeight свойства и отправляет AdSizeChange событие, чтобы подтвердить, что он изменил
свой размер.
 */
LinearAd.prototype.resizeAd = function (width, height, viewMode) {
  console.log("resizeAd");
  this._attributes["width"] = width;
  this._attributes["height"] = height;
  this._attributes["viewMode"] = viewMode;
  // if linear, resize video
  if (this._attribute["linear"]) {
    try {
      this._videoSlot.setAttribute("width", width);
      this._videoSlot.setAttribute("height", height);
      this._videoSlot.style.width = width + "px";
      this._videoSlot.style.height = height + "px";
    } catch (e) {
      console.log("Could not resize video ad");
    }
  }

  this._callEvent("AdSizeChange");
};

LinearAd.prototype.pauseAd = function () {
  console.log("pauseAd");
  this._videoSlot.pause();
  this._callEvent("AdPaused");
};

LinearAd.prototype.resumeAd = function () {
  console.log("resumeAd");

  this._videoSlot.play();
  this._callEvent("AdResumed");
};

/**
 * Видеоплеер звонит expandAd () когда время подходит для показа расширяемого рекламного блока на
дополнительном интерактивном рекламном месте, например на расширяющейся панели. Видеопроигрыватель
может использовать этот вызов, если он предоставляет кнопку «Развернуть», которая вызывает expandAd () при
нажатии. Рекламный блок отвечает, устанавливая adExpanded свойство true и отправка
AdExpandedChange событие, чтобы подтвердить, что expandAd () звонок вызвал изменение поведения
или внешнего вида объявления.
 */
LinearAd.prototype.expandAd = function () {
  console.log("expandAd");
  this._attributes["expanded"] = true;
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  }
  this._callEvent("AdExpanded");
};

LinearAd.prototype.getAdExpanded = function (val) {
  console.log("getAdExpanded");
  return this._attributes["expanded"];
};

LinearAd.prototype.getAdSkippableState = function (val) {
  return this._attributes["skippableState"];
};

/**
 * Когда рекламный блок находится в развернутом состоянии, видеопроигрыватель может вызвать collapseAd () , чтобы
рекламный блок убрал любое расширенное рекламное пространство. Рекламный блок отвечает, устанавливая
adExpanded свойство false и отправка AdExpandedChange событие, чтобы подтвердить, что collapseAd
() звонок вызвал изменение поведения или внешнего вида объявления.
 */
LinearAd.prototype.collapseAd = function () {
  console.log("collapseAd");
  this._attributes["expanded"] = false;
};

/**
 * Этот метод поддерживает элементы управления пропуском, которые может реализовать видеопроигрыватель. Видеоплеер звонит
пропустить рекламу() когда пользователь активирует элемент управления пропуском, реализованный
видеопроигрывателем. При вызове рекламный блок закрывает объявление, очищает его ресурсы и отправляет
AdSkipped мероприятие.
Игрок должен проверить свойство рекламы ' adSkippableState 'перед звонком
adSkip (). adSkip () будет работать, только если для этого свойства установлено значение true. Если игрок звонит
adSkip () когда ' adSkippableState 'задано значение false, объявление может игнорировать запрос на
пропуск.
 */
LinearAd.prototype.skipAd = function () {
  console.log("skipAd");
  let skippableState = this._attributes["skippableState"];
  if (skippableState) {
    this._eventsCallbacks["AdSkipped"]();
    let callback = this._callEvent.bind(this);
    setTimeout(callback, 75, ["AdStopped"]);
  }
};

// Здесь регистрируются обратные вызовы для событий
LinearAd.prototype.subscribe = function (aCallback, eventName, aContext) {
  console.log("subscribe");

  var callBack = aCallback.bind(aContext);
  this._eventsCallbacks[eventName] = callBack;
};
// Обратные вызовы удаляются на основе eventName
LinearAd.prototype.unsubscribe = function (eventName) {
  console.log("unsubscribe");
  this._eventsCallbacks[eventName] = null;
};

LinearAd.prototype._callEvent = function (eventType) {
  console.log("_callEvent");
  if (eventType in this._eventsCallbacks) {
    this._eventsCallbacks[eventType]();
  }
};
getVPAIDAd = function () {
  return new LinearAd();
};
