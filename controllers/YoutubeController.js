const models = require("../models");
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const {google} = require('googleapis');
const OAuth2 = google.auth.OAuth2;

let youtubeController = {};
let authGlobal;

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/youtube-nodejs-quickstart.json
let SCOPES = ['https://www.googleapis.com/auth/youtube.readonly'];
const TOKEN_DIR = path.join(__dirname, '../.credentials');
let TOKEN_PATH = TOKEN_DIR + '/youtube-nodejs-quickstart.json';
// Load client secrets from a local file.
fs.readFile('youtube-client-secret.json', function processClientSecrets(err, content) {
  if (err) {
    console.log('Error loading client secret file: ' + err);
    return;
  }
  // Authorize a client with the loaded credentials, then call the YouTube API.
  authorize(JSON.parse(content), getChannel);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  let clientSecret = credentials.installed.client_secret;
  let clientId = credentials.installed.client_id;
  let redirectUrl = credentials.installed.redirect_uris[0];
  let oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function(err, token) {
    if (err) {
      getNewToken(oauth2Client, callback);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      authGlobal = oauth2Client;
      callback(oauth2Client);
    }
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
  let authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', function(code) {
    rl.close();
    oauth2Client.getToken(code, function(err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
      callback(oauth2Client);
      authGlobal = oauth2Client;
    });
  });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
    if (err) throw err;
    console.log('Token stored to ' + TOKEN_PATH);
  });
}

