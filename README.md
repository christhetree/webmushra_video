# webMUSHRA Video

Author: [christhetree](https://github.com/christhetree)

This is a modified version of webMUSHRA that enables MUSHRA tests to be held with accompanying video files.
It adds the following features:
* Video pre-loading, synchronization, seeking, and looping
* Custom URL parameters for compatibility with Prolific
* Accurate time tracking per page (accounts for video loading time)
* Custom user comments at a video level of granularity
* User-visible error messages and loading spinners
* Data validation
* Require users to listen to each condition at least once
* Require users to move each rating scale at least once
* Support for mean opinion score (MOS) tests with video (coming soon)

Some benefits of this implementation are the following:
* Videos do not have to be hosted on a third-party site, giving the user full control over deployment and privacy
* Videos are automatically loaded in their entirety which enables seamless synchronization with the audio files and prevents buffering / connectivity issues
* Videos are decoupled from the audio tracks which prevents duplicate videos and enables lossless audio codecs to be used
* Additional feedback can be captured at a video-level of granularity
* Can be easily deployed as a study on Prolific through the use of custom URL parameters and revealing a completion code at the end

## Local Quickstart Guide (macOS)
1. `git clone git@github.com:christhetree/webmushra_video.git`
2. `cd webmushra_video`
3. `brew install php`
4. `php -S localhost:8000`
5. Open a browser and go to `http://localhost:8000/?config=webmushra_video_example.yaml`
6. Copy the example `webmushra_video_example.yaml` file and make the changes needed for your experiment.
7. Local results upon successful completion of the test are written to `results/webmushra_video_example/mushra.csv`

## Server Quickstart Guide (Apache)
1. TBD

## Notes

If there is an error in your config file, the "downloading all audio tracks" spinner will be displayed endlessly. 
You can view the errors by right-clicking in your browser, selecting "inspect" and then clicking on the "console" tab to see what went wrong.
You can also see the errors in the command line window where the local php server was launched from.

Example video and audio attribution: TV BrasilGov, CC BY 3.0 <https://creativecommons.org/licenses/by/3.0>, via Wikimedia Commons

# Original webMUSHRA README starts here:

[![GitHub release](https://img.shields.io/github/release/audiolabs/webMUSHRA.svg)](https://github.com/audiolabs/webMUSHRA/releases/latest)
[![Github All Releases](https://img.shields.io/github/downloads/audiolabs/webMUSHRA/total.svg)](https://github.com/audiolabs/webMUSHRA/releases/latest)
[![Build Status](https://travis-ci.org/audiolabs/webMUSHRA.svg?branch=master)](https://travis-ci.org/audiolabs/webMUSHRA)
[![DOI](https://zenodo.org/badge/81722942.svg)](https://zenodo.org/badge/latestdoi/81722942)

a MUltiple Stimuli with Hidden Reference and Anchor ([MUSHRA](https://en.wikipedia.org/wiki/MUSHRA)) compliant web audio API based experiment software.

<img width="1011" alt="screen shot 2017-03-08 at 12 38 20" src="https://cloud.githubusercontent.com/assets/72940/23702580/2a49bc82-03fc-11e7-99ea-22d550604a73.png">

## Introduction

Listening tests are widely used to assess the quality of audio systems. In the last few years, conducting listening experiments over the Internet, as so called web-based experiments, has become popular. Until now, it was only possible to implement a limited number of listening test types as web-based experiments because web standards were missing some crucial features, e.g. sample manipulation of audio streams. MUSHRA tests are designed to compare the audio quality of several test conditions with intermediate impairments to a high quality reference. With the rise of [Web Audio API](http://webaudio.github.io/web-audio-api/), for the first time MUSHRA experiments can be carried out within the web browser while at the same time being compliant to the ITU-R Recommendation BS.1534 (MUSHRA).

##### [View Demo](https://audiolabs.github.io/webMUSHRA)


### Download

We provide two version of webMUSHRA.

* __webMUSHRA__ provides the version targeted for normal usage and experimenters. The javascript files are compressed which makes it faster to load/serve. The documentation is provided as PDFs.

* __webMUSHRA-dev__ is targeted to developers and experienced users who want to customize experiments. This version is comparable to cloning the git repository

[Download Package Here](https://github.com/audiolabs/webMUSHRA/releases/latest)

## Features

* page based experiments supporting:
  * MUSHRA (ITU-R BS.1534)
  * AB (ITU-R BS.1116)
  * Likert scale questionaires
  * training/introduction
  * spatial attributes, such as ASW, LEV, and localization (experimental)
* compliant to ITU recommendations (looping, fade-in/out, sample accurate switching)
* finish page to gather the results and send them to a provided PHP service
* client side processing using the Web Audio API
* simple configuration using YAML preference files
* automatically generates ITU-R compliant lower anchor files on the fly
* keyboard shortcuts for interaction with main UI elements

## Supported Browsers

 * Google Chrome on Windows, Mac and Linux
 
## Getting started: Setting up webMUSHRA using PHP's builtin webserver

To load audio files and save the results as csv text files, webMUSHRA needs to run on a web server. If you already have `php` installed on your system (for example on Mac OS X), you can run a php development server on port 8000 from the terminal using `php -S localhost:8000`.

Now you can run webMUSHRA using the following URL: http://localhost:8000

The experiment configurations are stored in the `configs/` folder. To load a configuration/experiment, specify the `config` argument in the url http://localhost:8000/?config=mushra_showresults.yaml. `configs/default.yaml` is the configuration loaded when no config is specified.

### Docker

You can use docker to set up webMUSHRA quickly. Just run
`docker-compose -f docker-compose.yml build` to build the webMUSHRA docker container.

To run the container use webMUSHRA `docker-compose -f docker-compose.yml up`. We configured the docker image so that the `configs` and the `results` folder is mounted inside the container so that you can modify it on the fly and receive results within the `results` folder.

#### Note for Docker on Windows

When using Docker Toolbox/Machine on Windows, volume paths (to mount the `configs` and `results` folder) are not converted by default. To enable this conversion set the environment variable COMPOSE_CONVERT_WINDOWS_PATHS=1 e.g. by `env:COMPOSE_CONVERT_WINDOWS_PATHS=1` in the power shell.

### Apache + PHP
Another custom way to run webMUSHRA would be to install a complete web server stack like [XAMPP](https://www.apachefriends.org/download.html).

### Python Backend
A python based backend to save the results in provided by [pymushra](https://github.com/nils-werner/pymushra).

#### Change or add a configuration

webMUSHRA uses [YAML](https://en.wikipedia.org/wiki/YAML) to configure experiments. Since YAML is using whitespace indentation (no tab characters!), we recommend to use a text editor like [Atom](http://atom.io) that ships with YAML support.

A simple MUSHRA test in YAML looks like this:

```yaml
pages:
  - type: mushra
    id: Item 1
    name: Orchestra
    content: Add additional notes for the participants
    showWaveform: true
    reference: reference.wav
    createAnchor35: true
    createAnchor70: true
    stimuli:
      C1: codec1.wav
      C2: codec2.wav
      C3: codec3.wav
```

The specific parameters are described in the [Experimenters Manual](doc/experimenter.md).

## Documentation

 * [Experimenters Manual](doc/experimenter.md)
 * [Participants Manual](doc/participant.md)

## Citation

If you use webMUSHRA in your publication, please cite it using the following reference:

> Schoeffler, M. et al., (2018). webMUSHRA — A Comprehensive Framework for Web-based Listening Tests. Journal of Open Research Software. 6(1), p.8.

## References

* [Journal of Open Research Software Paper](http://doi.org/10.5334/jors.187)
* [Web Audio Conference 2015 Paper](http://wac.ircam.fr/pdf/wac15_submission_8.pdf)
* [Web Audio Conference 2015 Presentation](http://www.audiolabs-erlangen.de/content/resources/webMUSHRA/slides.html#/)

## Copyright/Licence

(C) AudioLabs 2020

This source code is protected by copyright law and international treaties. This source code is made available to you subject to the terms and conditions of the Software License for the webMUSHRA.js Software. Said terms and conditions have been made available to you prior to your download of this source code. By downloading this source code you agree to be bound by the above mentionend terms and conditions, which can also be found [here.](LICENSE.txt)
Any unauthorised use of this source code may result in severe civil and criminal penalties, and will be prosecuted to the maximum extent possible under law.
