function VideoPlayer(_videoElementId, _srcUrl, _srcType, _mushraAudioControl) {
    this.videoElementId = _videoElementId;
    this.srcUrl = _srcUrl;
    this.srcType = _srcType;
    this.mushraAudioControl = _mushraAudioControl;
    this.video = null;
    this.finishedLoading = false;
    this.timeFinishedLoading = null;

    this.numberEventListener = this.mushraAudioControl.addEventListener((function (_event) {
        if (this.canPlay() && _event.name == 'processUpdate') {
            var audioCurrentTime = this.mushraAudioControl.audioCurrentPosition / this.mushraAudioControl.audioSampleRate;
            var videoCurrentTime = this.video.currentTime;
            // console.log("videoCurrentTime: " + videoCurrentTime);
            // console.log("audioCurrentTime: " + audioCurrentTime);
            if (Math.abs(videoCurrentTime - audioCurrentTime) > 0.100) {
                // console.log("video and audio are out of sync");
                this.synchronize();
            }
            // Handle case when audio is done but video starts over from the beginning
            if (!this.mushraAudioControl.audioPlaying) {
                this.pause();
            }
        }
    }).bind(this));
}

VideoPlayer.prototype.create = function () {

}

VideoPlayer.prototype.load = function () {
    this.video = document.getElementById(this.videoElementId);

    var xhr = new XMLHttpRequest();
    xhr.open("GET", this.srcUrl, true);
    xhr.srcType = this.srcType;
    xhr.video = this.video;
    xhr.parent = this;
    xhr.responseType = "arraybuffer";

    xhr.onload = function (oEvent) {
        // await new Promise(r => setTimeout(r, 6000));
        var blob = new Blob([oEvent.target.response], {type: this.srcType});
        this.video.src = URL.createObjectURL(blob);
        this.parent.finishedLoading = true;
        this.parent.timeFinishedLoading = new Date();
        console.log("video finished downloading");
    };
    xhr.send();
}

VideoPlayer.prototype.play = function () {
    if (this.canPlay()) {
        this.synchronize();
        this.video.play();
    }
};

VideoPlayer.prototype.pause = function () {
    if (this.canPlay() && !this.video.paused) {
        this.video.pause();
    }
};

VideoPlayer.prototype.stop = function () {
    if (this.canPlay()) {
        this.video.pause();
        this.video.currentTime = 0;
    }
};

VideoPlayer.prototype.synchronize = function () {
    if (this.canPlay()) {
        var currentPos = this.mushraAudioControl.audioCurrentPosition;
        var calcCurrentTime = currentPos / this.mushraAudioControl.audioSampleRate;
        // console.log("calcCurrentTime = " + calcCurrentTime);
        // console.log("currentTime = " + this.video.currentTime);
        this.video.currentTime = calcCurrentTime;
    }
}

VideoPlayer.prototype.canPlay = function () {
    return this.finishedLoading;
}