/**
 * Lists the names and IDs of up to 10 files.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function getChannel(auth) {
}

youtubeController.getHome = (req, res) => {
  let service = google.youtube('v3');
  service.videos.list({
    auth: authGlobal,
    part: "snippet,contentDetails,statistics",
    chart: "mostPopular",
    regionCode: "US"
  }, (err, results) => {
    let dataItems = [], firstList = [], otherList = [];
    if(results != undefined) {
      dataItems = results.data.items;
      if(dataItems != null && dataItems.length > 0) {
        for (let index = 0; index < dataItems.length; index++) {
          if(index == 0){
            firstList.push(dataItems[index]);
          } else {
            const element = dataItems[index];
            otherList.push(element);
          }       
        }
      }
      res.render('./youtube/home', {title: 'Home', errorDescription: '', isCardType: ((req.session.LoggedIn["isCardType"] != undefined && req.session.LoggedIn["isCardType"] == false) ? false : true), totalList: dataItems, relatedList: otherList, playList: firstList});
    }  else {
      res.render('./youtube/home', {title: 'Home', errorDescription: 'Error On youtube integration.', isCardType: ((req.session.LoggedIn["isCardType"] != undefined && req.session.LoggedIn["isCardType"] == false) ? false : true), totalList: dataItems, relatedList: otherList, playList: firstList});
    }   
  });
};

youtubeController.getFavorites = (req, res) => {
  let service = google.youtube('v3');

  models.YoutubeFavorite.findAll({raw: true, where: {user_id: req.session.LoggedIn.id}}).then(function(youtubeFavorites) {
    if(youtubeFavorites.length > 0){

      let videoIds = [];

      for(let i =0; i < youtubeFavorites.length; i++) {
        videoIds.push(youtubeFavorites[i].videoId);
      }

      service.videos.list({
        auth: authGlobal,
        part: "snippet,contentDetails,statistics",
        id: videoIds.join(",")
      }, (err, results) => {
        let dataItems = [], firstList = [], otherList = [];
        if(results != undefined) {
          dataItems = results.data.items;
          if(dataItems != null && dataItems.length > 0) {
            for (let index = 0; index < dataItems.length; index++) {
              if(index == 0){
                firstList.push(dataItems[index]);
              } else {
                const element = dataItems[index];
                otherList.push(element);
              }       
            }
          }
          res.render('./youtube/favorites', {title: 'Favorites', errorDescription: '', isCardType: ((req.session.LoggedIn["isCardType"] != undefined && req.session.LoggedIn["isCardType"] == false) ? false : true), totalList: dataItems, relatedList: otherList, playList: firstList});
        }  else {
          res.render('./youtube/favorites', {title: 'Favorites', errorDescription: 'Error On youtube integration.', isCardType: ((req.session.LoggedIn["isCardType"] != undefined && req.session.LoggedIn["isCardType"] == false) ? false : true), totalList: dataItems, relatedList: otherList, playList: firstList});
        }   
      });
    } else {
      res.render('./youtube/favorites', {title: 'Favorites', errorDescription: 'No Favorites.', isCardType: ((req.session.LoggedIn["isCardType"] != undefined && req.session.LoggedIn["isCardType"] == false) ? false : true), totalList: dataItems, relatedList: otherList, playList: firstList});
    }    
  });
};

youtubeController.onPlayHome = (req, res) => {
  let dataItems = [], firstList = [], otherList = [];
  if(req.body != undefined && req.body["videoTotalList"]) {
    dataItems = JSON.parse(req.body["videoTotalList"]);
    if(dataItems != null && dataItems.length > 0) {
      for (let index = 0; index < dataItems.length; index++) {
        let videoId = dataItems[index].id["videoId"] != undefined ? dataItems[index].id["videoId"] : dataItems[index].id;
        if(videoId == req.body["searchVideo"]){
          firstList.push(dataItems[index]);
        } else {
          const element = dataItems[index];
          otherList.push(element);
        }       
      }
    }
    res.render('./youtube/home', {title: 'Home', errorDescription: '', isCardType: false, totalList: dataItems, relatedList: otherList, playList: firstList});
  }  else {
    res.render('./youtube/home', {title: 'Home', errorDescription: 'Error On youtube integration.', isCardType: false, totalList: dataItems, relatedList: otherList, playList: firstList});
  }
};

youtubeController.getSearchVideo = (req, res) => {
  let service = google.youtube('v3');
  service.search.list({
    auth: authGlobal,
    part: 'snippet',    
    q: req.params.id,
    type: 'video',
    maxResults: 25,
  }, (err, results) => {
    let dataItems = [], firstList = [], otherList = [];
    if(results != undefined) {
      dataItems = results.data.items;
      if(dataItems != null && dataItems.length > 0) {
        for (let index = 0; index < dataItems.length; index++) {
          if(index == 0){
            firstList.push(dataItems[index]);
          } else {
            const element = dataItems[index];
            otherList.push(element);
          }       
        }
      }
      res.render('./youtube/home', {title: 'Home', errorDescription: '', isCardType: ((req.session.LoggedIn["isCardType"] != undefined && req.session.LoggedIn["isCardType"] == false) ? false : true), totalList: dataItems, relatedList: otherList, playList: firstList});
    }  else {
      res.render('./youtube/home', {title: 'Home', errorDescription: 'Error On youtube integration.', isCardType: ((req.session.LoggedIn["isCardType"] != undefined && req.session.LoggedIn["isCardType"] == false) ? false : true), totalList: dataItems, relatedList: otherList, playList: firstList});
    }   
  });
};

youtubeController.getLangugeVideo = (req, res) => {
  let service = google.youtube('v3');
  service.videos.list({
    auth: authGlobal,
    part: 'snippet',    
    hl: req.params.id,
    regionCode: req.params.id == "ta" ? "IN" : "US"
  }, (err, results) => {
    let dataItems = [], firstList = [], otherList = [];
    if(results != undefined) {
      dataItems = results.data.items;
      if(dataItems != null && dataItems.length > 0) {
        for (let index = 0; index < dataItems.length; index++) {
          if(index == 0){
            firstList.push(dataItems[index]);
          } else {
            const element = dataItems[index];
            otherList.push(element);
          }       
        }
      }      
      res.render('./youtube/home', {title: 'Home', errorDescription: '', isCardType: ((req.session.LoggedIn["isCardType"] != undefined && req.session.LoggedIn["isCardType"] == false) ? false : true), totalList: dataItems, relatedList: otherList, playList: firstList});
    }  else {
      res.render('./youtube/home', {title: 'Home', errorDescription: 'Error On youtube integration.', isCardType: ((req.session.LoggedIn["isCardType"] != undefined && req.session.LoggedIn["isCardType"] == false) ? false : true), totalList: dataItems, relatedList: otherList, playList: firstList});
    }   
  });
};

youtubeController.addToFavorite = (req, res) => {
  let request = {
    user_id: req.session.LoggedIn.id,
    videoId: req.body.id
  }
  models.YoutubeFavorite.create(request).then(function(youtubeFavoriteEntity) {
    const dataObj = youtubeFavoriteEntity.get({plain:true})
    console.log("YoutubeFavorite", dataObj);
    res.send({ isError:  false})
  });
};

youtubeController.removeToFavorite = (req, res) => {
  models.YoutubeFavorite.destroy({
    where: {
      videoId: req.body.id
    }
  }).then(function(youtubeFavoriteEntity) {
    res.send({ isError:  false})
  });
};

youtubeController.checkFavorite = (req, res) => {
  models.YoutubeFavorite.findAll({raw: true, where: {videoId: req.params.id}}).then(function(youtubeFavorites) {
    if(youtubeFavorites.length > 0){
      res.send({ isAdded: true})
    } else {
      res.send({ isAdded: false})
    }    
  });
};

module.exports = youtubeController;