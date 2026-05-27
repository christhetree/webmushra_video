/*************************************************************************
         (C) Copyright AudioLabs 2017 

This source code is protected by copyright law and international treaties. This source code is made available to You subject to the terms and conditions of the Software License for the webMUSHRA.js Software. Said terms and conditions have been made available to You prior to Your download of this source code. By downloading this source code You agree to be bound by the above mentionend terms and conditions, which can also be found here: https://www.audiolabs-erlangen.de/resources/webMUSHRA. Any unauthorised use of this source code may result in severe civil and criminal penalties, and will be prosecuted to the maximum extent possible under law. 

**************************************************************************/

function LikertSingleStimulusPage(_pageManager, _pageTemplateRenderer, _pageConfig, _audioContext, _bufferSize, _audioFileLoader, _stimulus, _session, _errorHandler, _language) {
  this.pageManager = _pageManager;
  this.pageTemplateRenderer = _pageTemplateRenderer; 
  this.pageConfig = _pageConfig;  
  this.audioContext = _audioContext;
  this.bufferSize = _bufferSize;
  this.audioFileLoader = _audioFileLoader;
  this.stimulus = _stimulus;  
  this.session = _session;      
  this.errorHandler = _errorHandler;
  this.language = _language;
  this.fpc = null;    
    
  this.audioFileLoader.addFile(this.stimulus.getFilepath(), (function (_buffer, _stimulus) { _stimulus.setAudioBuffer(_buffer); }), this.stimulus);
  this.filePlayer = null;
  this.waveformVisualizer = null;
  this.likerts = [];
  this.ratingMap = {};
    
  this.time = 0; 
  this.startTimeOnPage = null;
  this.results= [];
} 

LikertSingleStimulusPage.prototype.getName = function () {
  return this.pageConfig.name;
};

LikertSingleStimulusPage.prototype.init = function (_callbackError) { 
  this.filePlayer = new FilePlayer(this.audioContext, this.bufferSize, [this.stimulus], this.errorHandler, this.language, this.pageManager.getLocalizer(), this.pageConfig.showWaveform);
  
  var cbk = (function(_prefix) {
    this.ratingMap[_prefix] = true;
    if (Object.keys(this.ratingMap).length == this.likerts.length) {
      this.pageTemplateRenderer.unlockNextButton();
    }
  }).bind(this);
  
  
  if (this.pageConfig.mustRate === false) {
    cbk = false;  
  }
  
  if (Array.isArray(this.pageConfig.response[0])) {
    for (var i = 0; i < this.pageConfig.response.length; ++i) {
      this.likerts.push(new LikertScale(this.pageConfig.response[i], i + '_', this.pageConfig.mustPlayback, cbk));
    }
  } else {
    this.likerts.push(new LikertScale(this.pageConfig.response, '1_', this.pageConfig.mustPlayback, cbk));
  }
 
  if (this.pageConfig.mustPlayback) {
    this.filePlayer.genericAudioControl.addEventListener((function (_event) {
      if (_event.name == this.pageConfig.mustPlayback) {
        this.likerts.map(function(l) {l.enable();});
      } 
    }).bind(this));

  }

};
  



LikertSingleStimulusPage.prototype.render = function (_parent) {  
  var div = $("<div></div>");
  _parent.append(div);

  var content; 
  if(this.pageConfig.content === null){
    content ="";
  } else {
    content = this.pageConfig.content;
  }
  
  var p = $("<p>" + content + "</p>");
  div.append(p);

  if (this.pageConfig.video) {
    this.videoUrl = this.pageConfig.video;
    this.videoWidth = this.pageConfig.videoWidth || 960;
    this.videoHeight = this.pageConfig.videoHeight || 540;
    var videoDiv = $('<video id="video_' + this.pageConfig.id + '" muted width="' + this.videoWidth + '" height="' + this.videoHeight + '" style="display:block; margin:0 auto;"><source src="' + this.videoUrl + '" type="video/mp4"></video><br>');
    div.append(videoDiv);
  }
      
  if (this.pageConfig.showWaveform === true) {
    var waveform = $("<p></p>");
    div.append(waveform);
    
    this.waveformVisualizer = new WaveformVisualizer(this.pageManager.getPageVariableName(this) + ".waveformVisualizer", waveform, this.stimulus, this.pageConfig.showWaveform, false, this.filePlayer.genericAudioControl);
    this.waveformVisualizer.create();
    this.waveformVisualizer.load();
  }
  this.filePlayer.render(_parent);

  
  this.likerts.map(function(l) {l.render(_parent);});
  
  this.fpc = new FilePlayerController(this.filePlayer);
  this.fpc.bind();
};

LikertSingleStimulusPage.prototype.load = function () {  
  this.startTimeOnPage = new Date();
  if(this.pageConfig.mustRate == true){
    this.pageTemplateRenderer.lockNextButton();
  }
  if(this.results.length > 0){
    for (var i = 0; i < this.likerts.length; ++i) {
      $("input[name='"+this.likerts[i].prefix +"_response'][value='"+this.results[i]+"']").attr("checked", "checked");
      $("input[name='"+this.likerts[i].prefix +"_response'][value='"+this.results[i]+"']").checkboxradio("refresh");
      this.likerts[i].group.change();
    }
  }
  
  this.filePlayer.init();

  if (this.pageConfig.video) {
    this.videoInterval = setInterval((function() {
      var video = document.getElementById("video_" + this.pageConfig.id);
      if (!video) return;
      var index = this.filePlayer.genericAudioControl.audioStimulusIndex;
      var isAudioPlaying = (index !== null);
      if (isAudioPlaying) {
         if (video.paused) video.play();
         var currentPos = this.filePlayer.genericAudioControl.audioCurrentPositions[index];
         var audioTime = currentPos / this.audioContext.sampleRate;
         if (Math.abs(video.currentTime - audioTime) > 0.1) {
             video.currentTime = audioTime;
         }
      } else {
         if (!video.paused) video.pause();
      }
    }).bind(this), 50);
  }
};

LikertSingleStimulusPage.prototype.save = function () {
  this.fpc.unbind(); 
  this.time += (new Date() - this.startTimeOnPage);
  
  for (var i = 0; i < this.likerts.length; ++i) {
    this.results[i] = $("input[name='"+this.likerts[i].prefix +"_response']:checked").val();
  }
  
  this.filePlayer.free();

  if (this.videoInterval) {
    clearInterval(this.videoInterval);
    this.videoInterval = null;
  }
};

LikertSingleStimulusPage.prototype.store = function (_reponsesStorage) {
  var trial = this.session.getTrial(this.pageConfig.type, this.pageConfig.id);
  if (trial === null) {
    trial = new Trial();
    trial.type = this.pageConfig.type;
    trial.id = this.pageConfig.id;
    this.session.trials[this.session.trials.length] = trial;
  }
  var rating = new LikertSingleStimulusRating();
  rating.stimulus = this.stimulus.id;
  
  rating.stimulusRating = [];
  for(var i = 0; i < this.likerts.length; ++i){
    if(this.results[i] === undefined){
      rating.stimulusRating.push("NA");
    }else{
      rating.stimulusRating.push(this.results[i]);
    }
  }
      
  rating.time = this.time;
  trial.responses[trial.responses.length] = rating;


};
