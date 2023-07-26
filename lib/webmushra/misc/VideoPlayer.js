function VideoPlayer(_videoElementId, _srcUrl, _srcType, _mushraAudioControl) {
    this.videoElementId = _videoElementId;
    this.srcUrl = _srcUrl;
    this.srcType = _srcType;
    this.mushraAudioControl = _mushraAudioControl;
    this.video = null;

    this.numberEventListener = this.mushraAudioControl.addEventListener((function (_event) {
        if (_event.name == 'processUpdate') {
            var audioCurrentTime = this.mushraAudioControl.audioCurrentPosition / this.mushraAudioControl.audioSampleRate;
            var videoCurrentTime = this.video.currentTime;
            // console.log("videoCurrentTime: " + videoCurrentTime);
            // console.log("audioCurrentTime: " + audioCurrentTime);
            if (Math.abs(videoCurrentTime - audioCurrentTime) > 0.100) {
                console.log("video and audio are out of sync");
                this.synchronize();
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
    xhr.responseType = "arraybuffer";

    xhr.onload = function (oEvent) {
        var blob = new Blob([oEvent.target.response], {type: this.srcType});
        this.video.src = URL.createObjectURL(blob);
        console.log("video downloaded");
    };
    xhr.send();
}

VideoPlayer.prototype.play = function () {
    this.synchronize();
    this.video.play();
};

VideoPlayer.prototype.pause = function () {
    this.video.pause();
};

VideoPlayer.prototype.stop = function () {
    this.video.pause();
    this.video.currentTime = 0;
};

VideoPlayer.prototype.synchronize = function () {
    var currentPos = this.mushraAudioControl.audioCurrentPosition;
    var calcCurrentTime = currentPos / this.mushraAudioControl.audioSampleRate;
    // console.log("calcCurrentTime = " + calcCurrentTime);
    // console.log("currentTime = " + this.video.currentTime);
    this.video.currentTime = calcCurrentTime;
}
